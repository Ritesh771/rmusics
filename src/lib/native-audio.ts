import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capgo/capacitor-native-audio";
import { usePlayer, type Song } from "./player-store";

export const isNativePlatform = Capacitor.isNativePlatform();

let configured = false;
let currentAssetId: string | null = null;
let syncInterval: ReturnType<typeof setInterval> | null = null;

export async function initNativeAudioBridge() {
  if (!isNativePlatform || configured) return;

  try {
    await NativeAudio.configure({
      background: true,
      backgroundPlayback: true,
      showNotification: true,
      focus: true,
      ignoreSilent: true,
    });
    configured = true;

    // Listen to native completion event to advance to next song in queue
    await NativeAudio.addListener("complete", ({ assetId }) => {
      if (assetId === currentAssetId) {
        const state = usePlayer.getState();
        if (state.repeat === "one") {
          // Replay current song from 0
          if (state.queue[state.currentIndex]) {
            playNativeSong(state.queue[state.currentIndex], 0, state.muted ? 0 : state.volume);
          }
        } else {
          state.next();
        }
      }
    });

    // Listen to native time events emitted by the native player
    await NativeAudio.addListener("currentTime", ({ assetId, currentTime }) => {
      if (assetId === currentAssetId && Number.isFinite(currentTime)) {
        usePlayer.setState({ progress: currentTime });
      }
    });

    // Listen to lock-screen / notification controls (Play / Pause / Next / Prev)
    await NativeAudio.addListener("playbackState", (event) => {
      const state = (event as any)?.state;
      const isPlaying = (event as any)?.isPlaying ?? (state === "playing");
      usePlayer.setState({ isPlaying });
    });
  } catch (err) {
    console.warn("[NativeAudioBridge] Configuration error:", err);
  }
}

export async function playNativeSong(song: Song, startTime = 0, volume = 1) {
  if (!isNativePlatform) return;
  await initNativeAudioBridge();

  const newAssetId = `song_${song.id}`;

  try {
    // Unload previous native asset if running
    if (currentAssetId && currentAssetId !== newAssetId) {
      await NativeAudio.stop({ assetId: currentAssetId }).catch(() => {});
      await NativeAudio.unload({ assetId: currentAssetId }).catch(() => {});
      currentAssetId = null;
    }

    // Check if already preloaded
    const isLoaded = await NativeAudio.isPreloaded({
      assetId: newAssetId,
      assetPath: song.audio_url,
      isUrl: true,
    }).then((r) => r.found).catch(() => false);

    if (!isLoaded) {
      await NativeAudio.preload({
        assetId: newAssetId,
        assetPath: song.audio_url,
        isUrl: true,
        volume: Math.max(0.1, Math.min(1.0, volume)),
        notificationMetadata: {
          title: song.title,
          artist: song.artist,
          album: song.album || "Sonara Music",
          artworkUrl: song.thumbnail_url || undefined,
        },
      });
    }

    currentAssetId = newAssetId;
    await NativeAudio.play({
      assetId: newAssetId,
      time: startTime > 0 ? startTime : 0,
      volume: Math.max(0.1, Math.min(1.0, volume)),
    });

    // Start native time sync loop to update UI progress & duration
    startTimeSync(newAssetId);
  } catch (err) {
    console.error("[NativeAudioBridge] Play error:", err);
  }
}

export async function pauseNativeAudio() {
  if (!isNativePlatform || !currentAssetId) return;
  try {
    await NativeAudio.pause({ assetId: currentAssetId });
  } catch (err) {
    console.warn("[NativeAudioBridge] Pause error:", err);
  }
}

export async function resumeNativeAudio() {
  if (!isNativePlatform || !currentAssetId) return;
  try {
    await NativeAudio.resume({ assetId: currentAssetId });
  } catch (err) {
    console.warn("[NativeAudioBridge] Resume error:", err);
  }
}

export async function seekNativeAudio(time: number) {
  if (!isNativePlatform || !currentAssetId) return;
  try {
    await NativeAudio.setCurrentTime({
      assetId: currentAssetId,
      time: Math.max(0, time),
    });
  } catch (err) {
    console.warn("[NativeAudioBridge] Seek error:", err);
  }
}

export async function setNativeVolume(vol: number) {
  if (!isNativePlatform || !currentAssetId) return;
  try {
    await NativeAudio.setVolume({
      assetId: currentAssetId,
      volume: Math.max(0.1, Math.min(1.0, vol)),
    });
  } catch {}
}

function startTimeSync(assetId: string) {
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(async () => {
    if (!currentAssetId || currentAssetId !== assetId) {
      if (syncInterval) clearInterval(syncInterval);
      return;
    }
    try {
      const [{ currentTime }, { duration }, { isPlaying }] = await Promise.all([
        NativeAudio.getCurrentTime({ assetId }),
        NativeAudio.getDuration({ assetId }),
        NativeAudio.isPlaying({ assetId }),
      ]);

      if (Number.isFinite(duration) && duration > 0) {
        usePlayer.setState({
          progress: currentTime,
          duration,
          isPlaying,
        });
      }
    } catch {}
  }, 500);
}

