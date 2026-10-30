import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SongRow } from "@/components/SongRow";
import { useAuth } from "@/lib/auth-hook";
import type { Song } from "@/lib/player-store";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({ meta: [{ title: "Sonara — Recently Played" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const { user } = useAuth();
  const { data: songs = [] } = useQuery({
    queryKey: ["recently_played", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("recently_played")
        .select("played_at, songs(*)")
        .order("played_at", { ascending: false })
        .limit(100);
      const seen = new Set<string>();
      const out: Song[] = [];
      for (const r of (data ?? []) as any[]) {
        const s = r.songs as Song | null;
        if (s && !seen.has(s.id)) { seen.add(s.id); out.push(s); }
      }
      return out;
    },
    enabled: !!user,
  });

  return (
    <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Recently played</h1>
        </div>
        {songs.length === 0 ? (
          <div className="text-muted-foreground">Nothing here yet. Play something!</div>
        ) : (
          <div className="space-y-1">
            {songs.map((s, i) => <SongRow key={s.id} song={s} index={i} queue={songs} />)}
          </div>
        )}
      </div>
  );
}