import { MoreHorizontal, Plus, Heart, Share2, Trash2, ListPlus, ListEnd } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub,
  DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePlayer, type Song } from "@/lib/player-store";
import { getOwnerKey } from "@/lib/owner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  song: Song;
  inPlaylistId?: string;
  trigger?: ReactNode;
  align?: "start" | "end";
  className?: string;
};

export function SongMenu({ song, inPlaylistId, trigger, align = "end", className }: Props) {
  const { addToQueue, playNext } = usePlayer();
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
      if (isLiked) await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("owner_key", owner);
      else await supabase.from("liked_songs").insert({ song_id: song.id, owner_key: owner });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] }),
  });

  const addToPlaylist = useMutation({
    mutationFn: async (playlistId: string) => {
      await supabase.from("playlist_songs").insert({ playlist_id: playlistId, song_id: song.id });
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
      await supabase.from("playlist_songs").delete().eq("playlist_id", inPlaylistId).eq("song_id", song.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist", inPlaylistId] });
      toast.success("Removed from playlist");
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger ?? (
          <Button size="icon" variant="ghost" className={cn("h-8 w-8", className)}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => { playNext(song); toast.success("Playing next"); }}>
          <ListEnd className="h-4 w-4 mr-2" />Play next
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { addToQueue(song); toast.success("Added to queue"); }}>
          <ListPlus className="h-4 w-4 mr-2" />Add to queue
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Plus className="h-4 w-4 mr-2" />Add to playlist
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {playlists.length === 0 && <DropdownMenuItem disabled>No playlists yet</DropdownMenuItem>}
            {playlists.map((p) => (
              <DropdownMenuItem key={p.id} onClick={() => addToPlaylist.mutate(p.id)}>{p.name}</DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onClick={() => toggleLike.mutate()}>
          <Heart className={cn("h-4 w-4 mr-2", isLiked && "fill-primary text-primary")} />
          {isLiked ? "Unlike" : "Like"}
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
  );
}