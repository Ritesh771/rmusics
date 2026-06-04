import { Play, Pause, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer, type Song } from "@/lib/player-store";
import { formatDuration } from "@/lib/owner";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SongMenu } from "./SongMenu";

type Props = {
  song: Song;
  index: number;
  queue: Song[];
  showAlbum?: boolean;
  inPlaylistId?: string;
};

export function SongRow({ song, index, queue, showAlbum = true, inPlaylistId }: Props) {
  const { playQueue, togglePlay, currentSong, isPlaying } = usePlayer();
  const cur = currentSong();
  const isCurrent = cur?.id === song.id;
  const qc = useQueryClient();
  const { user } = useAuth();

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

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else playQueue(queue, index);
  };

  return (
    <div
      onClick={handlePlay}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handlePlay(); } }}
      className="group grid grid-cols-[16px_4fr_3fr_minmax(0,1fr)_60px] items-center gap-4 px-4 py-2 rounded-md hover:bg-accent/50 cursor-pointer active:bg-accent/70 transition-colors select-none"
    >
      <div className="text-sm text-muted-foreground text-center">
        <span className="group-hover:hidden">{isCurrent && isPlaying ? "♪" : index + 1}</span>
        <button onClick={(e) => { e.stopPropagation(); handlePlay(); }} className="hidden group-hover:inline">
          {isCurrent && isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded bg-muted shrink-0 overflow-hidden">
          {song.thumbnail_url && <img src={song.thumbnail_url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0">
          <div className={"text-sm font-medium truncate " + (isCurrent ? "text-primary" : "")}>{song.title}</div>
          <div className="text-xs text-muted-foreground truncate">{song.artist}</div>
        </div>
      </div>
      <div className="text-sm text-muted-foreground truncate">
        {showAlbum ? song.album : song.genre}
      </div>
      <div className="opacity-0 group-hover:opacity-100">
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleLike.mutate(); }}>
          <Heart className={isLiked ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end" onClick={(e) => e.stopPropagation()}>
        <span>{formatDuration(song.duration)}</span>
        <SongMenu
          song={song}
          inPlaylistId={inPlaylistId}
          className="opacity-0 group-hover:opacity-100 md:opacity-0 [@media(hover:none)]:opacity-100"
        />
      </div>
    </div>
  );
}