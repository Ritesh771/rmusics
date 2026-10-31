import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Music, Heart, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-hook";
import { LibrarySkeleton } from "@/components/Skeletons";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Sonara — Library" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const { data: playlists = [], isLoading: playlistsLoading } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("playlists")
        .select("*, playlist_songs(position, songs(thumbnail_url))")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 1000 * 30,
  });
  const { data: featured = [] } = useQuery({
    queryKey: ["playlists", "featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("playlists")
        .select("*, playlist_songs(position, songs(thumbnail_url))")
        .eq("is_featured", true)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
    staleTime: 1000 * 60,
  });

  const term = q.trim().toLowerCase();
  // Merge featured + own, de-duplicated, featured first
  const merged = useMemo(() => {
    const seen = new Set<string>();
    const out: typeof playlists = [];
    for (const p of featured) if (!seen.has(p.id)) { seen.add(p.id); out.push(p); }
    for (const p of playlists) if (!seen.has(p.id)) { seen.add(p.id); out.push(p); }
    return out;
  }, [featured, playlists]);
  const filtered = useMemo(() => {
    if (!term) return merged;
    return merged.filter((p) =>
      (p.name || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
    );
  }, [merged, term]);
  const showLiked = !term || "liked songs".includes(term);

  if (playlistsLoading && playlists.length === 0) {
    return <LibrarySkeleton />;
  }

  return (
    <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold">Your Library</h1>
          <div className="relative w-full sm:w-72">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in Your Library"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 bg-card border-border"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {showLiked && (
          <Link to="/liked" className="block bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200 animate-fade-in">
            <div className="aspect-square rounded mb-3 bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center">
              <Heart className="h-12 w-12 fill-white text-white" />
            </div>
            <div className="font-semibold">Liked Songs</div>
            <div className="text-xs text-muted-foreground">Playlist</div>
          </Link>
          )}
          {filtered.map((p: any) => {
            const firstSongThumb = p.playlist_songs?.find((ps: any) => ps?.songs?.thumbnail_url)?.songs?.thumbnail_url;
            const cover = p.cover_url || firstSongThumb;
            return (
              <Link key={p.id} to="/playlist/$id" params={{ id: p.id }} className="block bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200 animate-fade-in group">
                <div className="aspect-square bg-muted rounded mb-3 overflow-hidden flex items-center justify-center">
                  {cover ? (
                    <img
                      src={cover}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      loading="eager"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Music className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <div className="font-semibold truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.description || "Playlist"}</div>
              </Link>
            );
          })}
          {term && filtered.length === 0 && !showLiked && (
            <div className="col-span-full text-sm text-muted-foreground">No playlists match "{q}"</div>
          )}
        </div>
      </div>
  );
}
