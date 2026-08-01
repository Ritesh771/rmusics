import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer, type Song } from "@/lib/player-store";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Clock,
  Music,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/owner";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { streamUrl } from "@/lib/stream-url";
import { useShakeVolume } from "@/lib/use-shake-volume";
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
  const toggleQueuePanel = usePlayer((s) => s.toggleQueuePanel);
  const qc = useQueryClient();
  const { user } = useAuth();
  useShakeVolume();

  const commitSeek = useCallback(
    (time: number) => {
      const state = usePlayer.getState();
      const max = state.duration || Number.POSITIVE_INFINITY;
      const target = Math.max(0, Math.min(time, max));
      // Hold the UI at the committed position briefly so the progress bar
      // never snaps back to the pre-seek time while the media element seeks.
      seekHoldRef.current = { target, until: performance.now() + 700 };
      seek(target);
    },
    [seek],
  );

  const seekAudio = useCallback((audio: HTMLAudioElement, time: number) => {
    const target = Math.max(0, Number.isFinite(time) ? time : 0);
    const fastAudio = audio as FastSeekAudio;
    if (typeof fastAudio.fastSeek === "function") {
      try {
        fastAudio.fastSeek(target);
        return;
      } catch {
        // Fall back to currentTime below.
      }
    }
    try {
      audio.currentTime = target;
    } catch {
      pendingSeekRef.current = target;
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
        suppressPauseUntil.current = Date.now() + 5000;
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
        .catch(() => undefined);
    },
    [seekAudio],
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
    if (upcoming) playAudioSong(upcoming, 0);
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
      // Any seek source (UI bar, full-screen player, lock screen) gets the same
      // hold window so the progress bar tracks the new position immediately.
      seekHoldRef.current = { target: _seekTarget, until: performance.now() + 700 };
      const readyForSeek =
        audio.readyState >= 1 &&
        (!Number.isFinite(audio.duration) || audio.currentSrc);
      if (readyForSeek) {
        seekAudio(audio, _seekTarget);
      } else {
        // Audio hasn't hydrated for the current song yet — queue the seek
        // so onLoadedMetadata applies it once the correct src is buffered.
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
        audio.play().catch(() => {});
      }
    }, 1000);
    return () => clearInterval(id);
  }, [completeCurrentSong, setProgress]);

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

  // Refresh audio state when the tab returns to foreground so the UI matches reality.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.visibilityState === "visible") {
        setProgress(audio.currentTime);
        if (usePlayer.getState().isPlaying && audio.paused) {
          audio.play().catch(() => {});
        }
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [setProgress]);

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
      if (audioRef.current) audioRef.current.autoplay = true;
      audioRef.current
        ?.play()
        .then(() => usePlayer.setState({ isPlaying: true }))
        .catch(() => undefined);
    });
    safe("pause", () => {
      if (audioRef.current) {
        audioRef.current.autoplay = false;
        audioRef.current.pause();
      }
      usePlayer.setState({ isPlaying: false });
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
      const { data } = await supabase.from("liked_songs").select("song_id");
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

  return (
    <>
      <audio
        ref={audioRef}
        preload="auto"
        playsInline
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
          if (audioRef.current) audioRef.current.autoplay = true;
          usePlayer.setState({ isPlaying: true });
        }}
        onPause={() => {
          if (Date.now() < suppressPauseUntil.current || audioRef.current?.ended) return;
          if (audioRef.current) audioRef.current.autoplay = false;
          usePlayer.setState({ isPlaying: false });
        }}
        onCanPlay={() => { if (usePlayer.getState().isPlaying) audioRef.current?.play().catch(() => {}); }}
        onStalled={() => {
          // Network hiccup — nudge the element without dropping playback intent.
          if (usePlayer.getState().isPlaying) audioRef.current?.play().catch(() => {});
        }}
        onError={() => {
          const audio = audioRef.current;
          if (!audio) return;
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

      {/* MOBILE compact player — Spotify-style bar above the bottom tab nav */}
      {song && (
        <div
          onClick={openNowPlaying}
          className="md:hidden fixed left-2 right-2 bottom-16 h-14 z-40 bg-neutral-800 rounded-md shadow-lg flex items-center gap-2 pl-2 pr-3 overflow-hidden"
        >
          <div className="h-10 w-10 rounded bg-muted shrink-0 overflow-hidden flex items-center justify-center">
            {song.thumbnail_url ? (
              <img src={song.thumbnail_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Music className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate text-white">{song.title}</div>
            <div className="text-xs text-white/60 truncate">{song.artist}</div>
          </div>
          <Button
            size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-white hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); toggleQueuePanel(); }}
            aria-label="Queue"
          >
            <ListMusic className="h-5 w-5" />
          </Button>
          <Button
            size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-white hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); toggleLike.mutate(); }}
          >
            <Heart className={isLiked ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5"} />
          </Button>
          <Button
            size="icon" variant="ghost" className="h-9 w-9 shrink-0 text-white hover:bg-white/10"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          >
            {isPlaying ? <Pause className="h-5 w-5 fill-white" /> : <Play className="h-5 w-5 fill-white" />}
          </Button>
          {/* progress hair-line */}
          <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-white/10">
            <div
              className="h-full origin-left bg-white transition-transform duration-150 ease-linear will-change-transform"
              style={{ transform: `scaleX(${duration ? Math.min(progress / duration, 1) : 0})` }}
            />
          </div>
        </div>
      )}

      {/* DESKTOP full player bar */}
      <div className="hidden md:flex h-20 bg-black border-t border-border px-4 items-center gap-4">
      {/* Song info */}
      <div className="flex items-center gap-3 w-1/4 min-w-0">
        {song && (
          <>
            <button
              onClick={openNowPlaying}
              className="h-14 w-14 rounded bg-muted shrink-0 overflow-hidden flex items-center justify-center hover:opacity-90"
              aria-label="Open now playing"
            >
              {song.thumbnail_url ? (
                <img src={song.thumbnail_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <Music className="h-6 w-6 text-muted-foreground" />
              )}
            </button>
            <button onClick={openNowPlaying} className="min-w-0 hidden sm:block text-left hover:underline">
              <div className="text-sm font-medium truncate">{song.title}</div>
              <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
            </button>
            <Button
              size="icon" variant="ghost" className="h-8 w-8 shrink-0"
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
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleShuffle}>
            <Shuffle className={shuffle ? "h-4 w-4 text-primary" : "h-4 w-4"} />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={goToPrevious}>
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            className="h-9 w-9 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition"
            onClick={togglePlay}
            disabled={!song}
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-black" /> : <Play className="h-4 w-4 fill-black" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={advanceToNext}>
            <SkipForward className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cycleRepeat}>
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
            onValueChange={(v) => { scrubbingRef.current = true; setScrubbing(true); setScrubValue(v[0]); }}
            onValueCommit={(v) => { commitSeek(v[0]); scrubbingRef.current = false; setScrubbing(false); }}
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
            <Button size="icon" variant="ghost" className="h-8 w-8" title="Sleep timer">
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
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleMute}>
          {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        <Slider
          value={[muted ? 0 : volume * 100]}
          max={100}
          step={1}
          onValueChange={(v) => setVolume(v[0] / 100)}
          className="w-24"
        />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleQueuePanel} title="Queue">
          <ListMusic className="h-4 w-4" />
        </Button>
      </div>
      </div>
    </>
  );
}