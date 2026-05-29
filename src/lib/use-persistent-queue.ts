import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePlayer, type Song, type RepeatMode } from "./player-store";

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
      const { data } = await supabase
        .from("user_queue")
        .select("queue, current_index, shuffle, repeat, progress, sleep_until")
        .eq("user_id", userId)
        .maybeSingle();
      if (!data) return;
      const queue = (data.queue as unknown as Song[]) ?? [];
      if (!queue.length) return;
      const idx = Math.min(Math.max(data.current_index ?? 0, 0), queue.length - 1);
      usePlayer.getState().hydrate({
        queue,
        originalQueue: queue,
        currentIndex: idx,
        shuffle: !!data.shuffle,
        repeat: (data.repeat as RepeatMode) ?? "off",
        progress: Number(data.progress) || 0,
        _seekTarget: Number(data.progress) || 0,
        isPlaying: false,
        sleepTimer: data.sleep_until ? new Date(data.sleep_until).getTime() : null,
      });
    })();
  }, [userId]);

  // Save on changes (debounced)
  useEffect(() => {
    if (!userId) return;
    const unsub = usePlayer.subscribe((state, prev) => {
      const watched =
        state.queue !== prev.queue ||
        state.currentIndex !== prev.currentIndex ||
        state.shuffle !== prev.shuffle ||
        state.repeat !== prev.repeat ||
        Math.floor(state.progress) !== Math.floor(prev.progress);
      if (!watched) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const s = usePlayer.getState();
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
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userId]);
}