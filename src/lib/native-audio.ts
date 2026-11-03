import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";
import { usePlayer, type Song, setNativeTogglePlayHandler } from "./player-store";

export interface NativeTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  audio_url: string;
  thumbnail_url: string;
  duration: number;
}

export interface SonaraNativeAudioPlugin {
  setQueue(options: { tracks: NativeTrack[]; startIndex: number; startPosition?: number }): Promise<void>;
  playSong(options: { song: NativeTrack; startTime?: number }): Promise<void>;
  togglePlay(): Promise<void>;
  pause(options?: { reason?: string; caller?: string }): Promise<void>;
  resume(options?: { reason?: string; caller?: string }): Promise<void>;
  next(): Promise<void>;
  prev(): Promise<void>;
  seek(options: { time: number }): Promise<void>;
  setRepeat(options: { repeat: string }): Promise<void>;
  setShuffle(options: { shuffle: boolean }): Promise<void>;
  getState(): Promise<{ isPlaying: boolean; position: number; duration: number; currentIndex: number }>;
  requestNotificationPermission(): Promise<{ granted: boolean }>;

  addListener(
    eventName: "trackTransition",
    listenerFunc: (event: { index: number; song?: NativeTrack }) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "playbackState",
    listenerFunc: (event: { isPlaying: boolean }) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "progress",
    listenerFunc: (event: { position: number; duration: number }) => void,
  ): Promise<PluginListenerHandle>;

  addListener(
    eventName: "error",
    listenerFunc: (event: { message: string }) => void,
  ): Promise<PluginListenerHandle>;
}

export const SonaraNativeAudio = registerPlugin<SonaraNativeAudioPlugin>("SonaraNativeAudio");

export const isNativePlatform = Capacitor.isNativePlatform();

let isInitialized = false;
let trackChangeListener: ((songId: string, index: number) => void) | null = null;
let stateChangeListener: ((isPlaying: boolean) => void) | null = null;

export function setNativeTrackChangeListener(fn: (songId: string, index: number) => void) {
  trackChangeListener = fn;
}

export function setNativeStateChangeListener(fn: (isPlaying: boolean) => void) {
  stateChangeListener = fn;
}

function mapSongToNative(song: Song): NativeTrack {
  return {
    id: song.id,
    title: song.title || "Unknown Title",
    artist: song.artist || "Unknown Artist",
    album: song.album || "Sonara Music",
    audio_url: song.audio_url || "",
    thumbnail_url: song.thumbnail_url || "",
    duration: song.duration || 0,
  };
}

export async function initNativeAudioBridge() {
  if (!isNativePlatform || isInitialized) return;
  isInitialized = true;

  // Direct native togglePlay handler to eliminate reactive pause echo loops
  setNativeTogglePlayHandler(async () => {
    try {
      const nativeState = await SonaraNativeAudio.getState();
      if (!nativeState || nativeState.currentIndex < 0) {
        const state = usePlayer.getState();
        if (state.queue.length > 0 && state.currentIndex >= 0) {
          await playQueueNative(state.queue, state.currentIndex, state.progress || 0);
          return;
        }
      }
    } catch {}
    await togglePlayNative();
  });

  try {
    // Request notification permission for lock-screen controls on Android 13+
    await SonaraNativeAudio.requestNotificationPermission().catch(() => {});

    // Listen for native track completions and queue advances (running in ExoPlayer service)
    await SonaraNativeAudio.addListener("trackTransition", ({ index, song }) => {
      const state = usePlayer.getState();
      const currentTrack = state.queue[index] || song;
      if (currentTrack) {
        if (trackChangeListener) {
          trackChangeListener(currentTrack.id, index);
        }
        usePlayer.setState({
          currentIndex: index,
          duration: currentTrack.duration || (song?.duration ?? 0),
          progress: 0,
          isPlaying: true,
        });
      }
    });

    // Listen for playback state changes (play, pause from lock screen or notification)
    await SonaraNativeAudio.addListener("playbackState", ({ isPlaying }) => {
      console.log(`[SonaraNativeAudio] Native playbackState received: isPlaying=${isPlaying}`);
      if (stateChangeListener) {
        stateChangeListener(isPlaying);
      }
      usePlayer.setState({ isPlaying });
    });

    // Listen for real-time progress updates from native ExoPlayer
    await SonaraNativeAudio.addListener("progress", ({ position, duration }) => {
      if (Number.isFinite(position) && position >= 0) {
        const updates: Partial<{ progress: number; duration: number }> = { progress: position };
        if (Number.isFinite(duration) && duration > 0) {
          updates.duration = duration;
        }
        usePlayer.setState(updates);
      }
    });

    await SonaraNativeAudio.addListener("error", ({ message }) => {
      console.warn("[SonaraNativeAudio] Error:", message);
    });
  } catch (err) {
    console.warn("[SonaraNativeAudio] Initialization note:", err);
  }
}

export async function playQueueNative(songs: Song[], startIndex = 0, startPosition = 0) {
  if (!isNativePlatform) return;
  await initNativeAudioBridge();

  const nativeTracks = songs.map(mapSongToNative);
  await SonaraNativeAudio.setQueue({
    tracks: nativeTracks,
    startIndex,
    startPosition,
  });

  const state = usePlayer.getState();
  await SonaraNativeAudio.setRepeat({ repeat: state.repeat });
  await SonaraNativeAudio.setShuffle({ shuffle: state.shuffle });
}

export async function playNativeSong(song: Song, startTime = 0) {
  if (!isNativePlatform) return;
  await initNativeAudioBridge();

  const state = usePlayer.getState();
  const queue = state.queue.length ? state.queue : [song];
  const idx = state.queue.findIndex((s) => s.id === song.id);
  const startIndex = idx >= 0 ? idx : 0;

  await playQueueNative(queue, startIndex, startTime);
}

export async function togglePlayNative() {
  if (!isNativePlatform) return;
  await SonaraNativeAudio.togglePlay();
}

export async function pauseNativeAudio(reason = "user_action", caller = "unknown") {
  if (!isNativePlatform) return;
  console.log(`[SonaraNativeAudio] pause requested. reason=${reason}, caller=${caller}`);
  await SonaraNativeAudio.pause({ reason, caller });
}

export async function resumeNativeAudio(reason = "user_action", caller = "unknown") {
  if (!isNativePlatform) return;
  console.log(`[SonaraNativeAudio] resume requested. reason=${reason}, caller=${caller}`);
  await SonaraNativeAudio.resume({ reason, caller });
}

export async function nextNativeAudio() {
  if (!isNativePlatform) return;
  await SonaraNativeAudio.next();
}

export async function prevNativeAudio() {
  if (!isNativePlatform) return;
  await SonaraNativeAudio.prev();
}

export async function seekNativeAudio(time: number) {
  if (!isNativePlatform) return;
  await SonaraNativeAudio.seek({ time });
}

export async function setRepeatNativeAudio(repeat: string) {
  if (!isNativePlatform) return;
  await SonaraNativeAudio.setRepeat({ repeat });
}

export async function setShuffleNativeAudio(shuffle: boolean) {
  if (!isNativePlatform) return;
  await SonaraNativeAudio.setShuffle({ shuffle });
}
