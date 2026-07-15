import { useEffect, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "rmusics.theme";

function readStored(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY);
  if (v === "light" || v === "dark") return v;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

let current: Theme = "dark";
const listeners = new Set<() => void>();

function apply(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
}

export function setTheme(theme: Theme) {
  current = theme;
  try { window.localStorage.setItem(STORAGE_KEY, theme); } catch {}
  apply(theme);
  listeners.forEach((l) => l());
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function useTheme(): Theme {
  const theme = useSyncExternalStore(subscribe, () => current, () => "dark");
  // Initialise on the client without causing hydration mismatch.
  useEffect(() => {
    const stored = readStored();
    if (stored !== current) setTheme(stored);
    else apply(stored);
  }, []);
  return theme;
}