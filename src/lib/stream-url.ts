// Rewrites a raw R2 public URL into our same-origin streaming proxy.
// Keeps audio playback host-agnostic (works on Vercel, Cloudflare, custom
// domains) and stabilises background/lock-screen playback because the
// browser treats it as first-party media.

const R2_PUBLIC = import.meta.env.VITE_R2_PUBLIC_URL as string | undefined;

function r2Host(): string | null {
  if (!R2_PUBLIC) return null;
  try {
    return new URL(R2_PUBLIC).hostname;
  } catch {
    return null;
  }
}

export function streamUrl(raw: string | null | undefined): string {
  if (!raw) return "";
  const host = r2Host();
  if (!host) return raw;
  try {
    const u = new URL(raw);
    if (u.hostname !== host) return raw;
    return `/api/stream?u=${encodeURIComponent(raw)}`;
  } catch {
    return raw;
  }
}