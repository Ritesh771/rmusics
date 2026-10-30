import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { AwsClient } from "aws4fetch";
import * as musicMetadata from "music-metadata";

// 1. Read .env
const envText = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envText.split("\n")) {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
}

const accountId = env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = env.R2_ACCESS_KEY_ID;
const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
const bucket = env.R2_BUCKET_NAME;
const publicUrl = env.R2_PUBLIC_URL.replace(/\/$/, "");

const SUPABASE_URL = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
  console.error("Missing Cloudflare R2 environment variables!");
  process.exit(1);
}

const r2Client = new AwsClient({
  accessKeyId,
  secretAccessKey,
  service: "s3",
  region: "auto",
});

async function uploadToR2(key, body, contentType) {
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
  const res = await r2Client.fetch(endpoint, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body,
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed for ${key}: ${res.status} ${await res.text()}`);
  }
  return `${publicUrl}/${key}`;
}

async function processTrack(track, idx, total) {
  console.log(`\n========================================`);
  console.log(`[${idx + 1}/${total}] Processing: "${track.title}" - ${track.artists}`);
  console.log(`========================================`);

  const tempDir = path.join("/tmp", `track_dl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    const safeBaseName = track.title
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 50);

    const outTemplate = path.join(tempDir, "audio.%(ext)s");
    const searchQuery = `${track.title} ${track.artists} song audio`;

    console.log(`Searching & downloading audio via yt-dlp: "${searchQuery}"`);
    try {
      execSync(
        `yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${searchQuery.replace(/"/g, "")}"`,
        { stdio: "inherit", timeout: 60000 }
      );
    } catch (err) {
      console.warn(`Fallback search query without 'song audio'...`);
      const fallbackQuery = `${track.title} ${track.artists}`;
      execSync(
        `yt-dlp -f "ba[ext=m4a]/ba" --no-playlist --no-warnings -o "${outTemplate}" "ytsearch1:${fallbackQuery.replace(/"/g, "")}"`,
        { stdio: "inherit", timeout: 60000 }
      );
    }

    const files = fs.readdirSync(tempDir);
    const audioFilename = files.find((f) => f.startsWith("audio."));
    if (!audioFilename) {
      throw new Error("yt-dlp completed but audio file was not found.");
    }

    const audioPath = path.join(tempDir, audioFilename);
    const audioBuffer = fs.readFileSync(audioPath);

    let duration = Math.round((track.duration_ms || 0) / 1000);
    try {
      const meta = await musicMetadata.parseFile(audioPath);
      if (meta.format.duration) {
        duration = Math.round(meta.format.duration);
      }
    } catch (e) {
      console.warn("Could not parse audio duration from file, using Spotify duration:", duration);
    }

    // Cover art
    let coverBuffer = null;
    let coverMime = "image/jpeg";
    if (track.cover_url) {
      try {
        console.log("Downloading Spotify cover image:", track.cover_url);
        const cRes = await fetch(track.cover_url);
        if (cRes.ok) {
          coverBuffer = Buffer.from(await cRes.arrayBuffer());
          const cType = cRes.headers.get("content-type");
          if (cType) coverMime = cType;
        }
      } catch (err) {
        console.warn("Failed to download Spotify cover image:", err.message);
      }
    }

    const timestamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const audioKey = `songs/${timestamp}-${rand}-${safeBaseName}.m4a`;
    console.log(`Uploading audio to R2 (${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB)...`);
    const audioUrl = await uploadToR2(audioKey, audioBuffer, "audio/mp4");

    let coverUrl = null;
    if (coverBuffer) {
      const coverExt = coverMime.includes("png") ? "png" : "jpeg";
      const coverKey = `songs/${timestamp}-${rand}-${safeBaseName}.${coverExt}`;
      console.log(`Uploading cover to R2...`);
      coverUrl = await uploadToR2(coverKey, coverBuffer, coverMime);
    }

    // Insert into Supabase
    console.log("Inserting record into Supabase songs table...");
    const songId = crypto.randomUUID();
    const res = await fetch(`${SUPABASE_URL}/rest/v1/songs`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        id: songId,
        title: track.title,
        artist: track.artists,
        album: track.album || null,
        duration: duration || 0,
        audio_url: audioUrl,
        thumbnail_url: coverUrl,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase insert failed with HTTP ${res.status}: ${errText}`);
    }

    const inserted = await res.json();
    console.log(`[SUCCESS] Inserted: "${track.title}" (ID: ${songId}, Duration: ${duration}s)`);
    return { success: true, track: track.title, songId };
  } catch (err) {
    console.error(`[ERROR] Failed to process "${track.title}":`, err.message);
    return { success: false, track: track.title, error: err.message };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

async function main() {
  const missingTracks = JSON.parse(fs.readFileSync("/tmp/missing_to_download.json", "utf8"));
  console.log(`Starting import for ${missingTracks.length} missing tracks...`);

  const results = [];
  for (let i = 0; i < missingTracks.length; i++) {
    const res = await processTrack(missingTracks[i], i, missingTracks.length);
    results.push(res);
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log("\n========================================");
  console.log(`FINISHED IMPORT: ${successCount} successful, ${failureCount} failed out of ${missingTracks.length}`);
  console.log("========================================");
  if (failureCount > 0) {
    console.log("Failures:");
    results.filter((r) => !r.success).forEach((r) => console.log(`- ${r.track}: ${r.error}`));
  }
}

main().catch(console.error);

