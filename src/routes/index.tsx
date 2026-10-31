import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SongRow } from "@/components/SongRow";
import { SongMenu } from "@/components/SongMenu";
import { HomeSkeleton } from "@/components/Skeletons";
import type { Song } from "@/lib/player-store";
import { usePlayer } from "@/lib/player-store";
import { Play, Music, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-hook";
import { cleanSongTitle } from "@/lib/song-utils";

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
      { title: "Sonara — Music Beyond Boundaries" },
      { name: "description", content: "Sonara — premium music streaming. Discover songs, build playlists, like tracks, and enjoy a beautiful player on any device." },
      { name: "keywords", content: "sonara, music streaming, premium music player, playlists, online music player" },
      { property: "og:title", content: "Sonara — Music Beyond Boundaries" },
      { property: "og:description", content: "Stream music, build playlists, and enjoy a beautiful player. Music Beyond Boundaries." },
      { property: "og:url", content: "https://rmusics.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://rmusics.lovable.app/" }],
  }),
  component: HomePage,
});

function HomePage() {
  const { user } = useAuth();
  const { data: songs = [], isLoading: songsLoading } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Song[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("playlists").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false }).limit(6);
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
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
    staleTime: 1000 * 60 * 10,
  });

  const playQueue = usePlayer((s) => s.playQueue);
  const recent = songs.slice(0, 8);
  const byGenre: Record<string, Song[]> = {};
  for (const s of songs) {
    const g = s.genre || "Kannada";
    (byGenre[g] ||= []).push(s);
  }

  const GENRE_LABELS: Record<string, string> = {
    Kannada: "Kannada Blockbusters & Hits",
    Tamil: "Tamil Hits & Soundtracks",
    Hindi: "Bollywood & Hindi Hits",
    Telugu: "Telugu Hits & Melodies",
    "Pop & Indie": "Pop & Indie Hits",
    Malayalam: "Malayalam Chartbusters",
    "Chill & Lo-Fi": "Chill & Lo-Fi Vibes",
  };

  const preferredOrder = ["Kannada", "Tamil", "Hindi", "Telugu", "Pop & Indie", "Malayalam", "Chill & Lo-Fi"];
  const sortedGenreEntries = Object.entries(byGenre).sort(([a], [b]) => {
    const ia = preferredOrder.indexOf(a);
    const ib = preferredOrder.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b);
  });

  if (songsLoading && songs.length === 0) {
    return <HomeSkeleton />;
  }

  return (
    <div className="p-6 space-y-8">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold mb-5">{greeting()}</h1>
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
                <div className="flex-1 font-semibold truncate pr-2">{cleanSongTitle(s.title)}</div>
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

        {sortedGenreEntries.map(([genre, list]) => (
          <Section key={genre} title={GENRE_LABELS[genre] || `${genre} Hits`}>
            {list.slice(0, 6).map((s) => (
              <div key={s.id} className="relative bg-card p-4 rounded-md hover:bg-accent transition group">
                <button
                  onClick={() => playQueue(list, list.findIndex((x) => x.id === s.id))}
                  className="block text-left w-full cursor-pointer"
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
                <div className="font-semibold truncate">{cleanSongTitle(s.title)}</div>
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
