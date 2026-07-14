import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SongRow } from "@/components/SongRow";
import { SongMenu } from "@/components/SongMenu";
import type { Song } from "@/lib/player-store";
import { usePlayer } from "@/lib/player-store";
import { Play, Music, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-hook";

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "R Musics — Free Music Streaming, Playlists & Player" },
      { name: "description", content: "R Musics is a free Spotify-style music streaming app. Discover songs, build playlists, like tracks, and enjoy a beautiful player on any device." },
      { name: "keywords", content: "r musics, rmusics, r music, music streaming, free music, playlists, spotify clone, online music player" },
      { property: "og:title", content: "R Musics — Free Music Streaming" },
      { property: "og:description", content: "Stream music, build playlists, and enjoy a beautiful player. Free on any device." },
      { property: "og:url", content: "https://rmusics.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://rmusics.lovable.app/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const { data: songs = [] } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("playlists").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(6);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: featured = [] } = useQuery({
    queryKey: ["playlists", "featured"],
    queryFn: async () => {
      const { data } = await supabase
        .from("playlists")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: true });
      return data ?? [];
    },
  });

  const playQueue = usePlayer((s) => s.playQueue);
  const recent = songs.slice(0, 8);
  const byGenre: Record<string, Song[]> = {};
  for (const s of songs) {
    const g = s.genre || "Other";
    (byGenre[g] ||= []).push(s);
  }

  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-4">{greeting()}</h1>
          <a
            href="https://riteshn.me"
            target="_blank"
            rel="noreferrer"
            className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-card/60 backdrop-blur px-3 py-2 hover:bg-accent transition group"
          >
            <img
              src="https://github.com/Ritesh771.png"
              alt="Ritesh N."
              className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/40 group-hover:ring-primary transition"
            />
            <div className="leading-tight pr-2">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Developed by</div>
              <div className="text-sm font-semibold">Ritesh N.</div>
            </div>
          </a>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.slice(0, 6).map((s) => (
              <div key={s.id} className="group relative flex items-center gap-3 bg-card/60 hover:bg-accent rounded-md overflow-hidden transition">
                <button
                  onClick={() => playQueue(recent, recent.findIndex((x) => x.id === s.id))}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                <div className="h-16 w-16 bg-muted shrink-0 overflow-hidden">
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 font-semibold truncate pr-2">{s.title}</div>
                </button>
                <SongMenu
                  song={s}
                  trigger={
                    <Button size="icon" variant="ghost" className="h-8 w-8 mr-2 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {featured.length > 0 && (
          <Section title="Featured">
            {featured.map((p) => (
              <Link key={p.id} to="/playlist/$id" params={{ id: p.id }} className="block group">
                <div className="bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200">
                  <div className="aspect-square bg-muted rounded mb-3 overflow-hidden">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary to-purple-600">
                        <Music className="h-10 w-10 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.description || "Playlist"}</div>
                </div>
              </Link>
            ))}
          </Section>
        )}

        {playlists.length > 0 && (
          <Section title="Your playlists">
            {playlists.map((p) => (
              <Link key={p.id} to="/playlist/$id" params={{ id: p.id }} className="block group">
                <div className="bg-card p-4 rounded-md hover:bg-accent transition">
                  <div className="aspect-square bg-muted rounded mb-3 overflow-hidden">
                    {p.cover_url ? (
                      <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-purple-600/40">
                        <Music className="h-10 w-10 text-white/70" />
                      </div>
                    )}
                  </div>
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.description || "Playlist"}</div>
                </div>
              </Link>
            ))}
          </Section>
        )}

        {Object.entries(byGenre).map(([genre, list]) => (
          <Section key={genre} title={genre}>
            {list.slice(0, 6).map((s) => (
              <div key={s.id} className="relative bg-card p-4 rounded-md hover:bg-accent transition group">
                <button
                  onClick={() => playQueue(list, list.findIndex((x) => x.id === s.id))}
                  className="block text-left w-full"
                >
                <div className="aspect-square bg-muted rounded mb-3 overflow-hidden relative">
                  {s.thumbnail_url ? (
                    <img src={s.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Music className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition flex items-center justify-center shadow-lg">
                    <Play className="h-4 w-4 fill-primary-foreground text-primary-foreground" />
                  </div>
                </div>
                <div className="font-semibold truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground truncate">{s.artist}</div>
                </button>
                <div className="absolute top-2 right-2">
                  <SongMenu
                    song={s}
                    trigger={
                      <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/70 backdrop-blur hover:bg-background">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>
              </div>
            ))}
          </Section>
        ))}

        {songs.length === 0 && (
          <div className="text-center py-16">
            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">No songs yet</h2>
            <p className="text-muted-foreground mb-4">Head to admin to add your first track.</p>
            <Link to="/admin" className="text-primary hover:underline">Go to admin →</Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {children}
      </div>
    </div>
  );
}
