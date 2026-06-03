import { create } from "zustand";

type MoodState = {
  enabled: boolean;
  color: string; // rgb triplet "r,g,b"
  palette: string[]; // up to 4 dominant colors as "r,g,b" triplets
  setColor: (c: string) => void;
  setPalette: (p: string[]) => void;
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
  palette: ["139,92,246", "59,130,246", "236,72,153", "16,185,129"],
  setColor: (c) => set({ color: c }),
  setPalette: (p) => set({ palette: p, color: p[0] ?? "139,92,246" }),
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