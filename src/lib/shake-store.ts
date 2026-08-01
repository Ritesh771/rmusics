import { create } from "zustand";

type ShakeState = {
  enabled: boolean;
  supported: boolean;
  needsPermission: boolean;
  setSupported: (v: boolean) => void;
  toggle: () => Promise<void>;
  setEnabled: (v: boolean) => void;
};

const initial = (() => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("shake-volume") === "1";
})();

type MotionCtor = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

function persist(v: boolean) {
  if (typeof window !== "undefined")
    window.localStorage.setItem("shake-volume", v ? "1" : "0");
}

export const useShake = create<ShakeState>((set, get) => ({
  enabled: initial,
  supported: typeof window !== "undefined" && "DeviceMotionEvent" in window,
  needsPermission:
    typeof window !== "undefined" &&
    typeof (window.DeviceMotionEvent as MotionCtor | undefined)?.requestPermission ===
      "function",
  setSupported: (v) => set({ supported: v }),
  setEnabled: (v) => {
    persist(v);
    set({ enabled: v });
  },
  toggle: async () => {
    const next = !get().enabled;
    if (next && get().needsPermission) {
      try {
        const res = await (window.DeviceMotionEvent as MotionCtor).requestPermission!();
        if (res !== "granted") return;
      } catch {
        return;
      }
    }
    persist(next);
    set({ enabled: next });
  },
}));
