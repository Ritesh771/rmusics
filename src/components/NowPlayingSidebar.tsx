import { usePlayer } from "@/lib/player-store";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { X, Heart, Music, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { cleanSongTitle } from "@/lib/song-utils";

export function NowPlayingSidebar() {
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const nextSong = usePlayer((s) => s.queue[s.currentIndex + 1] ?? null);
  const open = usePlayer((s) => s.sidebarRightOpen);
  const close = usePlayer((s) => s.closeSidebarRight);
  const next = usePlayer((s) => s.next);
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: liked = [] } = useQuery({
    queryKey: ["liked", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id").eq("user_id", user!.id);
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10,
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

  if (!open || !song || nowPlayingOpen) return null;

  return (
    <aside className="hidden xl:flex flex-col w-80 2xl:w-88 shrink-0 bg-card/90 backdrop-blur-xl border border-border/70 rounded-2xl m-2 ml-0 overflow-y-auto pb-24 shadow-sm animate-in slide-in-from-right-4 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur-md z-10">
        <div className="min-w-0 pr-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Now Playing
          </span>
          <span className="text-sm font-semibold truncate block text-foreground">
            {song.album || song.artist}
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/60 shrink-0 cursor-pointer"
          onClick={close}
          title="Close now playing panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-5">
        {/* Large Artwork */}
        <div className="aspect-square w-full rounded-2xl overflow-hidden bg-muted shadow-md border border-border/60 relative group">
          {song.thumbnail_url ? (
            <img
              src={song.thumbnail_url}
              alt={song.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Music className="h-16 w-16 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Title, Artist, & Like */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-extrabold text-xl text-foreground truncate tracking-tight">
              {cleanSongTitle(song.title)}
            </h3>
            <p className="text-sm font-medium text-muted-foreground truncate mt-0.5">
              {song.artist}
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-9 w-9 rounded-full text-foreground hover:bg-accent/60 shrink-0 cursor-pointer"
            onClick={() => toggleLike.mutate()}
          >
            <Heart className={cn("h-5 w-5 transition-colors", isLiked ? "fill-primary text-primary" : "text-muted-foreground")} />
          </Button>
        </div>

        {/* Next in Queue Preview */}
        {nextSong && (
          <div className="bg-card border border-border/60 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Next In Queue</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/50">
                {nextSong.thumbnail_url ? (
                  <img src={nextSong.thumbnail_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Music className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate text-foreground">{cleanSongTitle(nextSong.title)}</div>
                <div className="text-xs text-muted-foreground truncate">{nextSong.artist}</div>
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
          </div>
        )}
      </div>
    </aside>
  );
}

