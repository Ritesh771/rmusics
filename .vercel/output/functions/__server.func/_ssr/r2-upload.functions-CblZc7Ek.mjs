import { c as createServerRpc } from "./createServerRpc-ygmbVUtO.mjs";
import { a as createServerFn } from "./server-D2YdkoOS.mjs";
import { A as AwsClient } from "../_libs/aws4fetch.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-BkDS9Vh_.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
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
import "crypto";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
async function assertAdmin(ctx) {
  const {
    data,
    error
  } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error("Authorization check failed");
  if (!data) throw new Error("Forbidden: admin role required");
}
const inputSchema = objectType({
  filename: stringType().min(1).max(255),
  contentType: stringType().min(1).max(100)
});
const getR2UploadUrl_createServerFn_handler = createServerRpc({
  id: "d16207b6c2bf6b7a0b17ccc12c8cb294b17cfdbc36f9c9c8cfde09a0c4d136fb",
  name: "getR2UploadUrl",
  filename: "src/lib/r2-upload.functions.ts"
}, (opts) => getR2UploadUrl.__executeServer(opts));
const getR2UploadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => inputSchema.parse(input)).handler(getR2UploadUrl_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    throw new Error("R2 credentials not configured");
  }
  data.filename.split(".").pop() || "bin";
  const safeName = data.filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const key = `songs/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeName}`;
  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto"
  });
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
  const url = new URL(endpoint);
  url.searchParams.set("X-Amz-Expires", "900");
  const signed = await client.sign(new Request(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": data.contentType
    }
  }), {
    aws: {
      signQuery: true
    }
  });
  const publicFileUrl = `${publicUrl.replace(/\/$/, "")}/${key}`;
  return {
    uploadUrl: signed.url,
    publicUrl: publicFileUrl,
    key
  };
});
const deleteR2Object_createServerFn_handler = createServerRpc({
  id: "21bb041f9c04d7100bf2143962313612283af96c9dec132a99868b4a55f004e4",
  name: "deleteR2Object",
  filename: "src/lib/r2-upload.functions.ts"
}, (opts) => deleteR2Object.__executeServer(opts));
const deleteR2Object = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  key: stringType().min(1)
}).parse(input)).handler(deleteR2Object_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
    throw new Error("R2 not configured");
  }
  const client = new AwsClient({
    accessKeyId,
    secretAccessKey,
    service: "s3",
    region: "auto"
  });
  const res = await client.fetch(`https://${accountId}.r2.cloudflarestorage.com/${bucket}/${data.key}`, {
    method: "DELETE"
  });
  return {
    ok: res.ok
  };
});
const extractR2Metadata_createServerFn_handler = createServerRpc({
  id: "e02e4f4f23276e7d1ede7d12373ddf903f39ef2cf2c7b3741f53471745a490b7",
  name: "extractR2Metadata",
  filename: "src/lib/r2-upload.functions.ts"
}, (opts) => extractR2Metadata.__executeServer(opts));
const extractR2Metadata = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  url: stringType().url()
}).parse(input)).handler(extractR2Metadata_createServerFn_handler, async ({
  data,
  context
}) => {
  await assertAdmin(context);
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
    const {
      parseWebStream
    } = await import("../_libs/music-metadata.mjs");
    const res = await fetch(data.url);
    if (!res.ok || !res.body) {
      return {
        duration: 0,
        genre: null,
        title: null,
        artist: null,
        album: null
      };
    }
    const size = Number(res.headers.get("content-length") || 0) || void 0;
    const mimeType = res.headers.get("content-type") || void 0;
    const meta = await parseWebStream(res.body, {
      size,
      mimeType
    });
    return {
      duration: Math.round(meta.format.duration || 0),
      genre: meta.common.genre && meta.common.genre[0] || null,
      title: meta.common.title || null,
      artist: meta.common.artist || meta.common.albumartist || null,
      album: meta.common.album || null
    };
  } catch (err) {
    console.error("Server metadata extraction failed:", err);
    return {
      duration: 0,
      genre: null,
      title: null,
      artist: null,
      album: null
    };
  }
});
export {
  deleteR2Object_createServerFn_handler,
  extractR2Metadata_createServerFn_handler,
  getR2UploadUrl_createServerFn_handler
};
