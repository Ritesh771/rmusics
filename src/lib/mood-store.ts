import { create } from "zustand";

type MoodState = {
  enabled: boolean;
  color: string; // rgb triplet "r,g,b"
  level: number; // 0..1 live audio amplitude
  setColor: (c: string) => void;
  setLevel: (l: number) => void;
  toggle: () => void;
  setEnabled: (v: boolean) => void;
};

const initial = (() => {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem("mood-enabled");
  return v == null ? true : v === "1";
})();

export const useMood = create<MoodState>((set) => ({
  enabled: initial,
  color: "139,92,246", // default violet
  level: 0,
  setColor: (c) => set({ color: c }),
  setLevel: (l) => set({ level: l }),
  toggle: () =>
    set((s) => {
      const next = !s.enabled;
      if (typeof window !== "undefined")
        window.localStorage.setItem("mood-enabled", next ? "1" : "0");
      return { enabled: next };
    }),
  setEnabled: (v) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("mood-enabled", v ? "1" : "0");
    set({ enabled: v });
  },
}));