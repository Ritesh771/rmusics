import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SongRow } from "@/components/SongRow";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Music } from "lucide-react";
import type { Song } from "@/lib/player-store";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Wavely — Search" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const term = q.trim();

  const { data: songs = [] } = useQuery({
    queryKey: ["songs", "search", term],
    queryFn: async () => {
      let query = supabase.from("songs").select("*").order("created_at", { ascending: false });
      if (term) {
        const like = `%${term}%`;
        query = query.or(`title.ilike.${like},artist.ilike.${like},album.ilike.${like},genre.ilike.${like}`);
      }
      const { data, error } = await query.limit(50);
      if (error) throw error;
      return data as Song[];
    },
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", "search", term],
    queryFn: async () => {
      let query = supabase.from("playlists").select("*").order("updated_at", { ascending: false });
      if (term) query = query.ilike("name", `%${term}%`);
      const { data } = await query.limit(20);
      return data ?? [];
    },
  });

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Songs, artists, albums…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9 bg-card border-border"
            autoFocus
          />
        </div>

        {playlists.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3">Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {playlists.map((p) => (
                <Link key={p.id} to="/playlist/$id" params={{ id: p.id }} className="block bg-card p-4 rounded-md hover:bg-accent transition">
                  <div className="aspect-square bg-muted rounded mb-3 overflow-hidden flex items-center justify-center">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="font-semibold truncate">{p.name}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-bold mb-3">Songs</h2>
          {songs.length === 0 ? (
            <div className="text-muted-foreground text-sm">No results</div>
          ) : (
            <div className="space-y-1">
              {songs.map((s, i) => (
                <SongRow key={s.id} song={s} index={i} queue={songs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
