import { createFileRoute } from "@tanstack/react-router";

// Same-origin audio proxy for R2-hosted tracks.
// Streams the upstream response with Range support so playback works
// reliably on every host (Cloudflare Workers, Vercel, etc.) and keeps
// background/lock-screen playback stable — the browser sees a same-origin
// media source and MediaSession handlers stay attached across suspensions.

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
]);

function allowedHost(): string | null {
  const pub = process.env.R2_PUBLIC_URL;
  if (!pub) return null;
  try {
    return new URL(pub).hostname;
  } catch {
    return null;
  }
}

async function handle(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const target = url.searchParams.get("u");
  if (!target) return new Response("Missing u", { status: 400 });

  let upstream: URL;
  try {
    upstream = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }

  const host = allowedHost();
  if (!host || upstream.hostname !== host || upstream.protocol !== "https:") {
    return new Response("Forbidden host", { status: 403 });
  }

  const forwardHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) forwardHeaders.set("range", range);
  const ifRange = request.headers.get("if-range");
  if (ifRange) forwardHeaders.set("if-range", ifRange);

  const upstreamRes = await fetch(upstream.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: forwardHeaders,
  });

  const headers = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("Accept-Ranges", "bytes");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", headers.get("cache-control") ?? "public, max-age=31536000, immutable");

  return new Response(request.method === "HEAD" ? null : upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers,
  });
}

export const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      HEAD: ({ request }) => handle(request),
    },
  },
});