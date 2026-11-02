import { usePlayer, type Song } from "@/lib/player-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useRouterState } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown, Music, Share2, ListMusic, Play, Pause, SkipBack, SkipForward,
  Shuffle, Repeat, Repeat1, Heart, Info,
} from "lucide-react";
import { cleanSongTitle } from "@/lib/song-utils";
import { formatDuration } from "@/lib/owner";
import { seekCommitHaptic, seekDragHaptic, seekTouchHaptic } from "@/lib/haptics";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { MoodBackdrop } from "./MoodBackdrop";
import { toast } from "sonner";

export function NowPlaying() {
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const prevPath = useRef(pathname);

  // Automatically close expanded view when user navigates to any page
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      if (nowPlayingOpen) {
        usePlayer.getState().closeNowPlaying();
      }
    }
  }, [pathname, nowPlayingOpen]);

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
    }, 200);
    return () => window.clearTimeout(id);
  }, [mounted, nowPlayingOpen, song]);

  const shouldRender = mounted || (nowPlayingOpen && song && !closing);

  if (!shouldRender || !song) return null;

  return <NowPlayingContent song={song} closing={closing} />;
}

function NowPlayingContent({ song, closing }: { song: Song; closing: boolean }) {
  const closeNowPlaying = usePlayer((s) => s.closeNowPlaying);
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const seek = usePlayer((s) => s.seek);
  const shuffle = usePlayer((s) => s.shuffle);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const repeat = usePlayer((s) => s.repeat);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const toggleQueuePanel = usePlayer((s) => s.toggleQueuePanel);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const qc = useQueryClient();
  const { user } = useAuth();

  const nextSong = queue[currentIndex + 1] ?? null;

  useEffect(() => {
    if (closing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNowPlaying();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [closing, closeNowPlaying]);

  const { data: liked = [] } = useQuery({
    queryKey: ["liked", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id").eq("user_id", user!.id);
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!user,
  });
  const isLiked = liked.includes(song.id);

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (isLiked) {
        await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      } else {
        await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] }),
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Song link copied to clipboard");
  };

  return (
    <div
      className={cn(
        "fixed inset-0 pb-12 md:pb-20 z-50 bg-background/95 md:bg-background/98 text-foreground flex flex-col overflow-y-auto backdrop-blur-2xl transition-all duration-300 select-none",
        closing
          ? "opacity-0 translate-y-4 scale-[0.99] pointer-events-none ease-in"
          : "opacity-100 translate-y-0 scale-100 ease-out animate-in fade-in zoom-in-95"
      )}
    >
      <MoodBackdrop intensity={0.85} />

      {/* TOP HEADER: Spotify Breadcrumb & Actions */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 shrink-0 border-b border-border/40 bg-background/30 backdrop-blur-md">
        <div className="min-w-0 pr-4">
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">
            Playing from
          </div>
          <div className="text-sm font-extrabold truncate text-foreground">
            {song.album || "Library Tracks"}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full h-9 w-9 cursor-pointer"
            onClick={() => setShowCreditsModal(true)}
            title="Song Credits & Info"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full h-9 w-9 cursor-pointer"
            onClick={handleShare}
            title="Share track"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full h-9 w-9 cursor-pointer"
            onClick={toggleQueuePanel}
            title="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-foreground hover:bg-accent/60 rounded-full h-9 w-9 cursor-pointer"
            onClick={closeNowPlaying}
            title="Collapse view"
          >
            <ChevronDown className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* CENTER STAGE: Album Cover, Info, Sleek Seek Bar & Controls */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-0">
        <div className="w-full max-w-lg flex flex-col items-center">
          {/* Large Album Cover */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-[360px] md:h-[360px] rounded-2xl md:rounded-3xl overflow-hidden bg-muted/60 shadow-[0_20px_50px_rgba(0,0,0,0.22)] border border-border/60 flex items-center justify-center transition-transform duration-500 hover:scale-[1.01] group relative">
            {song.thumbnail_url ? (
              <img
                key={song.id}
                src={song.thumbnail_url}
                alt={song.title}
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 ease-out"
              />
            ) : (
              <Music className="h-24 w-24 text-muted-foreground/30" />
            )}
          </div>

          {/* Song Title, Artist, & Like */}
          <div className="w-full flex items-center justify-between gap-4 mt-5 px-1">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground truncate">
                {cleanSongTitle(song.title)}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm sm:text-base font-medium text-muted-foreground truncate">
                  {song.artist}
                </p>
                {song.album && (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="text-sm font-medium text-muted-foreground truncate">
                      {song.album}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-xs font-semibold h-8 px-3 gap-1.5 border-border/70 hover:bg-accent/60 cursor-pointer hidden sm:flex"
                onClick={() => setShowCreditsModal(true)}
              >
                <Info className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Credits</span>
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-foreground hover:bg-accent/60 rounded-full h-10 w-10 shrink-0 cursor-pointer"
                onClick={() => toggleLike.mutate()}
                title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
              >
                <Heart
                  className={cn(
                    "h-6 w-6 transition-colors",
                    isLiked ? "fill-primary text-primary" : "text-muted-foreground"
                  )}
                />
              </Button>
            </div>
          </div>

          {/* Sleek Seek Bar with live sliding for mobile & desktop */}
          <div className="w-full mt-5 space-y-1.5 px-1">
            <Slider
              value={[scrubbing ? scrubValue : progress]}
              max={duration || 1}
              step={0.01}
              onPointerDown={seekTouchHaptic}
              onValueChange={(v) => {
                setScrubbing(true);
                setScrubValue(v[0]);
                seekDragHaptic(v[0]);
              }}
              onValueCommit={(v) => {
                seek(v[0]);
                seekCommitHaptic();
                setScrubbing(false);
              }}
              onPointerCancel={() => setScrubbing(false)}
              className="w-full cursor-pointer touch-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground font-medium tabular-nums px-0.5">
              <span>{formatDuration(scrubbing ? scrubValue : progress)}</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Playback Controls (Shuffle, Prev, Play/Pause, Next, Repeat) */}
          <div className="w-full flex items-center justify-between mt-3 px-2">
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground/80 hover:text-foreground hover:bg-accent/60 rounded-full h-10 w-10 cursor-pointer"
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <Shuffle className={cn("h-5 w-5", shuffle && "text-primary")} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground hover:bg-accent/60 rounded-full h-11 w-11 cursor-pointer"
              onClick={prev}
              title="Previous"
            >
              <SkipBack className="h-6 w-6" />
            </Button>
            <Button
              size="icon"
              className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center cursor-pointer"
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="h-6 w-6 sm:h-7 sm:w-7 fill-current" /> : <Play className="h-6 w-6 sm:h-7 sm:w-7 fill-current ml-0.5" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground hover:bg-accent/60 rounded-full h-11 w-11 cursor-pointer"
              onClick={next}
              title="Next"
            >
              <SkipForward className="h-6 w-6" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground/80 hover:text-foreground hover:bg-accent/60 rounded-full h-10 w-10 cursor-pointer"
              onClick={cycleRepeat}
              title="Repeat"
            >
              {repeat === "one" ? (
                <Repeat1 className="h-5 w-5 text-primary" />
              ) : (
                <Repeat className={cn("h-5 w-5", repeat === "all" && "text-primary")} />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Credits Dialog */}
      <Dialog open={showCreditsModal} onOpenChange={setShowCreditsModal}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Song Title</div>
              <div className="text-base font-bold text-foreground mt-0.5">{cleanSongTitle(song.title)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Main Artist / Performer</div>
              <div className="text-base font-medium text-foreground mt-0.5">{song.artist}</div>
            </div>
            {song.album && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Album</div>
                <div className="text-sm font-medium text-foreground mt-0.5">{song.album}</div>
              </div>
            )}
            {song.genre && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Genre</div>
                <div className="text-sm font-medium text-foreground mt-0.5">{song.genre}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
