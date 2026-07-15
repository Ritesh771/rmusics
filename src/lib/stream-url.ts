// Rewrites an absolute R2 audio URL into our same-origin streaming proxy.
// Same-origin media = reliable Range requests, no CORS surprises, and
// stable background/lock-screen playback across hosts (Vercel, Cloudflare,
// custom domains). Server-side the proxy validates against R2_PUBLIC_URL.
export function streamUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) return raw;
  return `/api/stream?u=${encodeURIComponent(raw)}`;
}