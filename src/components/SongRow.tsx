import { Play, Pause, Heart, MoreHorizontal, Plus, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer, type Song } from "@/lib/player-store";
import { formatDuration, getOwnerKey } from "@/lib/owner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

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
  const owner = typeof window !== "undefined" ? getOwnerKey() : "";

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", owner],
    queryFn: async () => {
      const { data } = await supabase.from("playlists").select("id, name").eq("owner_key", owner);
      return data ?? [];
    },
    enabled: !!owner,
  });

  const { data: liked = [] } = useQuery({
    queryKey: ["liked", owner],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id").eq("owner_key", owner);
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!owner,
  });
  const isLiked = liked.includes(song.id);

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("owner_key", owner);
      } else {
        await supabase.from("liked_songs").insert({ song_id: song.id, owner_key: owner });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] }),
  });

  const addToPlaylist = useMutation({
    mutationFn: async (playlistId: string) => {
      await supabase.from("playlist_songs").insert({
        playlist_id: playlistId,
        song_id: song.id,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist"] });
      toast.success("Added to playlist");
    },
    onError: () => toast.error("Already in playlist"),
  });

  const removeFromPlaylist = useMutation({
    mutationFn: async () => {
      if (!inPlaylistId) return;
      await supabase.from("playlist_songs").delete()
        .eq("playlist_id", inPlaylistId).eq("song_id", song.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist", inPlaylistId] });
      toast.success("Removed from playlist");
    },
  });

  const handlePlay = () => {
    if (isCurrent) togglePlay();
    else playQueue(queue, index);
  };

  return (
    <div className="group grid grid-cols-[16px_4fr_3fr_minmax(0,1fr)_60px] items-center gap-4 px-4 py-2 rounded-md hover:bg-accent/50">
      <div className="text-sm text-muted-foreground text-center">
        <span className="group-hover:hidden">{isCurrent && isPlaying ? "♪" : index + 1}</span>
        <button onClick={handlePlay} className="hidden group-hover:inline">
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
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleLike.mutate()}>
          <Heart className={isLiked ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4"} />
        </Button>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
        <span>{formatDuration(song.duration)}</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Plus className="h-4 w-4 mr-2" />Add to playlist
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {playlists.length === 0 && (
                  <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>
                )}
                {playlists.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => addToPlaylist.mutate(p.id)}>
                    {p.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem onClick={() => toggleLike.mutate()}>
              <Heart className="h-4 w-4 mr-2" />{isLiked ? "Unlike" : "Like"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/song/${song.id}`);
              toast.success("Link copied");
            }}>
              <Share2 className="h-4 w-4 mr-2" />Share
            </DropdownMenuItem>
            {inPlaylistId && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => removeFromPlaylist.mutate()} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />Remove from playlist
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}