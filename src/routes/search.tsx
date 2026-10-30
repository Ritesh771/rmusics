import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SongRow } from "@/components/SongRow";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Music, X, Loader2 } from "lucide-react";
import type { Song } from "@/lib/player-store";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Sonara — Search" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");

  // Debounce input → query term
  useEffect(() => {
    const id = setTimeout(() => setTerm(q.trim()), 220);
    return () => clearTimeout(id);
  }, [q]);

  // Escape commas / parens that break PostgREST `.or()` filter strings
  const escape = (s: string) => s.replace(/[,()*]/g, " ").trim();

  const { data: songs = [], isFetching: songsLoading } = useQuery({
    queryKey: ["songs", "search", term],
    queryFn: async () => {
      let query = supabase.from("songs").select("*").order("created_at", { ascending: false });
      if (term) {
        const like = `%${escape(term)}%`;
        query = query.or(`title.ilike.${like},artist.ilike.${like},album.ilike.${like},genre.ilike.${like}`);
      }
      const { data, error } = await query.limit(term ? 50 : 30);
      if (error) throw error;
      return data as Song[];
    },
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", "search", term],
    queryFn: async () => {
      let query = supabase.from("playlists").select("*").order("updated_at", { ascending: false });
      if (term) query = query.ilike("name", `%${escape(term)}%`);
      const { data } = await query.limit(20);
      return data ?? [];
    },
  });

  // Genre quick-pick chips (Spotify "Browse all"-style)
  const genres = [
    { name: "Pop",       from: "from-pink-500",     to: "to-rose-500" },
    { name: "Hip-Hop",   from: "from-amber-500",    to: "to-red-600" },
    { name: "Rock",      from: "from-red-600",      to: "to-orange-500" },
    { name: "Electronic",from: "from-fuchsia-500",  to: "to-indigo-600" },
    { name: "Jazz",      from: "from-emerald-500",  to: "to-teal-700" },
    { name: "Classical", from: "from-blue-500",     to: "to-indigo-700" },
    { name: "R&B",       from: "from-purple-500",   to: "to-pink-600" },
    { name: "Country",   from: "from-yellow-500",   to: "to-orange-600" },
  ];

  return (
    <div className="p-6 space-y-8 animate-fade-in">
        <div className="relative max-w-xl">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="What do you want to listen to?"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-10 pr-10 h-11 rounded-full bg-card border-border focus-visible:ring-primary/40"
            autoFocus
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
            >
              {songsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            </button>
          )}
        </div>

        {!term && (
          <section className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {genres.map((g, i) => (
                <button
                  key={g.name}
                  onClick={() => setQ(g.name)}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className={`relative h-28 rounded-lg overflow-hidden text-left p-4 bg-gradient-to-br ${g.from} ${g.to} hover:scale-[1.03] active:scale-[0.98] transition-transform duration-200 animate-fade-in`}
                >
                  <span className="text-lg font-bold text-white drop-shadow">{g.name}</span>
                  <Music className="absolute -bottom-2 -right-2 h-16 w-16 text-white/30 rotate-[20deg]" />
                </button>
              ))}
            </div>
          </section>
        )}

        {term && playlists.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-3">Playlists</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {playlists.map((p, i) => (
                <Link
                  key={p.id}
                  to="/playlist/$id"
                  params={{ id: p.id }}
                  style={{ animationDelay: `${i * 30}ms` }}
                  className="block bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200 animate-fade-in"
                >
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
          </section>
        )}

        {term && (
          <section>
            <h2 className="text-xl font-bold mb-3">Songs</h2>
            {songs.length === 0 ? (
              <div className="text-muted-foreground text-sm py-8 text-center">
                {songsLoading ? "Searching…" : `No results for "${term}"`}
              </div>
            ) : (
              <div className="space-y-1">
                {songs.map((s, i) => (
                  <div key={s.id} style={{ animationDelay: `${Math.min(i, 15) * 25}ms` }} className="animate-fade-in">
                    <SongRow song={s} index={i} queue={songs} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>
  );
}
