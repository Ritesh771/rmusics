import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Music, Heart } from "lucide-react";
import { useAuth } from "@/lib/auth-hook";

export const Route = createFileRoute("/library")({
  head: () => ({ meta: [{ title: "Wavely — Library" }] }),
  component: LibraryPage,
});

function LibraryPage() {
  const { user } = useAuth();
  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("playlists").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Your Library</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <Link to="/liked" className="block bg-card p-4 rounded-md hover:bg-accent transition">
            <div className="aspect-square rounded mb-3 bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center">
              <Heart className="h-12 w-12 fill-white text-white" />
            </div>
            <div className="font-semibold">Liked Songs</div>
            <div className="text-xs text-muted-foreground">Playlist</div>
          </Link>
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
              <div className="text-xs text-muted-foreground truncate">{p.description || "Playlist"}</div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}
