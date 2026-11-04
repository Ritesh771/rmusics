import { useEffect, useRef } from "react";
import { usePlayer } from "@/lib/player-store";
import { useMood } from "@/lib/mood-store";
import { streamUrl } from "@/lib/stream-url";

// Tiny palette-cache so we don't re-sample the same artwork
const paletteCache = new Map<string, string[]>();

async function extractPalette(url: string): Promise<string[] | null> {
  const cachedPalette = paletteCache.get(url);
  if (cachedPalette) return cachedPalette;
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
  const artworkUrl = usePlayer((s) => s.queue[s.currentIndex]?.thumbnail_url);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const { enabled, palette, setPalette } = useMood();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    if (!artworkUrl || artworkUrl === lastUrl.current) return;
    lastUrl.current = artworkUrl;
    // Load artwork through the same-origin R2 proxy. This keeps the canvas
    // readable even when the bucket itself does not expose image CORS headers.
    extractPalette(streamUrl(artworkUrl)).then((p) => {
      if (p && p.length && lastUrl.current === artworkUrl) setPalette(p);
    });
  }, [artworkUrl, setPalette]);

  if (!enabled) return null;

  // Gradient alpha stays fixed: gradients can't transition, so changing it on play/pause
  // snapped the backdrop. Dim via container opacity and pause (not restart) the drift.
  const baseOpacity = 0.6 * intensity;
  const c = (i: number) => palette[i % palette.length] ?? palette[0] ?? "139,92,246";

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-0 overflow-hidden ${isPlaying ? "" : "aurora-paused"}`}
      style={{ opacity: isPlaying ? 1 : 0.55, transition: "opacity 600ms ease" }}
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