import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer, type Song } from "@/lib/player-store";
import { cn } from "@/lib/utils";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Clock,
  Music,
  PanelRight,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/owner";
import { cleanSongTitle } from "@/lib/song-utils";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { streamUrl } from "@/lib/stream-url";
import { useShakeVolume } from "@/lib/use-shake-volume";
import { seekCommitHaptic, seekDragHaptic, seekTouchHaptic } from "@/lib/haptics";
import { attachEqualizerToAudio, resumeAudioContext, useEqualizer } from "@/lib/equalizer-store";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListMusic } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FastSeekAudio = HTMLAudioElement & { fastSeek?: (time: number) => void };

export function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastProgressPush = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const playRequestRef = useRef(0);
  const suppressPauseUntil = useRef(0);
  const errorRetryRef = useRef(0);
  const completedSongRef = useRef<string | null>(null);
  const scrubbingRef = useRef(false);
  const seekHoldRef = useRef<{ target: number; until: number } | null>(null);
  const prefetchRef = useRef<HTMLAudioElement | null>(null);
  const prefetchedIdRef = useRef<string | null>(null);
  const playRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const _seekTarget = usePlayer((s) => s._seekTarget);
  const sleepTimer = usePlayer((s) => s.sleepTimer);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleMute = usePlayer((s) => s.toggleMute);
  const setProgress = usePlayer((s) => s.setProgress);
  const setDuration = usePlayer((s) => s.setDuration);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const seek = usePlayer((s) => s.seek);
  const clearSeek = usePlayer((s) => s.clearSeek);
  const setSleepTimer = usePlayer((s) => s.setSleepTimer);
  const openNowPlaying = usePlayer((s) => s.openNowPlaying);
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const toggleNowPlaying = usePlayer((s) => s.toggleNowPlaying);
  const toggleQueuePanel = usePlayer((s) => s.toggleQueuePanel);
  const sidebarRightOpen = usePlayer((s) => s.sidebarRightOpen);
  const toggleSidebarRight = usePlayer((s) => s.toggleSidebarRight);
  const qc = useQueryClient();
  const { user } = useAuth();
  useShakeVolume();

  const commitSeek = useCallback(
    (time: number) => {
      const state = usePlayer.getState();
      const max = state.duration || Number.POSITIVE_INFINITY;
      const target = Math.max(0, Math.min(time, max));
      // Immediately set the HTML audio currentTime for zero-lag forward/backward
      const audio = audioRef.current;
      if (audio) {
        try {
          audio.currentTime = target;
          if (state.isPlaying && audio.paused) {
            audio.play().catch(() => {});
          }
        } catch {}
      }
      seekHoldRef.current = { target, until: performance.now() + 300 };
      setProgress(target);
      seek(target);
    },
    [seek, setProgress],
  );

  const seekAudio = useCallback((audio: HTMLAudioElement, time: number) => {
    const target = Math.max(0, Number.isFinite(time) ? time : 0);
    try {
      audio.currentTime = target;
      if (usePlayer.getState().isPlaying && audio.paused) {
        audio.play().catch(() => {});
      }
    } catch {
      pendingSeekRef.current = target;
    }
  }, []);

  // Keep asking the media element to play for a few seconds after a source
  // swap. Background/locked browsers often reject the first play() call and
  // only honor a later one once the new stream is buffered — without this the
  // queue silently stops after a couple of tracks.
  const ensurePlaying = useCallback((attempt = 0) => {
    resumeAudioContext();
    if (playRetryRef.current) {
      clearTimeout(playRetryRef.current);
      playRetryRef.current = null;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (!usePlayer.getState().isPlaying) return;
    audio.autoplay = true;
    if (!audio.paused) return;
    audio.play().catch(() => undefined);
    if (attempt < 12) {
      playRetryRef.current = setTimeout(() => ensurePlaying(attempt + 1), 500);
    }
  }, []);

  const playAudioSong = useCallback(
    (targetSong: Song | null, seekTo = 0) => {
      const audio = audioRef.current;
      if (!audio || !targetSong) return;
      const requestId = ++playRequestRef.current;
      completedSongRef.current = null;
      // Keeping autoplay armed before replacing src lets the media element
      // continue as soon as the next response is ready, even while mobile
      // browsers heavily throttle page JavaScript in the background.
      audio.autoplay = true;
      if (audio.dataset.songId !== targetSong.id) {
        // Cover slow networks and background src swaps — otherwise the natural
        // "pause" event fired by src replacement flips isPlaying to false.
        suppressPauseUntil.current = Date.now() + 15000;
        audio.dataset.songId = targetSong.id;
        audio.src = streamUrl(targetSong.audio_url);
        audio.load();
      }
      pendingSeekRef.current = null;
      errorRetryRef.current = 0;
      seekAudio(audio, seekTo);
      audio
        .play()
        .then(() => {
          if (requestId === playRequestRef.current) {
            usePlayer.setState({ isPlaying: true });
          }
        })
        .catch(() => {
          // Keep autoplay armed. Mobile browsers can defer this request while
          // locked and then honor it when the new source becomes playable.
          audio.autoplay = true;
        });
      usePlayer.setState({ isPlaying: true });
      ensurePlaying(0);
    },
    [seekAudio, ensurePlaying],
  );

  const advanceToNext = useCallback(() => {
    const upcoming = next();
    if (upcoming) playAudioSong(upcoming, 0);
  }, [next, playAudioSong]);

  const completeCurrentSong = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const state = usePlayer.getState();
    const currentSong = state.queue[state.currentIndex];
    if (!currentSong || completedSongRef.current === currentSong.id) return;
    completedSongRef.current = currentSong.id;

    if (state.repeat === "one") {
      completedSongRef.current = null;
      suppressPauseUntil.current = Date.now() + 5000;
      seekAudio(audio, 0);
      usePlayer.setState({ progress: 0, isPlaying: true });
      audio.autoplay = true;
      audio.play().catch(() => undefined);
      return;
    }

    const upcoming = state.next();
    if (upcoming) {
      try { navigator.mediaSession.playbackState = "playing"; } catch {}
      playAudioSong(upcoming, 0);
    }
  }, [playAudioSong, seekAudio]);

  const goToPrevious = useCallback(() => {
    const previous = prev();
    if (previous) playAudioSong(previous, 0);
  }, [prev, playAudioSong]);

  const publishAudioTime = useCallback((force = false) => {
    const audio = audioRef.current;
    if (!audio || scrubbingRef.current) return;
    const hold = seekHoldRef.current;
    if (hold) {
      // Release the hold as soon as the element actually lands near the target.
      if (Math.abs(audio.currentTime - hold.target) < 0.5 || performance.now() > hold.until) {
        seekHoldRef.current = null;
      } else {
        return;
      }
    }
    const now = performance.now();
    if (
      force ||
      now - lastProgressPush.current > 120 ||
      Math.abs(usePlayer.getState().progress - audio.currentTime) > 0.35
    ) {
      lastProgressPush.current = now;
      setProgress(audio.currentTime);
    }
  }, [setProgress]);

  // Audio src/play control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!song) {
      audio.autoplay = false;
      audio.pause();
      audio.removeAttribute("src");
      audio.dataset.songId = "";
      return;
    }
    if (audio.dataset.songId !== song.id) {
      if (isPlaying) suppressPauseUntil.current = Date.now() + 5000;
      audio.dataset.songId = song.id;
      audio.src = streamUrl(song.audio_url);
      const resumeAt = Math.max(0, usePlayer.getState().progress || 0);
      pendingSeekRef.current = resumeAt;
      errorRetryRef.current = 0;
      audio.load();
      setDuration(song.duration ?? 0);
    }
    audio.autoplay = isPlaying;
    if (isPlaying) audio.play().catch(() => {});
    else audio.pause();
  }, [song?.id, song?.audio_url, isPlaying, setDuration]);

  // Volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  // Seek
  useEffect(() => {
    if (_seekTarget != null && audioRef.current) {
      const audio = audioRef.current;
      seekHoldRef.current = { target: _seekTarget, until: performance.now() + 300 };
      const readyForSeek =
        audio.readyState >= 1 &&
        (!Number.isFinite(audio.duration) || audio.currentSrc);
      if (readyForSeek) {
        seekAudio(audio, _seekTarget);
      } else {
        pendingSeekRef.current = _seekTarget;
      }
      clearSeek();
    }
  }, [_seekTarget, clearSeek, seekAudio]);

  // Smooth progress via rAF — avoids the choppy ~4Hz timeupdate event
  useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    const tick = () => {
      publishAudioTime();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, publishAudioTime]);

  // Sleep timer
  useEffect(() => {
    if (!sleepTimer) return;
    const id = setInterval(() => {
      if (Date.now() >= sleepTimer) {
        usePlayer.setState({ isPlaying: false, sleepTimer: null });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [sleepTimer]);

  // Background playback healer — setInterval keeps ticking (throttled to ~1Hz)
  // when the tab is hidden or the phone screen is locked, unlike rAF which pauses.
  // If audio silently stalled, resume it; if it ended without firing onEnded
  // in background, advance to the next track (Spotify-style continuous playback).
  useEffect(() => {
    const id = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const state = usePlayer.getState();
      const currentSong = state.queue[state.currentIndex];
      if (!currentSong) return;
      // Reconciliation: if the audio element is playing a different song
      // than what the store thinks is current, resync the src. This keeps
      // UI seek/progress/queue in lock-step with the actual audio.
      if (audio.dataset.songId !== currentSong.id) {
        suppressPauseUntil.current = Date.now() + 5000;
        audio.dataset.songId = currentSong.id;
        audio.src = streamUrl(currentSong.audio_url);
        pendingSeekRef.current = Math.max(0, state.progress || 0);
        audio.load();
        if (state.isPlaying) audio.play().catch(() => {});
        return;
      }
      // Sync progress from the audio element (rAF is paused in background)
      if (!scrubbingRef.current && !seekHoldRef.current && Math.abs(state.progress - audio.currentTime) > 0.5) {
        setProgress(audio.currentTime);
      }
      if (audio.ended) {
        completeCurrentSong();
        return;
      }
      // Timing safety net: some browsers stop firing `ended` in background and
      // just park the element at the very end. Treat that as completion so the
      // next track starts on time instead of stalling silently.
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (dur > 0 && audio.currentTime >= dur - 0.35 && audio.paused && state.isPlaying) {
        completeCurrentSong();
        return;
      }
      // Heal accidental pause: user intent is playing but element is paused.
      if (state.isPlaying && audio.paused && Date.now() > suppressPauseUntil.current) {
        ensurePlaying(0);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [completeCurrentSong, setProgress, ensurePlaying]);

  // Attach the completion handler directly to the media element. Native media
  // listeners are the most reliable wake-up path on iOS/Android when React and
  // normal timers are suspended after the screen locks.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
      const onEnded = () => completeCurrentSong();
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [completeCurrentSong]);

  // Buffer the upcoming track in a second, silent element so the transition
  // works even when the browser wakes the page late (screen unlock / locked PWA).
  useEffect(() => {
    const upcomingIndex = usePlayer.getState().currentIndex + 1;
    const upcoming = usePlayer.getState().queue[upcomingIndex];
    if (!upcoming || prefetchedIdRef.current === upcoming.id) return;
    prefetchedIdRef.current = upcoming.id;
    let el = prefetchRef.current;
    if (!el) {
      el = document.createElement("audio");
      el.preload = "auto";
      el.muted = true;
      el.volume = 0;
      prefetchRef.current = el;
    }
    el.src = streamUrl(upcoming.audio_url);
    try { el.load(); } catch {}
  }, [song?.id]);

  // Resume/continue playback when the screen unlocks or the app becomes visible
  // again: reconcile the element with the store, restore the exact position and
  // keep going instead of restarting or stalling.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const resync = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.visibilityState !== "visible") return;
      const state = usePlayer.getState();
      const currentSong = state.queue[state.currentIndex];
      if (!currentSong) return;
      // The audio element drifted onto a different (or no) source while hidden.
      if (audio.dataset.songId !== currentSong.id || !audio.currentSrc) {
        suppressPauseUntil.current = Date.now() + 5000;
        audio.dataset.songId = currentSong.id;
        audio.src = streamUrl(currentSong.audio_url);
        pendingSeekRef.current = Math.max(0, state.progress || 0);
        audio.load();
        if (state.isPlaying) ensurePlaying(0);
        return;
      }
      // Track finished while the screen was locked but nothing advanced.
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (audio.ended || (dur > 0 && audio.currentTime >= dur - 0.3 && audio.paused)) {
        completeCurrentSong();
        return;
      }
      if (!scrubbingRef.current && !seekHoldRef.current) setProgress(audio.currentTime);
      if (state.isPlaying && audio.paused) ensurePlaying(0);
    };
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    window.addEventListener("pageshow", resync);
    return () => {
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("focus", resync);
      window.removeEventListener("pageshow", resync);
    };
  }, [setProgress, ensurePlaying, completeCurrentSong]);

  useEffect(() => () => {
    if (playRetryRef.current) clearTimeout(playRetryRef.current);
    const el = prefetchRef.current;
    if (el) {
      el.removeAttribute("src");
      try { el.load(); } catch {}
    }
  }, []);

  // MediaSession — lock-screen / notification controls + reliable background playback
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!song) {
      try { navigator.mediaSession.metadata = null; } catch {}
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album ?? "",
        artwork: song.thumbnail_url
          ? [96, 128, 192, 256, 384, 512].flatMap((s) =>
              ["image/jpeg", "image/png"].map((type) => ({
                // Same-origin proxy so iOS/Android can actually fetch the art.
                src: streamUrl(song.thumbnail_url),
                sizes: `${s}x${s}`,
                type,
              })),
            )
          : [],
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch {
      // Some browsers reject remote artwork metadata.
    }
    const ms = navigator.mediaSession;
    const safe = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
        // Unsupported action on this browser.
      }
    };
    safe("play", () => {
      resumeAudioContext();
      if (audioRef.current) audioRef.current.autoplay = true;
      audioRef.current
        ?.play()
        .then(() => {
          usePlayer.setState({ isPlaying: true });
          try { navigator.mediaSession.playbackState = "playing"; } catch {}
        })
        .catch(() => undefined);
    });
    safe("pause", () => {
      if (audioRef.current) {
        audioRef.current.autoplay = false;
        audioRef.current.pause();
      }
      usePlayer.setState({ isPlaying: false });
      try { navigator.mediaSession.playbackState = "paused"; } catch {}
    });
    safe("previoustrack", goToPrevious);
    safe("nexttrack", advanceToNext);
    safe("seekto", (e) => {
      if (typeof e.seekTime !== "number") return;
      const audio = audioRef.current;
      if (e.fastSeek && audio && typeof (audio as FastSeekAudio).fastSeek === "function") {
        (audio as FastSeekAudio).fastSeek!(e.seekTime);
        setProgress(e.seekTime);
        return;
      }
      commitSeek(e.seekTime);
    });
    safe("seekbackward", (e) => {
      const by = e.seekOffset ?? 10;
      commitSeek(usePlayer.getState().progress - by);
    });
    safe("seekforward", (e) => {
      const by = e.seekOffset ?? 10;
      commitSeek(usePlayer.getState().progress + by);
    });
    safe("stop", () => {
      audioRef.current?.pause();
      usePlayer.setState({ isPlaying: false });
    });
    return () => {
      [
        "play", "pause", "previoustrack", "nexttrack",
        "seekto", "seekbackward", "seekforward", "stop",
      ].forEach((a) => safe(a as MediaSessionAction, null));
    };
  }, [song?.id, song?.title, song?.artist, song?.album, song?.thumbnail_url, isPlaying, advanceToNext, goToPrevious, commitSeek, setProgress]);

  // Keep position state up-to-date for OS scrubber
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!duration || !isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState?.({
        duration,
        position: Math.max(0, Math.min(audioRef.current?.currentTime ?? progress, duration)),
        playbackRate: audioRef.current?.playbackRate ?? 1,
      });
    } catch {}
  }, [progress, duration, isPlaying]);

  // Liked songs
  const { data: liked = [] } = useQuery({
    queryKey: ["liked", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id").eq("user_id", user!.id);
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!user,
  });
  const isLiked = song ? liked.includes(song.id) : false;

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!song || !user) return;
      if (isLiked) {
        await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      } else {
        await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] }),
  });

  // Attach equalizer only if the user explicitly enabled it
  useEffect(() => {
    if (audioRef.current) {
      if (useEqualizer.getState().enabled) {
        attachEqualizerToAudio(audioRef.current);
      }
    }
  }, []);

  // Listen for EQ enable toggle from Settings to attach dynamically
  useEffect(() => {
    return useEqualizer.subscribe((state, prevState) => {
      if (state.enabled && !prevState.enabled && audioRef.current) {
        attachEqualizerToAudio(audioRef.current);
      }
    });
  }, []);

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
        crossOrigin="anonymous"
        onLoadedMetadata={(e) => {
          const audio = e.currentTarget;
          const loadedSong = usePlayer.getState().currentSong();
          // Guard: only apply hydrated state if this metadata belongs to the
          // song the store currently expects. Prevents seek/duration values
          // from bleeding across a fast track swap.
          if (loadedSong && audio.dataset.songId !== loadedSong.id) return;
          const realDuration = Number.isFinite(audio.duration) ? audio.duration : (loadedSong?.duration ?? 0);
          setDuration(realDuration);
          const pending = pendingSeekRef.current;
          if (pending != null) {
            pendingSeekRef.current = null;
            seekAudio(audio, Math.min(pending, realDuration || pending));
            setProgress(Math.min(pending, realDuration || pending));
          }
        }}
        onPlay={() => {
          suppressPauseUntil.current = 0;
          resumeAudioContext();
          if (audioRef.current) audioRef.current.autoplay = true;
          usePlayer.setState({ isPlaying: true });
          if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
            try { navigator.mediaSession.playbackState = "playing"; } catch {}
          }
        }}
        onPause={() => {
          const audio = audioRef.current;
          // Safari can deliver the terminal pause while delaying/suppressing
          // `ended` after screen lock. Treat a pause at the media boundary as
          // native completion so the next source is installed immediately.
          if (audio?.ended || (audio && Number.isFinite(audio.duration) && audio.duration > 0 && audio.currentTime >= audio.duration - 0.1)) {
            completeCurrentSong();
            return;
          }
          if (Date.now() < suppressPauseUntil.current) return;
          if (audioRef.current) audioRef.current.autoplay = false;
          usePlayer.setState({ isPlaying: false });
          if (typeof navigator !== "undefined" && "mediaSession" in navigator) {
            try { navigator.mediaSession.playbackState = "paused"; } catch {}
          }
        }}
        onCanPlay={() => { if (usePlayer.getState().isPlaying) audioRef.current?.play().catch(() => {}); }}
        onStalled={() => {
          // Network hiccup — nudge the element without dropping playback intent.
          if (usePlayer.getState().isPlaying) audioRef.current?.play().catch(() => {});
        }}
        onError={(e) => {
          const audio = audioRef.current;
          if (!audio) return;
          const currentSrc = audio.src;
          const songUrl = song ? streamUrl(song.audio_url) : "";

          // Fallback: If same-origin proxy fails or 403s, fall back directly to upstream audio URL
          if (song?.audio_url && currentSrc !== song.audio_url && !currentSrc.includes("direct_fallback=1")) {
            console.warn("[Player] Stream proxy error, falling back to direct audio URL:", song.audio_url);
            audio.src = song.audio_url;
            audio.load();
            if (usePlayer.getState().isPlaying) audio.play().catch(() => {});
            return;
          }

          const state = usePlayer.getState();
          // Repeat-one: try harder before giving up so a hiccup doesn't skip
          // the song the user explicitly asked to loop.
          const maxRetries = state.repeat === "one" ? 3 : 1;
          errorRetryRef.current += 1;
          if (errorRetryRef.current <= maxRetries) {
            suppressPauseUntil.current = Date.now() + 5000;
            const at = state.progress || 0;
            pendingSeekRef.current = at;
            audio.load();
            audio.play().catch(() => {});
          } else {
            errorRetryRef.current = 0;
            // On repeat-one, restart from 0 instead of skipping.
            if (state.repeat === "one") {
              pendingSeekRef.current = 0;
              audio.load();
              audio.play().catch(() => {});
            } else {
              advanceToNext();
            }
          }
        }}
        onTimeUpdate={() => publishAudioTime(true)}
        onSeeked={() => {
          const audio = audioRef.current;
          if (!audio) return;
          seekHoldRef.current = null;
          if (!scrubbingRef.current) setProgress(audio.currentTime);
          if (usePlayer.getState().isPlaying && audio.paused) audio.play().catch(() => {});
        }}
      />

      {/* MOBILE compact player — Spotify-style bar above the floating glass nav */}
      {song && (
        <div
          onClick={openNowPlaying}
          className="md:hidden fixed left-3 right-3 bottom-[calc(82px+env(safe-area-inset-bottom,0px))] h-14 z-40 bg-card/85 dark:bg-card/75 backdrop-blur-xl border border-border/80 dark:border-white/10 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.16)] dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)] ring-1 ring-black/5 dark:ring-white/5 flex items-center gap-2 pl-2 pr-3 overflow-hidden cursor-pointer transition-all duration-300"
        >
          <div className="h-10 w-10 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center">
            {song.thumbnail_url ? (
              <img src={song.thumbnail_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Music className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold truncate text-foreground">{cleanSongTitle(song.title)}</div>
            <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
          </div>
          <Button
            size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-foreground/80 hover:text-foreground hover:bg-accent/60"
            onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
            aria-label="Previous"
            title="Previous"
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-foreground hover:bg-accent/60"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
          </Button>
          <Button
            size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-foreground/80 hover:text-foreground hover:bg-accent/60"
            onClick={(e) => { e.stopPropagation(); advanceToNext(); }}
            aria-label="Next"
            title="Next"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 shrink-0 text-foreground/80 hover:text-foreground hover:bg-accent/60"
                onClick={(e) => e.stopPropagation()}
                title="Sleep timer"
                aria-label="Sleep timer"
              >
                <Clock className={sleepTimer ? "h-4 w-4 text-primary" : "h-4 w-4"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {[5, 15, 30, 60].map((m) => (
                <DropdownMenuItem key={m} onClick={() => setSleepTimer(m)}>
                  {m} minutes
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setSleepTimer(null)}>Cancel timer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-foreground/80 hover:text-foreground hover:bg-accent/60"
            onClick={(e) => { e.stopPropagation(); toggleQueuePanel(); }}
            aria-label="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </Button>
          {/* Interactive progress scrub bar */}
          <div
            className="absolute left-0 right-0 bottom-0 h-3 flex items-end cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              const targetTime = ratio * (duration || 0);
              commitSeek(targetTime);
              seekCommitHaptic();
            }}
          >
            <div className="w-full h-1 group-hover:h-1.5 transition-all bg-muted-foreground/20 relative">
              <div
                className="h-full origin-left bg-primary transition-transform duration-150 ease-linear will-change-transform"
                style={{ transform: `scaleX(${duration ? Math.min(progress / duration, 1) : 0})` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* DESKTOP full player bar — fixed at bottom of viewport */}
      <div className="hidden md:flex fixed bottom-0 left-0 right-0 h-20 z-50 bg-card/95 backdrop-blur-md border-t border-border/80 px-4 items-center gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        {/* Song info */}
        <div className="flex items-center gap-3 w-1/4 min-w-0">
          {song && (
            <>
              <button
                onClick={toggleNowPlaying}
                className="h-14 w-14 rounded-xl bg-muted shrink-0 overflow-hidden flex items-center justify-center hover:opacity-90 shadow-sm border border-border/60 cursor-pointer"
                aria-label="Toggle now playing"
              >
                {song.thumbnail_url ? (
                  <img src={song.thumbnail_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Music className="h-6 w-6 text-muted-foreground" />
                )}
              </button>
              <button onClick={toggleNowPlaying} className="min-w-0 hidden sm:block text-left hover:underline cursor-pointer">
                <div className="text-sm font-semibold truncate text-foreground">{cleanSongTitle(song.title)}</div>
                <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
              </button>
              <Button
                size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer"
                onClick={() => toggleLike.mutate()}
              >
                <Heart className={isLiked ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
              </Button>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto">
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer" onClick={toggleShuffle}>
              <Shuffle className={shuffle ? "h-4 w-4 text-primary" : "h-4 w-4"} />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer" onClick={goToPrevious}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-md transition flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
              disabled={!song}
            >
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 fill-current ml-0.5" />}
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer" onClick={advanceToNext}>
              <SkipForward className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer" onClick={cycleRepeat}>
              {repeat === "one" ? (
                <Repeat1 className="h-4 w-4 text-primary" />
              ) : (
                <Repeat className={repeat === "all" ? "h-4 w-4 text-primary" : "h-4 w-4"} />
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-xl">
            <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">{formatDuration(scrubbing ? scrubValue : progress)}</span>
            <Slider
              value={[scrubbing ? scrubValue : progress]}
              max={duration || 1}
              step={0.01}
              onPointerDown={seekTouchHaptic}
              onValueChange={(v) => { scrubbingRef.current = true; setScrubbing(true); setScrubValue(v[0]); seekDragHaptic(v[0]); }}
              onValueCommit={(v) => { commitSeek(v[0]); seekCommitHaptic(); scrubbingRef.current = false; setScrubbing(false); }}
              onPointerCancel={() => { scrubbingRef.current = false; setScrubbing(false); }}
              className="flex-1 group"
            />
            <span className="text-xs text-muted-foreground w-10 tabular-nums">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume + sleep */}
        <div className="hidden md:flex items-center gap-2 w-1/4 justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer" title="Sleep timer">
                <Clock className={sleepTimer ? "h-4 w-4 text-primary" : "h-4 w-4"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[5, 15, 30, 60].map((m) => (
                <DropdownMenuItem key={m} onClick={() => setSleepTimer(m)}>
                  {m} minutes
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem onClick={() => setSleepTimer(null)}>Cancel timer</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Volume control */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer shrink-0"
            onClick={toggleMute}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : volume < 0.5 ? (
              <Volume1 className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            value={[muted ? 0 : volume * 100]}
            max={100}
            step={1}
            onValueChange={(v) => {
              if (muted) toggleMute();
              setVolume(v[0] / 100);
            }}
            className="w-24 lg:w-28 cursor-pointer"
          />

          {/* Right sidebar toggle */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 hover:bg-accent/60 cursor-pointer shrink-0",
              sidebarRightOpen ? "text-primary" : "text-foreground/80 hover:text-foreground"
            )}
            onClick={toggleSidebarRight}
            title="Now playing side view"
          >
            <PanelRight className="h-4 w-4" />
          </Button>

          {/* Queue toggle */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer shrink-0"
            onClick={toggleQueuePanel}
            title="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </Button>

          {/* Full-screen Now Playing toggle like Spotify */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-8 w-8 hover:bg-accent/60 cursor-pointer shrink-0",
              nowPlayingOpen ? "text-primary" : "text-foreground/80 hover:text-foreground"
            )}
            onClick={toggleNowPlaying}
            title={nowPlayingOpen ? "Exit full screen" : "Full screen"}
          >
            {nowPlayingOpen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </>
  );
}