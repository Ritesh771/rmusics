import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Music, Heart, Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-hook";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Wavely — Library" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("playlists").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return playlists;
    return playlists.filter((p) =>
      (p.name || "").toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
    );
  }, [playlists, term]);
  const showLiked = !term || "liked songs".includes(term);

  return (
    <Layout>
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
          {filtered.map((p) => (
            <Link key={p.id} to="/playlist/$id" params={{ id: p.id }} className="block bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200 animate-fade-in">
              <div className="aspect-square bg-muted rounded mb-3 overflow-hidden flex items-center justify-center">
                {p.cover_url ? (
                  <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Music className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="font-semibold truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground truncate">{p.description || "Playlist"}</div>
            </Link>
          ))}
          {term && filtered.length === 0 && !showLiked && (
            <div className="col-span-full text-sm text-muted-foreground">No playlists match "{q}"</div>
          )}
        </div>
      </div>
    </Layout>
  );
}
