import { useEffect, useRef } from "react";
import { usePlayer } from "@/lib/player-store";
import { useMood } from "@/lib/mood-store";

// Tiny palette-cache so we don't re-sample the same artwork
const paletteCache = new Map<string, string[]>();

async function extractPalette(url: string): Promise<string[] | null> {
  if (paletteCache.has(url)) return paletteCache.get(url)!;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 40;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        // Quantize pixels into buckets, count occurrences, pick top vibrant
        const buckets = new Map<string, { r: number; g: number; b: number; n: number; score: number }>();
        for (let i = 0; i < data.length; i += 4) {
          const rr = data[i], gg = data[i + 1], bb = data[i + 2];
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          if (max < 25 || min > 235) continue;
          // quantize to 32-step bucket
          const key = `${rr >> 5}-${gg >> 5}-${bb >> 5}`;
          const sat = max - min; // chroma proxy
          const cur = buckets.get(key);
          if (cur) { cur.r += rr; cur.g += gg; cur.b += bb; cur.n += 1; cur.score += sat + 8; }
          else buckets.set(key, { r: rr, g: gg, b: bb, n: 1, score: sat + 8 });
        }
        const sorted = [...buckets.values()].sort((a, b) => b.score - a.score).slice(0, 4);
        if (!sorted.length) return resolve(["80,80,120", "100,80,140", "60,100,140"]);
        const palette = sorted.map((b) => `${Math.round(b.r / b.n)},${Math.round(b.g / b.n)},${Math.round(b.b / b.n)}`);
        paletteCache.set(url, palette);
        resolve(palette);
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
  const { enabled, palette, setPalette } = useMood();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    const url = song?.thumbnail_url;
    if (!url || url === lastUrl.current) return;
    lastUrl.current = url;
    extractPalette(url).then((p) => { if (p && p.length) setPalette(p); });
  }, [song?.thumbnail_url, setPalette]);

  if (!enabled) return null;

  const baseOpacity = (isPlaying ? 0.6 : 0.32) * intensity;
  const c = (i: number) => palette[i % palette.length] ?? palette[0] ?? "139,92,246";

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-0 overflow-hidden ${isPlaying ? "aurora-active" : ""}`}
      style={{ transition: "opacity 600ms ease" }}
    >
      <div
        className="aurora-blob aurora-1"
        style={{
          background: `radial-gradient(circle at 30% 30%, rgba(${c(0)},${baseOpacity}) 0%, rgba(${c(0)},0) 65%)`,
        }}
      />
      <div
        className="aurora-blob aurora-2"
        style={{
          background: `radial-gradient(circle at 60% 50%, rgba(${c(1)},${baseOpacity * 0.95}) 0%, rgba(${c(1)},0) 65%)`,
        }}
      />
      <div
        className="aurora-blob aurora-3"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${c(2)},${baseOpacity * 0.85}) 0%, rgba(${c(2)},0) 65%)`,
        }}
      />
      <div
        className="aurora-blob aurora-4"
        style={{
          background: `radial-gradient(circle at 50% 50%, rgba(${c(3)},${baseOpacity * 0.7}) 0%, rgba(${c(3)},0) 65%)`,
        }}
      />
    </div>
  );
}