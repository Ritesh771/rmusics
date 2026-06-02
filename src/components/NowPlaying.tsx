import { usePlayer } from "@/lib/player-store";
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
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function NowPlaying() {
  const {
    nowPlayingOpen, closeNowPlaying, currentSong, isPlaying, togglePlay,
    next, prev, progress, duration, seek, shuffle, repeat, toggleShuffle,
    cycleRepeat, queue, currentIndex, volume, muted, setVolume, toggleMute,
  } = usePlayer();
  const song = currentSong();
  const [showQueue, setShowQueue] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const qc = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!nowPlayingOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeNowPlaying(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [nowPlayingOpen, closeNowPlaying]);

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

  if (!nowPlayingOpen || !song) return null;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;
    if (Math.abs(dx) > Math.abs(dy)) setSwipeX(dx);
  };
  const onTouchEnd = () => {
    const dx = swipeX;
    setSwipeX(0);
    touchStart.current = null;
    if (dx <= -60) next();
    else if (dx >= 60) prev();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-neutral-800 via-neutral-900 to-black text-white flex flex-col animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 shrink-0">
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={closeNowPlaying}>
          <ChevronDown className="h-6 w-6" />
        </Button>
        <div className="text-center min-w-0 px-2">
          <div className="text-[10px] uppercase tracking-widest opacity-70">Now Playing</div>
          <div className="text-sm font-semibold truncate">{song.album || song.artist}</div>
        </div>
        <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={() => setShowQueue((s) => !s)}>
          {showQueue ? <MoreHorizontal className="h-6 w-6" /> : <ListMusic className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Artwork + controls */}
        <div className={cn("flex-1 flex flex-col items-center justify-center px-6 pb-6 min-h-0", showQueue && "hidden md:flex")}>
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              transform: `translateX(${swipeX}px) rotate(${swipeX * 0.02}deg)`,
              transition: swipeX === 0 ? "transform 0.3s cubic-bezier(0.22,1,0.36,1)" : "none",
              opacity: 1 - Math.min(Math.abs(swipeX) / 400, 0.4),
            }}
            className="w-full max-w-md aspect-square rounded-lg overflow-hidden bg-neutral-700 shadow-2xl flex items-center justify-center touch-pan-y select-none"
          >
            {song.thumbnail_url ? (
              <img
                key={song.id}
                src={song.thumbnail_url}
                alt=""
                draggable={false}
                className="h-full w-full object-cover animate-fade-in"
              />
            ) : (
              <Music className="h-24 w-24 text-white/30" />
            )}
          </div>

          <div className="w-full max-w-md mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-2xl font-bold truncate">{song.title}</div>
                <div className="text-base text-white/70 truncate">{song.artist}</div>
              </div>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 shrink-0" onClick={() => toggleLike.mutate()}>
                <Heart className={isLiked ? "h-6 w-6 fill-primary text-primary" : "h-6 w-6"} />
              </Button>
            </div>

            <div className="space-y-1">
              <Slider
                value={[progress]}
                max={duration || 1}
                step={0.1}
                onValueChange={(v) => seek(v[0])}
              />
              <div className="flex justify-between text-xs text-white/60">
                <span>{formatDuration(progress)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={toggleShuffle}>
                <Shuffle className={shuffle ? "h-5 w-5 text-primary" : "h-5 w-5"} />
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-12 w-12" onClick={prev}>
                <SkipBack className="h-7 w-7 fill-white" />
              </Button>
              <Button
                size="icon"
                className="h-16 w-16 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-7 w-7 fill-black" /> : <Play className="h-7 w-7 fill-black ml-1" />}
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-12 w-12" onClick={next}>
                <SkipForward className="h-7 w-7 fill-white" />
              </Button>
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10" onClick={cycleRepeat}>
                {repeat === "one" ? (
                  <Repeat1 className="h-5 w-5 text-primary" />
                ) : (
                  <Repeat className={repeat === "all" ? "h-5 w-5 text-primary" : "h-5 w-5"} />
                )}
              </Button>
            </div>

            <div className="hidden md:flex items-center gap-2 pt-2">
              <Button size="icon" variant="ghost" className="text-white hover:bg-white/10 h-8 w-8" onClick={toggleMute}>
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
          <div className="md:w-96 md:border-l border-white/10 overflow-y-auto px-4 pb-6">
            <h3 className="font-bold text-lg sticky top-0 bg-neutral-900/95 backdrop-blur py-3">Next up</h3>
            <div className="space-y-1">
              {queue.map((s, i) => (
                <button
                  key={s.id + i}
                  onClick={() => usePlayer.setState({ currentIndex: i, isPlaying: true, progress: 0 })}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded hover:bg-white/10 text-left",
                    i === currentIndex && "bg-white/10"
                  )}
                >
                  <div className="h-10 w-10 rounded bg-neutral-700 shrink-0 overflow-hidden">
                    {s.thumbnail_url && <img src={s.thumbnail_url} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("text-sm truncate", i === currentIndex && "text-primary font-medium")}>{s.title}</div>
                    <div className="text-xs text-white/60 truncate">{s.artist}</div>
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