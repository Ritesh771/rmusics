import { usePlayer, type Song } from "@/lib/player-store";
import { Button } from "@/components/ui/button";
import { useRouterState } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronDown, Music, Share2, ListMusic, Play, Heart,
} from "lucide-react";
import { cleanSongTitle } from "@/lib/song-utils";
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
  const next = usePlayer((s) => s.next);
  const toggleQueuePanel = usePlayer((s) => s.toggleQueuePanel);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
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
      const { data } = await supabase.from("liked_songs").select("song_id");
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
        "fixed inset-0 pb-20 md:pb-24 z-30 bg-background/95 md:bg-background/98 text-foreground flex flex-col overflow-y-auto backdrop-blur-2xl transition-all duration-300 select-none",
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

      {/* CENTER STAGE: Spotify Large Artwork & Cards (NO DUPLICATE PLAY CONTROLS) */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-0">
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* Large Spotify Album Cover */}
          <div className="w-72 h-72 sm:w-88 sm:h-88 md:w-[380px] md:h-[380px] lg:w-[400px] lg:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden bg-muted/60 shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-border/60 flex items-center justify-center transition-transform duration-500 hover:scale-[1.01] group relative">
            {song.thumbnail_url ? (
              <img
                key={song.id}
                src={song.thumbnail_url}
                alt={song.title}
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-700 ease-out"
              />
            ) : (
              <Music className="h-28 w-28 text-muted-foreground/30" />
            )}
          </div>

          {/* Song Title, Artist, & Like Button */}
          <div className="w-full flex items-center justify-between gap-4 mt-6 px-1">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate">
                {cleanSongTitle(song.title)}
              </h2>
              <p className="text-sm sm:text-base font-medium text-muted-foreground truncate mt-1">
                {song.artist}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-foreground hover:bg-accent/60 rounded-full h-10 w-10 shrink-0 cursor-pointer"
              onClick={() => toggleLike.mutate()}
            >
              <Heart
                className={cn(
                  "h-6 w-6 transition-colors",
                  isLiked ? "fill-primary text-primary" : "text-muted-foreground"
                )}
              />
            </Button>
          </div>

          {/* SPOTIFY DUAL CARDS (Credits on left, Next in queue on right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-6">
            {/* Left Card: Credits */}
            <div className="bg-card/70 border border-border/70 rounded-2xl p-4 backdrop-blur-md shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Credits</span>
                <button
                  onClick={() => setShowCreditsModal(true)}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                >
                  Show all
                </button>
              </div>
              <div className="space-y-1">
                <div className="font-bold text-sm text-foreground truncate">
                  {song.artist}
                </div>
                <div className="text-xs text-muted-foreground">
                  Main Artist • Performer
                </div>
              </div>
              {song.album && (
                <div className="text-xs text-muted-foreground/80 truncate pt-1 border-t border-border/40">
                  Album: <span className="text-foreground font-medium">{song.album}</span>
                </div>
              )}
            </div>

            {/* Right Card: Next in Queue */}
            <div className="bg-card/70 border border-border/70 rounded-2xl p-4 backdrop-blur-md shadow-xs flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Next in queue</span>
                <button
                  onClick={toggleQueuePanel}
                  className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                >
                  Open queue
                </button>
              </div>

              {nextSong ? (
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/50">
                    {nextSong.thumbnail_url ? (
                      <img
                        src={nextSong.thumbnail_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Music className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate text-foreground">
                      {cleanSongTitle(nextSong.title)}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {nextSong.artist}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full text-foreground hover:bg-accent/80 shrink-0 cursor-pointer"
                    onClick={() => next()}
                    title="Skip to next"
                  >
                    <Play className="h-4 w-4 fill-current ml-0.5" />
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground py-2">
                  No more tracks queued up.
                </div>
              )}
            </div>
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
