import { create } from "zustand";

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
  openNowPlaying: () => void;
  closeNowPlaying: () => void;
  toggleNowPlaying: () => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
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
};

function shuffleArr<T>(arr: T[], keepIndex: number): T[] {
  const current = arr[keepIndex];
  const rest = arr.filter((_, i) => i !== keepIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
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
  openNowPlaying: () => set({ nowPlayingOpen: true }),
  closeNowPlaying: () => set({ nowPlayingOpen: false }),
  toggleNowPlaying: () => set((s) => ({ nowPlayingOpen: !s.nowPlayingOpen })),
  currentSong: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },
  playQueue: (songs, startIndex = 0) => {
    if (!songs.length) return;
    const { shuffle } = get();
    const q = shuffle ? shuffleArr(songs, startIndex) : songs;
    const idx = shuffle ? 0 : startIndex;
    set({ queue: q, originalQueue: songs, currentIndex: idx, isPlaying: true, progress: 0 });
  },
  playSong: (song) => {
    set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0 });
  },
  togglePlay: () => {
    const { currentIndex } = get();
    if (currentIndex < 0) return;
    set((s) => ({ isPlaying: !s.isPlaying }));
  },
  next: () => {
    const { queue, currentIndex, repeat } = get();
    if (!queue.length) return;
    if (currentIndex + 1 >= queue.length) {
      if (repeat === "all") set({ currentIndex: 0, isPlaying: true, progress: 0 });
      else set({ isPlaying: false });
      return;
    }
    set({ currentIndex: currentIndex + 1, isPlaying: true, progress: 0 });
  },
  prev: () => {
    const { currentIndex, progress } = get();
    if (progress > 3) {
      set({ _seekTarget: 0, progress: 0 });
      return;
    }
    if (currentIndex <= 0) {
      set({ _seekTarget: 0, progress: 0 });
      return;
    }
    set({ currentIndex: currentIndex - 1, isPlaying: true, progress: 0 });
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
      set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0 });
      return;
    }
    set({ queue: [...queue, song], originalQueue: [...originalQueue, song] });
  },
  playNext: (song) => {
    const { queue, originalQueue, currentIndex } = get();
    if (!queue.length) {
      set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0 });
      return;
    }
    const insertAt = currentIndex + 1;
    const nq = [...queue];
    nq.splice(insertAt, 0, song);
    const noq = [...originalQueue];
    noq.splice(insertAt, 0, song);
    set({ queue: nq, originalQueue: noq });
  },
}));