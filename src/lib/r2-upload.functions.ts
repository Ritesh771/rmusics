import { createServerFn } from "@tanstack/react-start";
import { AwsClient } from "aws4fetch";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error("Authorization check failed");
  if (!data) throw new Error("Forbidden: admin role required");
}

const inputSchema = z.object({
  filename: z.string().min(1).max(255),
  contentType: z.string().min(1).max(100),
});

export const getR2UploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => inputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
      throw new Error("R2 credentials not configured");
    }

    // Generate unique key
    const ext = data.filename.split(".").pop() || "bin";
    const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
    const key = `songs/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;

    const client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: "s3",
      region: "auto",
    });

    const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
    // Presign PUT URL (15 minutes)
    const url = new URL(endpoint);
    url.searchParams.set("X-Amz-Expires", "900");

    const signed = await client.sign(
      new Request(url.toString(), {
        method: "PUT",
        headers: { "Content-Type": data.contentType },
      }),
      { aws: { signQuery: true } }
    );

    const publicFileUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;
    return {
      uploadUrl: signed.url,
      publicUrl: publicFileUrl,
      key,
    };
  });

export const deleteR2Object = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) => z.object({ key: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;
    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      throw new Error("R2 not configured");
    }
    const client = new AwsClient({
      accessKeyId, secretAccessKey, service: "s3", region: "auto",
    });
    const res = await client.fetch(
      `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${data.key}`,
      { method: "DELETE" }
    );
    return { ok: res.ok };
  });

// Server-side metadata extraction fallback. Fetches the uploaded audio from
// its public R2 URL and parses ID3/container tags + duration with
// music-metadata. Returns null fields if parsing fails so the caller can
// merge with whatever the client extracted.
export const extractR2Metadata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: any) =>
    z.object({ url: z.string().url() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    // SSRF guard: only allow fetching from our configured R2 public origin
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!publicUrl) throw new Error("R2_PUBLIC_URL not configured");
    try {
      const allowed = new URL(publicUrl);
      const target = new URL(data.url);
      if (target.hostname !== allowed.hostname || target.protocol !== "https:") {
        throw new Error("Forbidden: URL must match R2_PUBLIC_URL host");
      }
    } catch {
      throw new Error("Invalid URL");
    }
    try {
      const { parseWebStream } = await import("music-metadata");
      const res = await fetch(data.url);
      if (!res.ok || !res.body) {
        return { duration: 0, genre: null, title: null, artist: null, album: null };
      }
      const size = Number(res.headers.get("content-length") || 0) || undefined;
      const mimeType = res.headers.get("content-type") || undefined;
      const meta = await parseWebStream(res.body, { size, mimeType });
      return {
        duration: Math.round(meta.format.duration || 0),
        genre: (meta.common.genre && meta.common.genre[0]) || null,
        title: meta.common.title || null,
        artist: meta.common.artist || meta.common.albumartist || null,
        album: meta.common.album || null,
      };
    } catch (err) {
      console.error("Server metadata extraction failed:", err);
      return { duration: 0, genre: null, title: null, artist: null, album: null };
    }
  });