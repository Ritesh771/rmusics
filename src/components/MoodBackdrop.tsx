import { useEffect, useRef } from "react";
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
  const { enabled, color, setColor } = useMood();
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    const url = song?.thumbnail_url;
    if (!url || url === lastUrl.current) return;
    lastUrl.current = url;
    extractDominantColor(url).then((c) => { if (c) setColor(c); });
  }, [song?.thumbnail_url, setColor]);

  if (!enabled) return null;

  const baseOpacity = (isPlaying ? 0.55 : 0.3) * intensity;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-0 overflow-hidden"
      style={{ transition: "opacity 600ms ease" }}
    >
      <div
        className="absolute -top-1/4 -left-1/4 h-[70vh] w-[70vh] rounded-full blur-3xl mood-blob"
        style={{
          background: `radial-gradient(circle, rgba(${color},${baseOpacity}) 0%, rgba(${color},0) 70%)`,
          transition: "background 1200ms ease",
        }}
      />
      <div
        className="absolute -bottom-1/4 -right-1/4 h-[80vh] w-[80vh] rounded-full blur-3xl mood-blob mood-blob-delay"
        style={{
          background: `radial-gradient(circle, rgba(${color},${baseOpacity * 0.9}) 0%, rgba(${color},0) 70%)`,
          transition: "background 1200ms ease",
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[55vh] w-[55vh] rounded-full blur-3xl mood-blob mood-blob-delay-2"
        style={{
          background: `radial-gradient(circle, rgba(${color},${baseOpacity * 0.6}) 0%, rgba(${color},0) 70%)`,
          transition: "background 1200ms ease",
        }}
      />
    </div>
  );
}