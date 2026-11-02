import { useEffect, useSyncExternalStore } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

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
  // Update the un-scoped theme-color (used when the browser ignores
  // media-scoped variants, e.g. inside an installed PWA where the user's
  // choice inside the app should win over system prefs).
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
  const apple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (apple) apple.setAttribute("content", theme === "dark" ? "black-translucent" : "default");

  // Sync native mobile status bar style
  if (Capacitor.isNativePlatform()) {
    try {
      StatusBar.setStyle({ style: theme === "dark" ? Style.Dark : Style.Light }).catch(() => {});
      StatusBar.setBackgroundColor({ color: theme === "dark" ? "#0d0b14" : "#ffffff" }).catch(() => {});
    } catch {}
  }
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
  const theme = useSyncExternalStore(subscribe, () => current, () => "dark" as Theme);
  // Initialise on the client without causing hydration mismatch.
  useEffect(() => {
    const stored = readStored();
    if (stored !== current) setTheme(stored);
    else apply(stored);
  }, []);
  return theme;
}