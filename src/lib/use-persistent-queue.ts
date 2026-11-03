import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer, type Song, type RepeatMode } from "./player-store";
import { isNativePlatform, syncNativePlaybackState } from "./native-audio";

const STORAGE_KEY = "r-musics-player-snapshot-v2";

type PlayerSnapshot = {
  userId: string;
  queue: Song[];
  currentIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  progress: number;
  sleepTimer: number | null;
  updatedAt: number;
};

function readLocalSnapshot(userId: string): PlayerSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as PlayerSnapshot | null;
    if (!parsed || parsed.userId !== userId || !Array.isArray(parsed.queue) || !parsed.queue.length) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalSnapshot(userId: string) {
  if (typeof window === "undefined") return;
  const s = usePlayer.getState();
  if (!s.queue.length || s.currentIndex < 0) return;
  const snapshot: PlayerSnapshot = {
    userId,
    queue: s.queue,
    currentIndex: s.currentIndex,
    shuffle: s.shuffle,
    repeat: s.repeat,
    progress: s.progress,
    sleepTimer: s.sleepTimer,
    updatedAt: Date.now(),
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {}
}

/**
 * Persists & restores the player queue + playback state per user via `user_queue`.
 * - Loads once when the user logs in (hydrates the store without auto-playing).
 * - Saves a debounced snapshot whenever queue / index / shuffle / repeat / progress change.
 */
export function usePersistentQueue(userId: string | null) {
  const hydratedFor = useRef<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate on login
  useEffect(() => {
    if (!userId) {
      hydratedFor.current = null;
      return;
    }
    if (hydratedFor.current === userId) return;
    hydratedFor.current = userId;
    (async () => {
      if (usePlayer.getState().queue.length) return;
      const { data } = await supabase
        .from("user_queue")
        .select("queue, current_index, shuffle, repeat, progress, sleep_until, updated_at")
        .eq("user_id", userId)
        .maybeSingle();
      const local = readLocalSnapshot(userId);
      const remote = data
        ? {
            userId,
            queue: (data.queue as unknown as Song[]) ?? [],
            currentIndex: data.current_index ?? 0,
            shuffle: !!data.shuffle,
            repeat: ((data.repeat as RepeatMode) ?? "off") as RepeatMode,
            progress: Number(data.progress) || 0,
            sleepTimer: data.sleep_until ? new Date(data.sleep_until).getTime() : null,
            updatedAt: Date.parse(data.updated_at) || 0,
          }
        : null;
      const snapshot = local && (!remote || local.updatedAt >= remote.updatedAt) ? local : remote;
      if (!snapshot || usePlayer.getState().queue.length) return;
      const queue = snapshot.queue;
      if (!queue.length) return;
      const idx = Math.min(Math.max(snapshot.currentIndex ?? 0, 0), queue.length - 1);
      usePlayer.getState().hydrate({
        queue,
        originalQueue: queue,
        currentIndex: idx,
        shuffle: snapshot.shuffle,
        repeat: snapshot.repeat,
        progress: snapshot.progress,
        duration: queue[idx]?.duration ?? 0,
        _seekTarget: snapshot.progress > 0 ? snapshot.progress : null,
        isPlaying: false,
        sleepTimer: snapshot.sleepTimer,
      });

      // If native player is running in background service, restore the live isPlaying state immediately
      if (isNativePlatform) {
        syncNativePlaybackState();
      }
    })();
  }, [userId]);

  // Save on changes (debounced)
  useEffect(() => {
    if (!userId) return;
    const flushLocal = () => {
      // Capture the latest audio-element position before serialising so a
      // reload picks up exactly where playback was, not the last debounced
      // progress push (which lags by up to ~120ms).
      const audio = typeof document !== "undefined"
        ? (document.querySelector("audio") as HTMLAudioElement | null)
        : null;
      if (audio && Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
        const s = usePlayer.getState();
        if (Math.abs(s.progress - audio.currentTime) > 0.25) {
          usePlayer.setState({ progress: audio.currentTime });
        }
      }
      writeLocalSnapshot(userId);
    };
    window.addEventListener("pagehide", flushLocal);
    document.addEventListener("visibilitychange", flushLocal);
    const unsub = usePlayer.subscribe((state, prev) => {
      const watched =
        state.queue !== prev.queue ||
        state.currentIndex !== prev.currentIndex ||
        state.shuffle !== prev.shuffle ||
        state.repeat !== prev.repeat ||
        state.sleepTimer !== prev.sleepTimer ||
        Math.floor(state.progress) !== Math.floor(prev.progress);
      if (!watched) return;
      writeLocalSnapshot(userId);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const s = usePlayer.getState();
        writeLocalSnapshot(userId);
        await supabase.from("user_queue").upsert({
          user_id: userId,
          queue: s.queue as unknown as any,
          current_index: s.currentIndex,
          shuffle: s.shuffle,
          repeat: s.repeat,
          progress: s.progress,
          sleep_until: s.sleepTimer ? new Date(s.sleepTimer).toISOString() : null,
          updated_at: new Date().toISOString(),
        });
      }, 1500);
    });
    return () => {
      writeLocalSnapshot(userId);
      window.removeEventListener("pagehide", flushLocal);
      document.removeEventListener("visibilitychange", flushLocal);
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userId]);
}