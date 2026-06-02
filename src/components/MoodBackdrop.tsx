import { useEffect, useMemo, useRef } from "react";
import { usePlayer } from "@/lib/player-store";
import { useMood } from "@/lib/mood-store";

// Tiny color-cache so we don't re-sample the same artwork
const colorCache = new Map<string, string>();

async function extractDominantColor(url: string): Promise<string | null> {
  if (colorCache.has(url)) return colorCache.get(url)!;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 24;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const rr = data[i], gg = data[i + 1], bb = data[i + 2];
          // skip near-black & near-white pixels to find vibrant tone
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          if (max < 30 || min > 230) continue;
          r += rr; g += gg; b += bb; count++;
        }
        if (count === 0) { r = 80; g = 80; b = 120; count = 1; }
        const rgb = `${Math.round(r / count)},${Math.round(g / count)},${Math.round(b / count)}`;
        colorCache.set(url, rgb);
        resolve(rgb);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function MoodBackdrop({ intensity = 1 }: { intensity?: number }) {
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const { enabled, color, setColor, level } = useMood();
  const lastUrl = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const url = song?.thumbnail_url;
    if (!url || url === lastUrl.current) return;
    lastUrl.current = url;
    extractDominantColor(url).then((c) => { if (c) setColor(c); });
  }, [song?.thumbnail_url, setColor]);

  // Apply the reactive level via CSS vars (avoids React re-render storm)
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const lvl = Math.min(1, level * 1.4);
    el.style.setProperty("--mood-level", String(lvl));
    el.style.setProperty("--mood-pulse", String(1 + lvl * 0.18));
  }, [level]);

  if (!enabled) return null;

  // Build an aurora-tinted palette by shifting the base color toward neighbours
  const palette = useMemo(() => {
    const [r, g, b] = color.split(",").map((n) => parseInt(n, 10) || 0);
    const shift = (dr: number, dg: number, db: number) =>
      `${Math.max(0, Math.min(255, r + dr))},${Math.max(0, Math.min(255, g + dg))},${Math.max(0, Math.min(255, b + db))}`;
    return {
      a: `${r},${g},${b}`,
      b: shift(-40, 30, 60),
      c: shift(60, -20, -30),
      d: shift(20, 60, -10),
    };
  }, [color]);

  const baseOpacity = (isPlaying ? 0.6 : 0.3) * intensity;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      style={{
        opacity: baseOpacity,
        transition: "opacity 600ms ease",
        ["--mood-level" as any]: 0,
        ["--mood-pulse" as any]: 1,
      }}
    >
      {/* Aurora ribbons — tall soft sheets that sway across the screen */}
      <div
        className="mood-aurora mood-aurora-1"
        style={{
          background: `linear-gradient(115deg, rgba(${palette.a},0) 0%, rgba(${palette.a},0.55) 35%, rgba(${palette.b},0.65) 55%, rgba(${palette.a},0) 80%)`,
        }}
      />
      <div
        className="mood-aurora mood-aurora-2"
        style={{
          background: `linear-gradient(70deg, rgba(${palette.c},0) 0%, rgba(${palette.c},0.5) 40%, rgba(${palette.d},0.6) 60%, rgba(${palette.c},0) 85%)`,
        }}
      />
      <div
        className="mood-aurora mood-aurora-3"
        style={{
          background: `linear-gradient(160deg, rgba(${palette.b},0) 0%, rgba(${palette.d},0.45) 50%, rgba(${palette.a},0) 90%)`,
        }}
      />
      {/* Pulsing bass orb that breathes with the beat */}
      <div
        className="mood-pulse-orb"
        style={{
          background: `radial-gradient(circle, rgba(${palette.a},0.7) 0%, rgba(${palette.a},0) 70%)`,
        }}
      />
      {/* Subtle grain to keep it cinematic, not gradient-y */}
      <div className="mood-grain" />
    </div>
  );
}