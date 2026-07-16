import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

let _lastPlayedId: string | null = null;
async function recordPlay(song: Song | undefined) {
  if (!song || typeof window === "undefined") return;
  if (_lastPlayedId === song.id) return;
  _lastPlayedId = song.id;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("recently_played").insert({ song_id: song.id, user_id: user.id });
  } catch {}
}

export type Song = {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  thumbnail_url: string | null;
  audio_url: string;
  duration: number;
  genre: string | null;
};

export type RepeatMode = "off" | "all" | "one";

type PlayerState = {
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  sleepTimer: number | null; // ms epoch when stop
  nowPlayingOpen: boolean;
  queuePanelOpen: boolean;
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  toggleNowPlaying: () => void;
  openQueuePanel: () => void;
  closeQueuePanel: () => void;
  toggleQueuePanel: () => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  next: () => Song | null;
  prev: () => Song | null;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setProgress: (p: number) => void;
  setDuration: (d: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  seek: (t: number) => void;
  _seekTarget: number | null;
  clearSeek: () => void;
  setSleepTimer: (minutes: number | null) => void;
  currentSong: () => Song | null;
  addToQueue: (song: Song) => void;
  playNext: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  hydrate: (state: Partial<PlayerState>) => void;
};

function shuffleArr<T extends { artist?: string; genre?: string | null }>(
  arr: T[],
  keepIndex: number,
): T[] {
  // Spotify-style "smart shuffle": Fisher–Yates, then a second pass that
  // tries to avoid two same-artist (or same-genre) songs back-to-back and
  // mildly front-loads diversity.
  const current = arr[keepIndex];
  const rest = arr.filter((_, i) => i !== keepIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  // Anti-adjacency pass — push duplicate-artist neighbors a few slots forward.
  for (let i = 1; i < rest.length; i++) {
    const prev = rest[i - 1];
    if (!prev || rest[i].artist !== prev.artist) continue;
    // Find the next item that differs and swap it in.
    let swap = -1;
    for (let j = i + 1; j < Math.min(rest.length, i + 6); j++) {
      if (rest[j].artist !== prev.artist) { swap = j; break; }
    }
    if (swap !== -1) [rest[i], rest[swap]] = [rest[swap], rest[i]];
  }
  return [current, ...rest];
}

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.8,
  muted: false,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",
  sleepTimer: null,
  _seekTarget: null,
  nowPlayingOpen: false,
  queuePanelOpen: false,
  openNowPlaying: () => set({ nowPlayingOpen: true }),
  closeNowPlaying: () => set({ nowPlayingOpen: false }),
  toggleNowPlaying: () => set((s) => ({ nowPlayingOpen: !s.nowPlayingOpen })),
  openQueuePanel: () => set({ queuePanelOpen: true }),
  closeQueuePanel: () => set({ queuePanelOpen: false }),
  toggleQueuePanel: () => set((s) => ({ queuePanelOpen: !s.queuePanelOpen })),
  currentSong: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },
  playQueue: (songs, startIndex = 0) => {
    if (!songs.length) return;
    const { shuffle } = get();
    const q = shuffle ? shuffleArr(songs, startIndex) : songs;
    const idx = shuffle ? 0 : startIndex;
    set({ queue: q, originalQueue: songs, currentIndex: idx, isPlaying: true, progress: 0, duration: q[idx]?.duration ?? 0 });
    void recordPlay(q[idx]);
  },
  playSong: (song) => {
    set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0, duration: song.duration ?? 0 });
    void recordPlay(song);
  },
  togglePlay: () => {
    const { currentIndex } = get();
    if (currentIndex < 0) return;
    set((s) => ({ isPlaying: !s.isPlaying }));
  },
  next: () => {
    const { queue, currentIndex, repeat, shuffle } = get();
    if (!queue.length) return null;
    // Manual/natural next always advances one track; repeat-one is handled
    // by the audio onEnded path (repeat-one only re-plays on natural end,
    // Spotify skips normally on a manual Next press).
    if (currentIndex + 1 >= queue.length) {
      if (repeat === "all") {
        if (shuffle && queue.length > 1) {
          // Spotify smart-shuffle: reshuffle the whole queue and start fresh
          // at index 0 so the loop feels like a brand new randomized set.
          const reshuffled = shuffleArr(queue, 0);
          set({ queue: reshuffled, currentIndex: 0, isPlaying: true, progress: 0, duration: reshuffled[0]?.duration ?? 0 });
          void recordPlay(reshuffled[0]);
          return reshuffled[0] ?? null;
        } else {
          set({ currentIndex: 0, isPlaying: true, progress: 0, duration: queue[0]?.duration ?? 0 });
          void recordPlay(queue[0]);
          return queue[0] ?? null;
        }
      } else {
        // End of queue, no repeat — Spotify stops but keeps the last track "current".
        set({ isPlaying: false, progress: 0 });
        return null;
      }
    }
    const nextIndex = currentIndex + 1;
    set({ currentIndex: nextIndex, isPlaying: true, progress: 0, duration: queue[nextIndex]?.duration ?? 0 });
    void recordPlay(queue[nextIndex]);
    return queue[nextIndex] ?? null;
  },
  prev: () => {
    const { queue, currentIndex, progress, repeat } = get();
    if (!queue.length || currentIndex < 0) return null;
    // Spotify: > 3s into a track, Prev restarts the current track.
    if (progress > 3) {
      set({ _seekTarget: 0, progress: 0 });
      return queue[currentIndex] ?? null;
    }
    if (currentIndex <= 0) {
      // Wrap to the last track when repeat=all, otherwise restart the first.
      if (repeat === "all" && queue.length > 1) {
        const last = queue.length - 1;
        set({ currentIndex: last, isPlaying: true, progress: 0, duration: queue[last]?.duration ?? 0 });
        void recordPlay(queue[last]);
        return queue[last] ?? null;
      }
      set({ _seekTarget: 0, progress: 0 });
      return queue[0] ?? null;
    }
    const prevIndex = currentIndex - 1;
    set({ currentIndex: prevIndex, isPlaying: true, progress: 0, duration: queue[prevIndex]?.duration ?? 0 });
    void recordPlay(queue[prevIndex]);
    return queue[prevIndex] ?? null;
  },
  setVolume: (v) => set({ volume: v, muted: v === 0 }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  toggleShuffle: () => {
    const { shuffle, queue, originalQueue, currentIndex } = get();
    const next = !shuffle;
    if (!queue.length) {
      set({ shuffle: next });
      return;
    }
    if (next) {
      const reshuffled = shuffleArr(queue, currentIndex);
      set({ shuffle: true, queue: reshuffled, currentIndex: 0 });
    } else {
      const cur = queue[currentIndex];
      const idx = originalQueue.findIndex((s) => s.id === cur?.id);
      set({ shuffle: false, queue: originalQueue, currentIndex: idx >= 0 ? idx : 0 });
    }
  },
  cycleRepeat: () =>
    set((s) => ({
      repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off",
    })),
  seek: (t) => set({ _seekTarget: t, progress: t }),
  clearSeek: () => set({ _seekTarget: null }),
  setSleepTimer: (minutes) =>
    set({ sleepTimer: minutes == null ? null : Date.now() + minutes * 60_000 }),
  addToQueue: (song) => {
    const { queue, originalQueue, currentIndex } = get();
    if (!queue.length) {
      set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0, duration: song.duration ?? 0 });
      return;
    }
    // Insert at top of upcoming queue (right after the currently playing track) — Spotify "Add to Queue" feel
    const insertAt = Math.max(currentIndex + 1, 0);
    const nq = [...queue];
    nq.splice(insertAt, 0, song);
    const noq = [...originalQueue];
    noq.splice(insertAt, 0, song);
    set({ queue: nq, originalQueue: noq });
  },
  playNext: (song) => {
    const { queue, originalQueue, currentIndex } = get();
    if (!queue.length) {
      set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0, duration: song.duration ?? 0 });
      return;
    }
    const insertAt = currentIndex + 1;
    const nq = [...queue];
    nq.splice(insertAt, 0, song);
    const noq = [...originalQueue];
    noq.splice(insertAt, 0, song);
    set({ queue: nq, originalQueue: noq });
  },
  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    if (index < 0 || index >= queue.length) return;
    const nq = queue.filter((_, i) => i !== index);
    let nci = currentIndex;
    if (index < currentIndex) nci = currentIndex - 1;
    else if (index === currentIndex) {
      // keep index pointing at next song; if at end, stop
      if (nci >= nq.length) {
        set({ queue: nq, currentIndex: -1, isPlaying: false, progress: 0 });
        return;
      }
    }
    set({ queue: nq, currentIndex: nci, progress: index === currentIndex ? 0 : get().progress });
  },
  reorderQueue: (from, to) => {
    const { queue, currentIndex } = get();
    if (from === to || from < 0 || to < 0 || from >= queue.length || to >= queue.length) return;
    const nq = [...queue];
    const [moved] = nq.splice(from, 1);
    nq.splice(to, 0, moved);
    let nci = currentIndex;
    if (from === currentIndex) nci = to;
    else if (from < currentIndex && to >= currentIndex) nci = currentIndex - 1;
    else if (from > currentIndex && to <= currentIndex) nci = currentIndex + 1;
    set({ queue: nq, currentIndex: nci });
  },
  hydrate: (state) => set(state as PlayerState),
}));