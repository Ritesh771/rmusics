import { useEffect } from "react";
import { usePlayer } from "@/lib/player-store";
import { useShake } from "@/lib/shake-store";
import { toast } from "sonner";

// Shake-to-boost: a firm shake nudges the volume up one step (Spotify-style
// "shake to feel it"). Wraps back down once it tops out so the gesture stays
// useful without ever getting stuck at max.
const THRESHOLD = 22; // m/s^2 of combined jolt
const COOLDOWN = 900; // ms between accepted shakes
const STEP = 0.1;

export function useShakeVolume() {
  const enabled = useShake((s) => s.enabled);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!("DeviceMotionEvent" in window)) return;

    let last = 0;
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity ?? e.acceleration;
      if (!a) return;
      const jolt = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      // Subtract gravity baseline so only real jolts register.
      if (jolt - 9.81 < THRESHOLD - 9.81) return;
      const now = Date.now();
      if (now - last < COOLDOWN) return;
      last = now;

      const state = usePlayer.getState();
      const nextVol = state.volume >= 0.999 ? 0.5 : Math.min(1, state.volume + STEP);
      state.setVolume(nextVol);
      if (state.muted) usePlayer.setState({ muted: false });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate?.(15); } catch { /* unsupported */ }
      }
      toast.success(`Volume ${Math.round(nextVol * 100)}%`, { duration: 900 });
    };

    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [enabled]);
}
