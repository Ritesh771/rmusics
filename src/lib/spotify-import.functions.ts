import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { AwsClient } from "aws4fetch";
import * as musicMetadata from "music-metadata";

export interface SpotifyTrackMeta {
  uri: string;
  title: string;
  artist: string;
  duration: number;
  coverUrl?: string;
  album?: string;
}

export interface SpotifyPlaylistData {
  id: string;
  name: string;
  description?: string;
  coverArt?: string;
  totalCount: number;
  tracks: SpotifyTrackMeta[];
}

function extractPlaylistId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/playlist[/:]([a-zA-Z0-9]{22})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;
  throw new Error("Invalid Spotify playlist URL. Please paste a valid public Spotify playlist link.");
}

export function normalizeSongText(str: string): string {
  return (str || "")
    .replace(/\s*-\s*SpotubeDL\.com/gi, "")
    .replace(/\s*[\(\[\{].*?[\)\]\}]\s*/g, " ")
    .replace(/[^a-z0-9]/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function generateTOTP(secretBuffer: Buffer, timestampMs: number): string {
  const period = 30;
  const counter = Math.floor(timestampMs / 1000 / period);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", secretBuffer).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = ((hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, "0");
  return code;
}

// Fetches real playlist title, description, and cover image using multiple redundant strategies
async function fetchPlaylistMetadata(playlistId: string): Promise<{
  name: string;
  description?: string;
  coverArt?: string;
}> {
  // Strategy 1: Embed page __NEXT_DATA__ (has original title, author subtitle, and original cover)
  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
      if (match) {
        const json = JSON.parse(match[1]);
        const entity = json?.props?.pageProps?.state?.data?.entity;
        const name = entity?.name || entity?.title;
        if (name && !name.includes("Spotify – Web Player")) {
          const coverArt =
            entity?.coverArt?.sources?.[0]?.url ||
            entity?.visualIdentity?.image?.[0]?.url ||
            undefined;
          return {
            name,
            description: entity?.subtitle || `Spotify playlist by ${entity?.subtitle || "User"}`,
            coverArt,
          };
        }
      }
    }
  } catch {}

  // Strategy 2: Official Spotify oEmbed endpoint
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.title && !data.title.includes("Spotify – Web Player")) {
        return {
          name: data.title,
          description: `Imported from Spotify playlist (${data.title})`,
          coverArt: data.thumbnail_url || undefined,
        };
      }
    }
  } catch {}

  // Strategy 3: Bot OpenGraph meta tags
  try {
    const res = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
      const ogDesc = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1];
      const ogImg = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      if (ogTitle && !ogTitle.includes("Spotify – Web Player")) {
        return {
          name: ogTitle,
          description: ogDesc || "",
          coverArt: ogImg || undefined,
        };
      }
    }
  } catch {}

  return {
    name: "Imported Spotify Playlist",
    description: "",
    coverArt: undefined,
  };
}

// Scrapes Spotify using Web Player GraphQL API with automatic pagination (supporting 200+ tracks)
async function fetchViaSpotifyGraphQL(
  playlistId: string,
  meta: { name: string; description?: string; coverArt?: string }
): Promise<SpotifyPlaylistData> {
  const userAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

  // 1. Fetch playlist page to get cookies and appServerConfig
  const pageRes = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!pageRes.ok) {
    throw new Error(`Failed to access Spotify playlist: HTTP ${pageRes.status}`);
  }

  const html = await pageRes.text();
  const setCookie = pageRes.headers.get("set-cookie") || "";
  const cookies = setCookie
    .split(",")
    .map((c) => c.split(";")[0])
    .join("; ");

  // Extract serverTime & clientVersion from appServerConfig
  const cfgMatch = html.match(/<script id="appServerConfig"[^>]*>([A-Za-z0-9+/=\s]+)<\/script>/);
  let serverTime: number | null = null;
  let clientVersion = "1.3.9.19.g9dcd02e21637";
  if (cfgMatch) {
    try {
      const jsonStr = Buffer.from(cfgMatch[1].replace(/\s+/g, ""), "base64").toString("utf8");
      const cfg = JSON.parse(jsonStr);
      serverTime = cfg.serverTime;
      clientVersion = cfg.clientVersion || clientVersion;
    } catch {}
  }

  // Generate TOTP tokens
  const activeSecret = { secret: ',7/*F("rLJ2oxaKL^f+E1xvP@N', version: 61 };
  const r = activeSecret.secret.split("").map((c, idx) => c.charCodeAt(0) ^ ((idx % 33) + 9));
  const secretBuffer = Buffer.from(r.join(""), "utf8");

  const totp = generateTOTP(secretBuffer, Date.now());
  const totpServer = serverTime ? generateTOTP(secretBuffer, serverTime * 1000) : "unavailable";

  // 2. Request anonymous access token
  const tokenUrl = new URL("https://open.spotify.com/api/token");
  tokenUrl.searchParams.set("reason", "init");
  tokenUrl.searchParams.set("productType", "web_player");
  tokenUrl.searchParams.set("totp", totp);
  tokenUrl.searchParams.set("totpServer", totpServer);
  tokenUrl.searchParams.set("totpVer", String(activeSecret.version));

  const tokenRes = await fetch(tokenUrl.toString(), {
    headers: {
      "User-Agent": userAgent,
      Referer: `https://open.spotify.com/playlist/${playlistId}`,
      Accept: "application/json",
      "spotify-app-version": clientVersion,
      "app-platform": "WebPlayer",
      Cookie: cookies,
    },
  });

  if (!tokenRes.ok) {
    throw new Error(`Spotify token error: HTTP ${tokenRes.status}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.accessToken;
  if (!accessToken) {
    throw new Error("Did not receive Spotify access token");
  }

  // 3. Paginate through all tracks via pathfinder GraphQL
  const hash = "21ea11a6ac75a5f3e01fd365d29c18e0a4a8b7dc09f89bbb5d73910190c6acaf";
  const tracks: SpotifyTrackMeta[] = [];
  let offset = 0;
  let totalCount = 0;

  while (offset === 0 || offset < totalCount) {
    const queryUrl = new URL("https://api-partner.spotify.com/pathfinder/v1/query");
    queryUrl.searchParams.set("operationName", "fetchPlaylistContents");
    queryUrl.searchParams.set(
      "variables",
      JSON.stringify({
        uri: `spotify:playlist:${playlistId}`,
        offset: offset,
        limit: 50,
      })
    );
    queryUrl.searchParams.set(
      "extensions",
      JSON.stringify({
        persistedQuery: {
          version: 1,
          sha256Hash: hash,
        },
      })
    );

    const qRes = await fetch(queryUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": userAgent,
        "app-platform": "WebPlayer",
        Accept: "application/json",
      },
    });

    if (!qRes.ok) break;

    const qData = await qRes.json();
    const playlistObj = qData?.data?.playlistV2;
    if (!playlistObj) break;

    const content = playlistObj.content;
    if (content?.totalCount) totalCount = content.totalCount;

    const items = content?.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      const data = item.itemV2?.data;
      if (!data) continue;

      const title = data.name || "Unknown Track";
      const artists = (data.artists?.items || [])
        .map((a: any) => a.profile?.name)
        .filter(Boolean)
        .join(", ");
      const album = data.albumOfTrack?.name || data.album?.name || "";
      const duration = Math.round((data.trackDuration?.totalMilliseconds || 0) / 1000);
      const sources = data.albumOfTrack?.coverArt?.sources || data.album?.coverArt?.sources || [];
      const trackCoverUrl = sources.length > 0 ? sources[sources.length - 1].url : undefined;

      tracks.push({
        uri: data.uri || `spotify:track:${data.id || ""}`,
        title,
        artist: artists || "Unknown Artist",
        album,
        duration,
        coverUrl: trackCoverUrl,
      });
    }

    offset += items.length;
    if (offset >= totalCount && totalCount > 0) break;
  }

  return {
    id: playlistId,
    name: meta.name,
    description: meta.description,
    coverArt: meta.coverArt,
    totalCount: totalCount || tracks.length,
    tracks,
  };
}

// Fallback: Embed scraper (up to 100 tracks)
async function fetchViaSpotifyEmbed(
  playlistId: string,
  meta: { name: string; description?: string; coverArt?: string }
): Promise<SpotifyPlaylistData> {
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const res = await fetch(embedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!res.ok) {
    throw new Error(`Spotify responded with HTTP ${res.status}. Please check if the playlist is public.`);
  }

  const html = await res.text();
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
  if (!match) {
    throw new Error("Unable to parse Spotify playlist metadata. Make sure the playlist link is public.");
  }

  const json = JSON.parse(match[1]);
  const entity = json?.props?.pageProps?.state?.data?.entity;
  if (!entity) {
    throw new Error("No playlist data returned by Spotify. Please verify the URL.");
  }

  const tracks: SpotifyTrackMeta[] = (entity.trackList || []).map((t: any) => ({
    uri: t.uri || "",
    title: t.title || "Unknown Track",
    artist: t.subtitle || "Unknown Artist",
    duration: Math.round((t.duration || 0) / 1000),
  }));

  return {
    id: entity.id || playlistId,
    name: meta.name !== "Imported Spotify Playlist" ? meta.name : entity.name || entity.title || meta.name,
    description: meta.description || entity.subtitle || "",
    coverArt: meta.coverArt || entity.coverArt?.sources?.[0]?.url || undefined,
    totalCount: tracks.length,
    tracks,
  };
}

export const fetchSpotifyPlaylist = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ url: z.string().min(5) }).parse(input))
  .handler(async ({ data }) => {
    const playlistId = extractPlaylistId(data.url);

    // Always fetch playlist metadata (name, description, original playlist cover art) first
    const meta = await fetchPlaylistMetadata(playlistId);

    try {
      // First attempt: GraphQL API supporting full 200+ tracks
      const fullData = await fetchViaSpotifyGraphQL(playlistId, meta);
      if (fullData.tracks.length > 0) {
        return fullData;
      }
    } catch (e: any) {
      console.warn("GraphQL Spotify scrape failed, falling back to embed:", e.message);
    }

    // Fallback: Embed scraper
    return await fetchViaSpotifyEmbed(playlistId, meta);
  });

// Setup R2 Client
function getR2Client() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("R2 credentials not properly configured on server.");
  }

  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto",
  });

  return { client, accountId, bucket, publicUrl };
}

async function uploadToR2(
  r2: ReturnType<typeof getR2Client>,
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
) {
  const endpoint = `https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucket}/${key}`;
  const res = await r2.client.fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body,
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
  }
  return `${r2.publicUrl}/${key}`;
}

const importAndSyncSchema = z.object({
  playlistName: z.string().min(1),
  playlistDescription: z.string().optional(),
  coverArt: z.string().optional(),
  userId: z.string().min(1),
  tracks: z.array(
    z.object({
      title: z.string(),
      artist: z.string(),
      album: z.string().optional(),
      duration: z.number().optional(),
      coverUrl: z.string().optional(),
    })
  ),
});

export const importAndSyncSpotifyPlaylist = createServerFn({ method: "POST" })
  .inputValidator((input) => importAndSyncSchema.parse(input))
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured on server.");
    }

    // 1. Fetch all existing songs from Supabase for deduplication
    const songsRes = await fetch(`${supabaseUrl}/rest/v1/songs?select=id,title,artist`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    if (!songsRes.ok) {
      throw new Error(`Failed to query songs library: ${songsRes.status}`);
    }
    const dbSongs: Array<{ id: string; title: string; artist: string }> = await songsRes.json();

    const r2 = getR2Client();
    const finalSongIds: string[] = [];
    let newlyDownloaded = 0;

    for (const track of data.tracks) {
      const targetT = normalizeSongText(track.title);
      const targetA = normalizeSongText(track.artist);

      // Deduplication check: Match against DB
      const existingMatch = dbSongs.find((db) => {
        const dbT = normalizeSongText(db.title);
        const dbA = normalizeSongText(db.artist);
        if (targetT === dbT) return true;
        if (targetT.length >= 4 && (targetT.includes(dbT) || dbT.includes(targetT))) {
          const firstA = targetA.split(" ")[0];
          if (firstA && (dbA.includes(firstA) || firstA.includes(dbA.split(" ")[0]))) {
            return true;
          }
        }
        return false;
      });

      if (existingMatch) {
        finalSongIds.push(existingMatch.id);
        continue;
      }

      // If missing: Download audio, upload to R2, and insert into Supabase
      console.log(`[Spotify Sync] Downloading missing song: "${track.title}" - ${track.artist}`);
      const tempDir = path.join(
        os.tmpdir(),
        `sonara_sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
      );
      fs.mkdirSync(tempDir, { recursive: true });

      try {
        const outTemplate = path.join(tempDir, "audio.%(ext)s");
        const query = `${track.title} ${track.artist} song audio`;

        try {
          execSync(
            `yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${query.replace(/"/g, "")}"`,
            { stdio: "ignore", timeout: 45000 }
          );
        } catch {
          execSync(
            `yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${track.title.replace(/"/g, "")} ${track.artist.replace(/"/g, "")}"`,
            { stdio: "ignore", timeout: 45000 }
          );
        }

        const files = fs.readdirSync(tempDir);
        const audioFile = files.find((f) => f.startsWith("audio."));
        if (!audioFile) {
          throw new Error(`Audio download failed for ${track.title}`);
        }

        const audioPath = path.join(tempDir, audioFile);
        const audioBuffer = fs.readFileSync(audioPath);

        let duration = track.duration || 180;
        try {
          const metaData = await musicMetadata.parseFile(audioPath);
          if (metaData.format.duration) duration = Math.round(metaData.format.duration);
        } catch {}

        // Download cover image
        let coverBuffer: Buffer | null = null;
        if (track.coverUrl) {
          try {
            const cRes = await fetch(track.coverUrl);
            if (cRes.ok) coverBuffer = Buffer.from(await cRes.arrayBuffer());
          } catch {}
        }

        const timestamp = Date.now();
        const rand = Math.random().toString(36).slice(2, 7);
        const safeSlug = track.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);

        const audioKey = `songs/${timestamp}-${rand}-${safeSlug}.m4a`;
        const audioUrl = await uploadToR2(r2, audioKey, audioBuffer, "audio/mp4");

        let coverUrl: string | null = null;
        if (coverBuffer) {
          const coverKey = `songs/${timestamp}-${rand}-${safeSlug}.jpeg`;
          coverUrl = await uploadToR2(r2, coverKey, coverBuffer, "image/jpeg");
        }

        const newSongId = crypto.randomUUID();
        const insertRes = await fetch(`${supabaseUrl}/rest/v1/songs`, {
          method: "POST",
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            id: newSongId,
            title: track.title,
            artist: track.artist,
            album: track.album || null,
            duration: duration,
            audio_url: audioUrl,
            thumbnail_url: coverUrl,
          }),
        });

        if (!insertRes.ok) {
          throw new Error(`Failed to insert song into Supabase: ${await insertRes.text()}`);
        }

        // Add to in-memory dbSongs for subsequent matches in this batch
        dbSongs.push({ id: newSongId, title: track.title, artist: track.artist });
        finalSongIds.push(newSongId);
        newlyDownloaded++;
      } catch (dlErr: any) {
        console.error(`Failed to download and sync "${track.title}":`, dlErr.message);
      } finally {
        try {
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch {}
      }
    }

    if (finalSongIds.length === 0) {
      throw new Error("Unable to add any songs to the playlist.");
    }

    // 2. Create the playlist in Supabase
    const createPlRes = await fetch(`${supabaseUrl}/rest/v1/playlists`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        name: data.playlistName.trim(),
        description: data.playlistDescription?.trim() || null,
        cover_url: data.coverArt || null,
        user_id: data.userId,
        is_public: true,
      }),
    });

    if (!createPlRes.ok) {
      throw new Error(`Failed to create playlist: ${await createPlRes.text()}`);
    }

    const [createdPlaylist] = await createPlRes.json();

    // 3. Deduplicate song IDs for the playlist (since UNIQUE(playlist_id, song_id) constraint applies)
    const uniqueSongIds = Array.from(new Set(finalSongIds));

    // Add songs to playlist_songs in order
    const playlistSongsRows = uniqueSongIds.map((songId, index) => ({
      playlist_id: createdPlaylist.id,
      song_id: songId,
      position: index,
    }));

    // Batch insert up to 50 at a time with ignore-duplicates
    for (let i = 0; i < playlistSongsRows.length; i += 50) {
      const batch = playlistSongsRows.slice(i, i + 50);
      const batchRes = await fetch(`${supabaseUrl}/rest/v1/playlist_songs`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=ignore-duplicates",
        },
        body: JSON.stringify(batch),
      });
      if (!batchRes.ok) {
        console.warn(`Error inserting playlist_songs batch at ${i}:`, await batchRes.text());
      }
    }

    return {
      playlistId: createdPlaylist.id,
      name: createdPlaylist.name,
      totalTracks: uniqueSongIds.length,
      newlyDownloaded,
    };
  });
