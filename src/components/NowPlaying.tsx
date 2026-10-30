import { usePlayer, type Song } from "@/lib/player-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1,
  Heart, Music, MoreHorizontal, ListMusic, Volume2, VolumeX,
} from "lucide-react";
import { formatDuration } from "@/lib/owner";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef, type TouchEvent } from "react";
import { cn } from "@/lib/utils";
import { MoodBackdrop } from "./MoodBackdrop";
import { seekCommitHaptic, seekDragHaptic, seekTouchHaptic } from "@/lib/haptics";

export function NowPlaying() {
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (nowPlayingOpen && song) {
      setMounted(true);
      setClosing(false);
      return;
    }

    if (!mounted) return;
    setClosing(true);
    const id = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 180);
    return () => window.clearTimeout(id);
  }, [mounted, nowPlayingOpen, song]);

  const shouldRender = mounted || (nowPlayingOpen && song && !closing);

  if (!shouldRender || !song) return null;

  return <NowPlayingContent song={song} closing={closing} />;
}

function NowPlayingContent({ song, closing }: { song: Song; closing: boolean }) {
  const closeNowPlaying = usePlayer((s) => s.closeNowPlaying);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const seek = usePlayer((s) => s.seek);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleMute = usePlayer((s) => s.toggleMute);
  const [showQueue, setShowQueue] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipeRef = useRef<HTMLDivElement | null>(null);
  const swipeDX = useRef(0);
  const swipeRaf = useRef(0);
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (closing) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNowPlaying(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [closing, closeNowPlaying]);

  useEffect(() => {
    if (!closing) return;
    setShowQueue(false);
    swipeDX.current = 0;
    if (swipeRef.current) swipeRef.current.style.transform = "";
  }, [closing]);

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
      if (isLiked) await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      else await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] }),
  });

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    if (swipeRef.current) swipeRef.current.style.transition = "none";
  };
  const onTouchMove = (e: TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy) && swipeRef.current) {
      swipeDX.current = dx;
      if (swipeRaf.current) return;
      swipeRaf.current = requestAnimationFrame(() => {
        swipeRaf.current = 0;
        const latestDX = swipeDX.current;
        if (!swipeRef.current) return;
        swipeRef.current.style.transform = `translate3d(${latestDX}px,0,0) rotate(${latestDX * 0.015}deg)`;
        swipeRef.current.style.opacity = String(1 - Math.min(Math.abs(latestDX) / 500, 0.28));
      });
    }
  };
  const onTouchEnd = () => {
    const dx = swipeDX.current;
    swipeDX.current = 0;
    touchStart.current = null;
    if (swipeRaf.current) {
      cancelAnimationFrame(swipeRaf.current);
      swipeRaf.current = 0;
    }
    if (swipeRef.current) {
      swipeRef.current.style.transition = "transform 0.24s cubic-bezier(0.22,1,0.36,1), opacity 0.18s ease";
      swipeRef.current.style.transform = "";
      swipeRef.current.style.opacity = "1";
    }
    if (dx <= -60) next();
    else if (dx >= 60) prev();
  };

  return (
    <div className={cn(
      "now-playing-sheet fixed inset-0 z-[100] bg-gradient-to-b from-background/95 via-card/95 to-background text-foreground flex flex-col overflow-hidden backdrop-blur-2xl",
      closing ? "now-playing-sheet-out" : "now-playing-sheet-in",
    )}>
      <MoodBackdrop intensity={0.9} />
      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 shrink-0 border-b border-border/40 bg-background/40 backdrop-blur-md">
        <Button size="icon" variant="ghost" className="text-foreground hover:bg-accent/60 rounded-full" onClick={closeNowPlaying}>
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center min-w-0 px-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Now Playing</div>
          <div className="text-sm font-bold truncate text-foreground">{song.album || song.artist}</div>
        </div>
        <Button size="icon" variant="ghost" className="text-foreground hover:bg-accent/60 rounded-full" onClick={() => setShowQueue((s) => !s)}>
          {showQueue ? <MoreHorizontal className="h-6 w-6" /> : <ListMusic className="h-6 w-6" />}
        </Button>
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Artwork + controls */}
        <div className={cn("flex-1 flex flex-col items-center justify-center px-6 pb-6 min-h-0", showQueue && "hidden md:flex")}>
          <div
            ref={swipeRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ willChange: "transform" }}
            className="w-full max-w-md aspect-square rounded-2xl overflow-hidden bg-muted/60 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-border/60 flex items-center justify-center touch-pan-y select-none transition-shadow group"
          >
            {song.thumbnail_url ? (
              <img
                key={song.id}
                src={song.thumbnail_url}
                alt=""
                draggable={false}
                className="h-full w-full object-cover animate-fade-in group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <Music className="h-24 w-24 text-muted-foreground/40" />
            )}
          </div>

          <div className="w-full max-w-md mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-2xl md:text-3xl font-extrabold tracking-tight truncate text-foreground">{song.title}</div>
                <div className="text-base font-medium text-muted-foreground truncate mt-0.5">{song.artist}</div>
              </div>
              <Button size="icon" variant="ghost" className="text-foreground hover:bg-accent/60 rounded-full shrink-0" onClick={() => toggleLike.mutate()}>
                <Heart className={cn("h-6 w-6 transition-colors", isLiked ? "fill-primary text-primary" : "text-muted-foreground")} />
              </Button>
            </div>

            <div className="space-y-1.5">
              <Slider
                value={[scrubbing ? scrubValue : progress]}
                max={duration || 1}
                step={0.01}
                onPointerDown={seekTouchHaptic}
                onValueChange={(v) => { setScrubbing(true); setScrubValue(v[0]); seekDragHaptic(v[0]); }}
                onValueCommit={(v) => { seek(v[0]); seekCommitHaptic(); setScrubbing(false); }}
              />
              <div className="flex justify-between text-xs font-medium text-muted-foreground tabular-nums">
                <span>{formatDuration(scrubbing ? scrubValue : progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full" onClick={toggleShuffle}>
                <Shuffle className={shuffle ? "h-5 w-5 text-primary" : "h-5 w-5"} />
              </Button>
              <Button size="icon" variant="ghost" className="text-foreground hover:bg-accent/60 h-12 w-12 rounded-full" onClick={prev}>
                <SkipBack className="h-7 w-7 fill-current" />
              </Button>
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current ml-1" />}
              </Button>
              <Button size="icon" variant="ghost" className="text-foreground hover:bg-accent/60 h-12 w-12 rounded-full" onClick={next}>
                <SkipForward className="h-7 w-7 fill-current" />
              </Button>
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full" onClick={cycleRepeat}>
                {repeat === "one" ? (
                  <Repeat1 className="h-5 w-5 text-primary" />
                ) : (
                  <Repeat className={repeat === "all" ? "h-5 w-5 text-primary" : "h-5 w-5"} />
                )}
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-2 pt-2">
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-accent/60 h-8 w-8 rounded-full" onClick={toggleMute}>
                {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Slider
                value={[muted ? 0 : volume * 100]}
                max={100}
                step={1}
                onValueChange={(v) => setVolume(v[0] / 100)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Queue panel */}
        {showQueue && (
          <div className="md:w-96 md:border-l border-border/60 overflow-y-auto px-4 pb-6 bg-card/60 backdrop-blur-xl">
            <h3 className="font-bold text-lg sticky top-0 bg-card/95 backdrop-blur-md py-3.5 border-b border-border/50 text-foreground z-10">Next up</h3>
            <div className="space-y-1.5 pt-2">
              {queue.map((s, i) => (
                <button
                  key={s.id + i}
                  onClick={() => usePlayer.setState({ currentIndex: i, isPlaying: true, progress: 0, duration: s.duration ?? 0 })}
                  className={cn(
                    "w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-accent/60 text-left transition-colors border border-transparent",
                    i === currentIndex && "bg-primary/10 border-primary/20"
                  )}
                >
                  <div className="h-11 w-11 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/40">
                    {s.thumbnail_url && <img src={s.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm truncate text-foreground", i === currentIndex && "text-primary font-bold")}>{s.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{s.artist}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}