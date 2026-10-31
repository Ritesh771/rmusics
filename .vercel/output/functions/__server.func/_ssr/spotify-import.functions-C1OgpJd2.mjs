import { c as createServerRpc } from "./createServerRpc-ygmbVUtO.mjs";
import { a as createServerFn } from "./server-D2YdkoOS.mjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import { execSync } from "child_process";
import { A as AwsClient } from "../_libs/aws4fetch.mjs";
import { parseFile } from "../_libs/music-metadata.mjs";
import { c as cleanSongTitle } from "./song-utils-CWgDAApr.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType, a as arrayType, n as numberType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/strtok3.mjs";
import "node:fs/promises";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "../_libs/has-flag.mjs";
import "../_libs/content-type.mjs";
import "../_libs/media-typer.mjs";
import "../_libs/token-types.mjs";
import "../_libs/ieee754.mjs";
import "../_libs/borewit__text-codec.mjs";
import "../_libs/file-type.mjs";
import "../_libs/tokenizer__inflate.mjs";
import "../_libs/uint8array-extras.mjs";
import "../_libs/win-guid.mjs";
function extractPlaylistId(input) {
  const trimmed = input.trim();
  const match = trimmed.match(/playlist[/:]([a-zA-Z0-9]{22})/);
  if (match) return match[1];
  if (/^[a-zA-Z0-9]{22}$/.test(trimmed)) return trimmed;
  throw new Error("Invalid Spotify playlist URL. Please paste a valid public Spotify playlist link.");
}
function normalizeSongText(str) {
  return (str || "").replace(/\s*-\s*SpotubeDL\.com/gi, "").replace(/\s*[\(\[\{].*?[\)\]\}]\s*/g, " ").replace(/[^a-z0-9]/gi, " ").replace(/\s+/g, " ").toLowerCase().trim();
}
function generateTOTP(secretBuffer, timestampMs) {
  const period = 30;
  const counter = Math.floor(timestampMs / 1e3 / period);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", secretBuffer).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 15;
  const code = ((hmac.readUInt32BE(offset) & 2147483647) % 1e6).toString().padStart(6, "0");
  return code;
}
async function fetchPlaylistMetadata(playlistId) {
  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });
    if (res.ok) {
      const html = await res.text();
      const match = html.match(/<script id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
      if (match) {
        const json = JSON.parse(match[1]);
        const entity = json?.props?.pageProps?.state?.data?.entity;
        const name = entity?.name || entity?.title;
        if (name && !name.includes("Spotify – Web Player")) {
          const coverArt = entity?.coverArt?.sources?.[0]?.url || entity?.visualIdentity?.image?.[0]?.url || void 0;
          return {
            name,
            description: entity?.subtitle || `Spotify playlist by ${entity?.subtitle || "User"}`,
            coverArt
          };
        }
      }
    }
  } catch {
  }
  try {
    const oembedUrl = `https://open.spotify.com/oembed?url=https://open.spotify.com/playlist/${playlistId}`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.title && !data.title.includes("Spotify – Web Player")) {
        return {
          name: data.title,
          description: `Imported from Spotify playlist (${data.title})`,
          coverArt: data.thumbnail_url || void 0
        };
      }
    }
  } catch {
  }
  try {
    const res = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
      }
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
          coverArt: ogImg || void 0
        };
      }
    }
  } catch {
  }
  return {
    name: "Imported Spotify Playlist",
    description: "",
    coverArt: void 0
  };
}
async function fetchViaSpotifyGraphQL(playlistId, meta) {
  const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
  const pageRes = await fetch(`https://open.spotify.com/playlist/${playlistId}`, {
    headers: {
      "User-Agent": userAgent,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
  });
  if (!pageRes.ok) {
    throw new Error(`Failed to access Spotify playlist: HTTP ${pageRes.status}`);
  }
  const html = await pageRes.text();
  const setCookie = pageRes.headers.get("set-cookie") || "";
  const cookies = setCookie.split(",").map((c) => c.split(";")[0]).join("; ");
  const cfgMatch = html.match(/<script id="appServerConfig"[^>]*>([A-Za-z0-9+/=\s]+)<\/script>/);
  let serverTime = null;
  let clientVersion = "1.3.9.19.g9dcd02e21637";
  if (cfgMatch) {
    try {
      const jsonStr = Buffer.from(cfgMatch[1].replace(/\s+/g, ""), "base64").toString("utf8");
      const cfg = JSON.parse(jsonStr);
      serverTime = cfg.serverTime;
      clientVersion = cfg.clientVersion || clientVersion;
    } catch {
    }
  }
  const activeSecret = {
    secret: ',7/*F("rLJ2oxaKL^f+E1xvP@N',
    version: 61
  };
  const r = activeSecret.secret.split("").map((c, idx) => c.charCodeAt(0) ^ idx % 33 + 9);
  const secretBuffer = Buffer.from(r.join(""), "utf8");
  const totp = generateTOTP(secretBuffer, Date.now());
  const totpServer = serverTime ? generateTOTP(secretBuffer, serverTime * 1e3) : "unavailable";
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
      Cookie: cookies
    }
  });
  if (!tokenRes.ok) {
    throw new Error(`Spotify token error: HTTP ${tokenRes.status}`);
  }
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.accessToken;
  if (!accessToken) {
    throw new Error("Did not receive Spotify access token");
  }
  const hash = "21ea11a6ac75a5f3e01fd365d29c18e0a4a8b7dc09f89bbb5d73910190c6acaf";
  const tracks = [];
  let offset = 0;
  let totalCount = 0;
  while (offset === 0 || offset < totalCount) {
    const queryUrl = new URL("https://api-partner.spotify.com/pathfinder/v1/query");
    queryUrl.searchParams.set("operationName", "fetchPlaylistContents");
    queryUrl.searchParams.set("variables", JSON.stringify({
      uri: `spotify:playlist:${playlistId}`,
      offset,
      limit: 50
    }));
    queryUrl.searchParams.set("extensions", JSON.stringify({
      persistedQuery: {
        version: 1,
        sha256Hash: hash
      }
    }));
    const qRes = await fetch(queryUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": userAgent,
        "app-platform": "WebPlayer",
        Accept: "application/json"
      }
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
      const artists = (data.artists?.items || []).map((a) => a.profile?.name).filter(Boolean).join(", ");
      const album = data.albumOfTrack?.name || data.album?.name || "";
      const duration = Math.round((data.trackDuration?.totalMilliseconds || 0) / 1e3);
      const sources = data.albumOfTrack?.coverArt?.sources || data.album?.coverArt?.sources || [];
      const trackCoverUrl = sources.length > 0 ? sources[sources.length - 1].url : void 0;
      tracks.push({
        uri: data.uri || `spotify:track:${data.id || ""}`,
        title,
        artist: artists || "Unknown Artist",
        album,
        duration,
        coverUrl: trackCoverUrl
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
    tracks
  };
}
async function fetchViaSpotifyEmbed(playlistId, meta) {
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const res = await fetch(embedUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
    }
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
  const tracks = (entity.trackList || []).map((t) => ({
    uri: t.uri || "",
    title: t.title || "Unknown Track",
    artist: t.subtitle || "Unknown Artist",
    duration: Math.round((t.duration || 0) / 1e3)
  }));
  return {
    id: entity.id || playlistId,
    name: meta.name !== "Imported Spotify Playlist" ? meta.name : entity.name || entity.title || meta.name,
    description: meta.description || entity.subtitle || "",
    coverArt: meta.coverArt || entity.coverArt?.sources?.[0]?.url || void 0,
    totalCount: tracks.length,
    tracks
  };
}
const fetchSpotifyPlaylist_createServerFn_handler = createServerRpc({
  id: "5ffb07bfd8b55166548e72f1d82ec16c11e6de94eb2d6e9e95d0a27a8211c1ad",
  name: "fetchSpotifyPlaylist",
  filename: "src/lib/spotify-import.functions.ts"
}, (opts) => fetchSpotifyPlaylist.__executeServer(opts));
const fetchSpotifyPlaylist = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  url: stringType().min(5)
}).parse(input)).handler(fetchSpotifyPlaylist_createServerFn_handler, async ({
  data
}) => {
  const playlistId = extractPlaylistId(data.url);
  const meta = await fetchPlaylistMetadata(playlistId);
  try {
    const fullData = await fetchViaSpotifyGraphQL(playlistId, meta);
    if (fullData.tracks.length > 0) {
      return fullData;
    }
  } catch (e) {
    console.warn("GraphQL Spotify scrape failed, falling back to embed:", e.message);
  }
  return await fetchViaSpotifyEmbed(playlistId, meta);
});
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
    region: "auto"
  });
  return {
    client,
    accountId,
    bucket,
    publicUrl
  };
}
async function uploadToR2(r2, key, body, contentType) {
  const endpoint = `https://${r2.accountId}.r2.cloudflarestorage.com/${r2.bucket}/${key}`;
  const res = await r2.client.fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": contentType
    },
    body
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed: ${res.status} ${await res.text()}`);
  }
  return `${r2.publicUrl}/${key}`;
}
const importAndSyncSchema = objectType({
  playlistName: stringType().min(1),
  playlistDescription: stringType().optional(),
  coverArt: stringType().optional(),
  userId: stringType().min(1),
  tracks: arrayType(objectType({
    title: stringType(),
    artist: stringType(),
    album: stringType().optional(),
    duration: numberType().optional(),
    coverUrl: stringType().optional()
  }))
});
const importAndSyncSpotifyPlaylist_createServerFn_handler = createServerRpc({
  id: "28c9251783a34f9d83380141d9b3f4dc6bb961e505090e1908d40b43669246e8",
  name: "importAndSyncSpotifyPlaylist",
  filename: "src/lib/spotify-import.functions.ts"
}, (opts) => importAndSyncSpotifyPlaylist.__executeServer(opts));
const importAndSyncSpotifyPlaylist = createServerFn({
  method: "POST"
}).inputValidator((input) => importAndSyncSchema.parse(input)).handler(importAndSyncSpotifyPlaylist_createServerFn_handler, async ({
  data
}) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured on server.");
  }
  const songsRes = await fetch(`${supabaseUrl}/rest/v1/songs?select=id,title,artist`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`
    }
  });
  if (!songsRes.ok) {
    throw new Error(`Failed to query songs library: ${songsRes.status}`);
  }
  const dbSongs = await songsRes.json();
  const r2 = getR2Client();
  const finalSongIds = [];
  let newlyDownloaded = 0;
  for (const track of data.tracks) {
    const targetT = normalizeSongText(track.title);
    const targetA = normalizeSongText(track.artist);
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
    console.log(`[Spotify Sync] Downloading missing song: "${track.title}" - ${track.artist}`);
    const tempDir = path.join(os.tmpdir(), `sonara_sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
    fs.mkdirSync(tempDir, {
      recursive: true
    });
    try {
      const outTemplate = path.join(tempDir, "audio.%(ext)s");
      const query = `${track.title} ${track.artist} song audio`;
      try {
        execSync(`yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${query.replace(/"/g, "")}"`, {
          stdio: "ignore",
          timeout: 45e3
        });
      } catch {
        execSync(`yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${track.title.replace(/"/g, "")} ${track.artist.replace(/"/g, "")}"`, {
          stdio: "ignore",
          timeout: 45e3
        });
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
        const metaData = await parseFile(audioPath);
        if (metaData.format.duration) duration = Math.round(metaData.format.duration);
      } catch {
      }
      let coverBuffer = null;
      if (track.coverUrl) {
        try {
          const cRes = await fetch(track.coverUrl);
          if (cRes.ok) coverBuffer = Buffer.from(await cRes.arrayBuffer());
        } catch {
        }
      }
      const timestamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 7);
      const safeSlug = track.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
      const audioKey = `songs/${timestamp}-${rand}-${safeSlug}.m4a`;
      const audioUrl = await uploadToR2(r2, audioKey, audioBuffer, "audio/mp4");
      let coverUrl = null;
      if (coverBuffer) {
        const coverKey = `songs/${timestamp}-${rand}-${safeSlug}.jpeg`;
        coverUrl = await uploadToR2(r2, coverKey, coverBuffer, "image/jpeg");
      }
      const newSongId = crypto.randomUUID();
      const genre = inferLanguageGenre(track.title, track.artist, track.album || "");
      const insertRes = await fetch(`${supabaseUrl}/rest/v1/songs`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify({
          id: newSongId,
          title: cleanSongTitle(track.title),
          artist: track.artist,
          album: track.album || null,
          duration,
          genre,
          audio_url: audioUrl,
          thumbnail_url: coverUrl
        })
      });
      if (!insertRes.ok) {
        throw new Error(`Failed to insert song into Supabase: ${await insertRes.text()}`);
      }
      dbSongs.push({
        id: newSongId,
        title: track.title,
        artist: track.artist
      });
      finalSongIds.push(newSongId);
      newlyDownloaded++;
    } catch (dlErr) {
      console.error(`Failed to download and sync "${track.title}":`, dlErr.message);
    } finally {
      try {
        fs.rmSync(tempDir, {
          recursive: true,
          force: true
        });
      } catch {
      }
    }
  }
  if (finalSongIds.length === 0) {
    throw new Error("Unable to add any songs to the playlist.");
  }
  let finalCoverUrl = data.coverArt || null;
  if (finalCoverUrl && finalCoverUrl.startsWith("http") && !finalCoverUrl.includes(r2.publicUrl)) {
    try {
      const imgRes = await fetch(finalCoverUrl);
      if (imgRes.ok) {
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        const cType = imgRes.headers.get("content-type") || "image/jpeg";
        const ext = cType.includes("png") ? "png" : "jpg";
        const r2Key = `covers/playlist-${Date.now()}.${ext}`;
        finalCoverUrl = await uploadToR2(r2, r2Key, imgBuf, cType);
      }
    } catch (covErr) {
      console.warn("Failed to cache playlist cover to R2:", covErr);
    }
  }
  const createPlRes = await fetch(`${supabaseUrl}/rest/v1/playlists`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      name: data.playlistName.trim(),
      description: data.playlistDescription?.trim() || null,
      cover_url: finalCoverUrl,
      user_id: data.userId,
      is_public: true
    })
  });
  if (!createPlRes.ok) {
    throw new Error(`Failed to create playlist: ${await createPlRes.text()}`);
  }
  const [createdPlaylist] = await createPlRes.json();
  const uniqueSongIds = Array.from(new Set(finalSongIds));
  const playlistSongsRows = uniqueSongIds.map((songId, index) => ({
    playlist_id: createdPlaylist.id,
    song_id: songId,
    position: index
  }));
  for (let i = 0; i < playlistSongsRows.length; i += 50) {
    const batch = playlistSongsRows.slice(i, i + 50);
    const batchRes = await fetch(`${supabaseUrl}/rest/v1/playlist_songs`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates"
      },
      body: JSON.stringify(batch)
    });
    if (!batchRes.ok) {
      console.warn(`Error inserting playlist_songs batch at ${i}:`, await batchRes.text());
    }
  }
  return {
    playlistId: createdPlaylist.id,
    name: createdPlaylist.name,
    totalTracks: uniqueSongIds.length,
    newlyDownloaded
  };
});
function inferLanguageGenre(title, artist, album = "") {
  const combined = `${title} ${artist} ${album}`.toLowerCase();
  if (combined.includes("lofi") || combined.includes("lo-fi") || combined.includes("slowed") || combined.includes("reverb")) {
    return "Chill & Lo-Fi";
  }
  if (combined.includes("anirudh") || combined.includes("leo") || combined.includes("vettaiyan") || combined.includes("arabic kuthu") || combined.includes("dippam") || combined.includes("moonu") || combined.includes("naa ready") || combined.includes("aasa kooda") || combined.includes("manasilaayo") || combined.includes("megham karukatha") || combined.includes("yuvan") || combined.includes("tamil")) {
    return "Tamil";
  }
  if (combined.includes("ala vaikunthapurramuloo") || combined.includes("buttabomma") || combined.includes("ramuloo ramulaa") || combined.includes("samajavaragamana") || combined.includes("daaku maharaaj") || combined.includes("dabidi dibidi") || combined.includes("chuttamalle") || combined.includes("devara") || combined.includes("telugu")) {
    return "Telugu";
  }
  if (combined.includes("chandan shetty") || combined.includes("vijay prakash") || combined.includes("gaalipata") || combined.includes("kgf") || combined.includes("kantara") || combined.includes("googly") || combined.includes("sidlingu") || combined.includes("paramathma") || combined.includes("anna from mexico") || combined.includes("tagaru") || combined.includes("ekka") || combined.includes("singara siriye") || combined.includes("puttamalli") || combined.includes("kannada")) {
    return "Kannada";
  }
  if (combined.includes("bad newz") || combined.includes("tauba tauba") || combined.includes("stree 2") || combined.includes("aaj ki raat") || combined.includes("chikni chameli") || combined.includes("jawan") || combined.includes("rocky aur rani") || combined.includes("what jhumka") || combined.includes("tere vaaste") || combined.includes("zara hatke") || combined.includes("arijit") || combined.includes("pritam") || combined.includes("sachin-jigar") || combined.includes("tanishk bagchi") || combined.includes("dilbar") || combined.includes("hindi") || combined.includes("bollywood")) {
    return "Hindi";
  }
  if (combined.includes("aavesham") || combined.includes("illuminati") || combined.includes("malayalam")) {
    return "Malayalam";
  }
  return "Pop & Indie";
}
const syncSingleTrackSchema = objectType({
  track: objectType({
    title: stringType(),
    artist: stringType(),
    album: stringType().optional(),
    duration: numberType().optional(),
    coverUrl: stringType().optional()
  })
});
const syncSingleTrack_createServerFn_handler = createServerRpc({
  id: "5af629546dd9ed3ab252147fba562371a9c9475662c52cc865768a7e37246ce8",
  name: "syncSingleTrack",
  filename: "src/lib/spotify-import.functions.ts"
}, (opts) => syncSingleTrack.__executeServer(opts));
const syncSingleTrack = createServerFn({
  method: "POST"
}).inputValidator((input) => syncSingleTrackSchema.parse(input)).handler(syncSingleTrack_createServerFn_handler, async ({
  data
}) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured on server.");
  }
  const {
    track
  } = data;
  const targetT = normalizeSongText(track.title);
  const targetA = normalizeSongText(track.artist);
  try {
    const songsRes = await fetch(`${supabaseUrl}/rest/v1/songs?select=id,title,artist`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`
      }
    });
    if (songsRes.ok) {
      const dbSongs = await songsRes.json();
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
        return {
          songId: existingMatch.id,
          isNew: false,
          title: cleanSongTitle(track.title),
          artist: track.artist
        };
      }
    }
  } catch (chkErr) {
    console.warn("Deduplication check error:", chkErr);
  }
  const r2 = getR2Client();
  const tempDir = path.join(os.tmpdir(), `sonara_sync_single_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
  fs.mkdirSync(tempDir, {
    recursive: true
  });
  try {
    const outTemplate = path.join(tempDir, "audio.%(ext)s");
    const query = `${track.title} ${track.artist} song audio`;
    try {
      execSync(`yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${query.replace(/"/g, "")}"`, {
        stdio: "ignore",
        timeout: 45e3
      });
    } catch {
      execSync(`yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${track.title.replace(/"/g, "")} ${track.artist.replace(/"/g, "")}"`, {
        stdio: "ignore",
        timeout: 45e3
      });
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
      const metaData = await parseFile(audioPath);
      if (metaData.format.duration) duration = Math.round(metaData.format.duration);
    } catch {
    }
    let coverBuffer = null;
    if (track.coverUrl) {
      try {
        const cRes = await fetch(track.coverUrl);
        if (cRes.ok) coverBuffer = Buffer.from(await cRes.arrayBuffer());
      } catch {
      }
    }
    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 7);
    const safeSlug = track.title.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 40);
    const audioKey = `songs/${timestamp}-${rand}-${safeSlug}.m4a`;
    const audioUrl = await uploadToR2(r2, audioKey, audioBuffer, "audio/mp4");
    let coverUrl = null;
    if (coverBuffer) {
      const coverKey = `songs/${timestamp}-${rand}-${safeSlug}.jpeg`;
      coverUrl = await uploadToR2(r2, coverKey, coverBuffer, "image/jpeg");
    }
    const newSongId = crypto.randomUUID();
    const genre = inferLanguageGenre(track.title, track.artist, track.album || "");
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/songs`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        id: newSongId,
        title: cleanSongTitle(track.title),
        artist: track.artist,
        album: track.album || null,
        duration,
        genre,
        audio_url: audioUrl,
        thumbnail_url: coverUrl
      })
    });
    if (!insertRes.ok) {
      throw new Error(`Failed to insert song into Supabase: ${await insertRes.text()}`);
    }
    return {
      songId: newSongId,
      isNew: true,
      title: cleanSongTitle(track.title),
      artist: track.artist
    };
  } finally {
    try {
      fs.rmSync(tempDir, {
        recursive: true,
        force: true
      });
    } catch {
    }
  }
});
const saveImportedPlaylistSchema = objectType({
  playlistName: stringType(),
  playlistDescription: stringType().optional(),
  coverArt: stringType().optional(),
  userId: stringType(),
  songIds: arrayType(stringType())
});
const saveImportedPlaylist_createServerFn_handler = createServerRpc({
  id: "fa144d4c2add10cf3e57578bfefee313b8cadc91c075486c0ddc16539fc2387a",
  name: "saveImportedPlaylist",
  filename: "src/lib/spotify-import.functions.ts"
}, (opts) => saveImportedPlaylist.__executeServer(opts));
const saveImportedPlaylist = createServerFn({
  method: "POST"
}).inputValidator((input) => saveImportedPlaylistSchema.parse(input)).handler(saveImportedPlaylist_createServerFn_handler, async ({
  data
}) => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured on server.");
  }
  const r2 = getR2Client();
  let finalCoverUrl = data.coverArt || null;
  if (finalCoverUrl && finalCoverUrl.startsWith("http") && !finalCoverUrl.includes(r2.publicUrl)) {
    try {
      const imgRes = await fetch(finalCoverUrl);
      if (imgRes.ok) {
        const imgBuf = Buffer.from(await imgRes.arrayBuffer());
        const cType = imgRes.headers.get("content-type") || "image/jpeg";
        const ext = cType.includes("png") ? "png" : "jpg";
        const r2Key = `covers/playlist-${Date.now()}.${ext}`;
        finalCoverUrl = await uploadToR2(r2, r2Key, imgBuf, cType);
      }
    } catch (covErr) {
      console.warn("Failed to cache playlist cover to R2:", covErr);
    }
  }
  const createPlRes = await fetch(`${supabaseUrl}/rest/v1/playlists`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
    body: JSON.stringify({
      name: data.playlistName.trim(),
      description: data.playlistDescription?.trim() || null,
      cover_url: finalCoverUrl,
      user_id: data.userId,
      is_public: true
    })
  });
  if (!createPlRes.ok) {
    throw new Error(`Failed to create playlist: ${await createPlRes.text()}`);
  }
  const [createdPlaylist] = await createPlRes.json();
  const uniqueSongIds = Array.from(new Set(data.songIds));
  const playlistSongsRows = uniqueSongIds.map((songId, index) => ({
    playlist_id: createdPlaylist.id,
    song_id: songId,
    position: index
  }));
  for (let i = 0; i < playlistSongsRows.length; i += 50) {
    const batch = playlistSongsRows.slice(i, i + 50);
    const batchRes = await fetch(`${supabaseUrl}/rest/v1/playlist_songs`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates"
      },
      body: JSON.stringify(batch)
    });
    if (!batchRes.ok) {
      console.warn(`Error inserting playlist_songs batch at ${i}:`, await batchRes.text());
    }
  }
  return {
    playlistId: createdPlaylist.id,
    name: createdPlaylist.name,
    totalTracks: uniqueSongIds.length
  };
});
export {
  fetchSpotifyPlaylist_createServerFn_handler,
  importAndSyncSpotifyPlaylist_createServerFn_handler,
  saveImportedPlaylist_createServerFn_handler,
  syncSingleTrack_createServerFn_handler
};
