import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SongRow } from "@/components/SongRow";
import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer, type Song } from "@/lib/player-store";
import { useAuth } from "@/lib/auth-hook";

export const Route = createFileRoute("/liked")({
  head: () => ({ meta: [{ title: "Sonara — Liked Songs" }] }),
  component: LikedPage,
});

function LikedPage() {
  const { user } = useAuth();
  const playQueue = usePlayer((s) => s.playQueue);
  const { data: songs = [] } = useQuery({
    queryKey: ["liked", "songs", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("liked_songs")
        .select("song_id, liked_at, songs(*)")
        .order("liked_at", { ascending: false });
      return (data ?? []).map((r: any) => r.songs as Song).filter(Boolean);
    },
    enabled: !!user,
  });

  return (
    <>
      <div className="bg-gradient-to-b from-purple-700 to-transparent p-6 pb-12">
        <div className="flex items-end gap-6">
          <div className="h-44 w-44 bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center rounded shadow-2xl">
            <Heart className="h-20 w-20 fill-white text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase">Playlist</div>
            <h1 className="text-5xl font-extrabold mt-2">Liked Songs</h1>
            <div className="text-sm text-muted-foreground mt-2">{songs.length} songs</div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full bg-primary hover:scale-105 transition mb-4"
          onClick={() => playQueue(songs)}
          disabled={!songs.length}
        >
          <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
        </Button>
        <div className="space-y-1">
          {songs.map((s, i) => (
            <SongRow key={s.id} song={s} index={i} queue={songs} />
          ))}
          {!songs.length && <div className="text-muted-foreground">No liked songs yet. Tap the heart on any track.</div>}
        </div>
      </div>
    </>
  );
}
