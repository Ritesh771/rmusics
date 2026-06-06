import { useCallback, useEffect, useRef, useState } from "react";
import { usePlayer, type Song } from "@/lib/player-store";
import {
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Volume2, VolumeX, Heart, Clock, Music
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/owner";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ListMusic } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Player() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastProgressPush = useRef(0);
  const pendingSeekRef = useRef<number | null>(null);
  const playRequestRef = useRef(0);
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

  const seekAudio = useCallback((audio: HTMLAudioElement, time: number) => {
    const target = Math.max(0, Number.isFinite(time) ? time : 0);
    if (typeof (audio as any).fastSeek === "function") {
      try { (audio as any).fastSeek(target); return; } catch {}
    }
    try { audio.currentTime = target; } catch { pendingSeekRef.current = target; }
  }, []);

  const playAudioSong = useCallback((targetSong: Song | null, seekTo = 0) => {
    const audio = audioRef.current;
    if (!audio || !targetSong) return;
    const requestId = ++playRequestRef.current;
    if (audio.dataset.songId !== targetSong.id) {
      audio.dataset.songId = targetSong.id;
      audio.src = targetSong.audio_url;
      audio.load();
    }
    pendingSeekRef.current = null;
    seekAudio(audio, seekTo);
    audio.play().then(() => {
      if (requestId === playRequestRef.current) usePlayer.setState({ isPlaying: true });
    }).catch(() => {});
  }, [seekAudio]);

  const advanceToNext = useCallback(() => {
    const upcoming = next();
    if (upcoming) playAudioSong(upcoming, 0);
  }, [next, playAudioSong]);

  const goToPrevious = useCallback(() => {
    const previous = prev();
    if (previous) playAudioSong(previous, 0);
  }, [prev, playAudioSong]);

  const publishAudioTime = useCallback((force = false) => {
    const audio = audioRef.current;
    if (!audio || scrubbing) return;
    const now = performance.now();
    if (force || now - lastProgressPush.current > 120 || Math.abs(usePlayer.getState().progress - audio.currentTime) > 0.35) {
      lastProgressPush.current = now;
      setProgress(audio.currentTime);
    }
  }, [scrubbing, setProgress]);

  // Audio src/play control
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!song) {
      audio.pause();
      audio.removeAttribute("src");
      audio.dataset.songId = "";
      return;
    }
    if (audio.dataset.songId !== song.id) {
      audio.dataset.songId = song.id;
      audio.src = song.audio_url;
      const resumeAt = Math.max(0, usePlayer.getState().progress || 0);
      pendingSeekRef.current = resumeAt;
      audio.load();
      setDuration(song.duration ?? 0);
    }
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
      seekAudio(audioRef.current, _seekTarget);
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
          ? [96, 192, 256, 384, 512].map((s) => ({
              src: song.thumbnail_url!,
              sizes: `${s}x${s}`,
              type: "image/png",
            }))
          : [],
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch {}
    const ms = navigator.mediaSession;
    const safe = (action: MediaSessionAction, handler: ((details: any) => void) | null) => {
      try { ms.setActionHandler(action, handler as any); } catch {}
    };
    safe("play", () => { audioRef.current?.play().catch(() => {}); usePlayer.setState({ isPlaying: true }); });
    safe("pause", () => { audioRef.current?.pause(); usePlayer.setState({ isPlaying: false }); });
    safe("previoustrack", () => prev());
    safe("nexttrack", () => { const upcoming = next(); if (upcoming) playAudioSong(upcoming); });
    safe("seekto", (e: any) => { if (typeof e?.seekTime === "number") seek(e.seekTime); });
    return () => {
      ["play", "pause", "previoustrack", "nexttrack", "seekto"].forEach((a) =>
        safe(a as MediaSessionAction, null),
      );
    };
  }, [song?.id, isPlaying, next, playAudioSong, prev, seek]);

  // Keep position state up-to-date for OS scrubber
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!duration || !isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState?.({
        duration,
        position: Math.min(progress, duration),
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
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onCanPlay={() => { if (usePlayer.getState().isPlaying) audioRef.current?.play().catch(() => {}); }}
        onTimeUpdate={() => publishAudioTime(true)}
        onEnded={() => {
          if (repeat === "one" && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else {
            const upcoming = next();
            if (upcoming) playAudioSong(upcoming);
          }
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
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={prev}>
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
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={next}>
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
            onValueChange={(v) => { setScrubbing(true); setScrubValue(v[0]); }}
            onValueCommit={(v) => { seek(v[0]); setScrubbing(false); }}
            className="flex-1"
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