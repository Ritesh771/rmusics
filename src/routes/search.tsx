import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SongRow } from "@/components/SongRow";
import { SongTableSkeleton } from "@/components/Skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Music, X, Loader2, ArrowLeft, Play } from "lucide-react";
import { usePlayer, type Song } from "@/lib/player-store";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Sonara — Search & Browse" }] }),
  component: SearchPage,
});

interface BrowseCategory {
  id: string;
  name: string;
  color: string;
  coverUrl: string;
  filterFn: (song: Song) => boolean;
  filterQuery?: string;
}

const SPOTIFY_CATEGORIES: BrowseCategory[] = [
  {
    id: "kannada",
    name: "Kannada",
    color: "#BA5D07",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1779796695894-6b0dc54d-cover-1779796695821.jpeg",
    filterFn: (s) => (s.genre || "").toLowerCase().includes("kannada"),
  },
  {
    id: "hindi",
    name: "Hindi",
    color: "#E1118C",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433449449-d22yi-Tauba_Tauba__From__Bad_Newz__.jpeg",
    filterFn: (s) => (s.genre || "").toLowerCase().includes("hindi"),
  },
  {
    id: "tamil",
    name: "Tamil",
    color: "#BC5900",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433532755-cr294-Arabic_Kuthu___Halamithi_Habibo__From__B.jpeg",
    filterFn: (s) => (s.genre || "").toLowerCase().includes("tamil"),
  },
  {
    id: "telugu",
    name: "Telugu",
    color: "#1E3264",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433430342-8dfg4-Ramuloo_Ramulaa.jpeg",
    filterFn: (s) => (s.genre || "").toLowerCase().includes("telugu"),
  },
  {
    id: "malayalam",
    name: "Malayalam",
    color: "#056952",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433371300-1i20g-Illuminati___From__Aavesham_.jpeg",
    filterFn: (s) => (s.genre || "").toLowerCase().includes("malayalam"),
  },
  {
    id: "pop-indie",
    name: "Pop & Indie",
    color: "#8D67AB",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433365489-ufzm0-Peaky_Blinder.jpeg",
    filterFn: (s) => (s.genre || "").toLowerCase().includes("pop"),
  },
  {
    id: "chill-lofi",
    name: "Chill & Lo-Fi",
    color: "#0D73EC",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793357296659-dd9m8k-Jeene_Laga_Hoon_Lofi_Mix_.jpeg",
    filterFn: (s) => {
      const txt = `${s.title} ${s.artist} ${s.album || ""} ${s.genre || ""}`.toLowerCase();
      return (s.genre || "").toLowerCase().includes("chill") || txt.includes("lofi") || txt.includes("lo-fi") || txt.includes("slowed") || txt.includes("reverb") || txt.includes("chill");
    },
  },
  {
    id: "romantic",
    name: "Romantic & Melodies",
    color: "#DC143C",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/covers/playlist-eb1267cc-491b-451e-b170-5efab6f3ebd3-1793428708294.jpg",
    filterFn: (s) => {
      const txt = `${s.title} ${s.artist} ${s.album || ""}`.toLowerCase();
      return (
        txt.includes("love") || txt.includes("preethi") || txt.includes("gulaab") ||
        txt.includes("haadu") || txt.includes("sonu nigam") || txt.includes("shreya") ||
        txt.includes("shilpa") || txt.includes("sanjith")
      );
    },
  },
  {
    id: "party",
    name: "Party & Dance",
    color: "#7D4BEE",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433449449-d22yi-Tauba_Tauba__From__Bad_Newz__.jpeg",
    filterFn: (s) => {
      const txt = `${s.title} ${s.artist} ${s.album || ""}`.toLowerCase();
      return txt.includes("ekka") || txt.includes("tagaru") || txt.includes("bangle") || txt.includes("all ok") || txt.includes("dance") || txt.includes("party") || txt.includes("tauba") || txt.includes("chikni");
    },
  },
  {
    id: "new-releases",
    name: "New Releases",
    color: "#608108",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433474007-g2d0k-Aaj_Ki_Raat__From__Stree_2__.jpeg",
    filterFn: () => true, // All top new releases
  },
  {
    id: "charts",
    name: "Charts & Top Hits",
    color: "#7358FF",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433527602-vspup-Naa_Ready__From__Leo__.jpeg",
    filterFn: () => true,
  },
  {
    id: "classics",
    name: "Classics & Golden",
    color: "#B45309",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1779796695894-6b0dc54d-cover-1779796695821.jpeg",
    filterFn: (s) => {
      const txt = `${s.title} ${s.artist} ${s.album || ""}`.toLowerCase();
      return txt.includes("balasubrahmanyam") || txt.includes("rajkumar") || txt.includes("kailash") || txt.includes("akash");
    },
  },
  {
    id: "made-for-you",
    name: "Made For You",
    color: "#477D95",
    coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/covers/playlist-eb1267cc-491b-451e-b170-5efab6f3ebd3-1793428708294.jpg",
    filterFn: () => true,
  },
];

function SearchPage() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<BrowseCategory | null>(null);
  const playQueue = usePlayer((s) => s.playQueue);

  // Debounce input → query term
  useEffect(() => {
    const id = setTimeout(() => setTerm(q.trim()), 220);
    return () => clearTimeout(id);
  }, [q]);

  // Escape commas / parens that break PostgREST `.or()` filter strings
  const escape = (s: string) => s.replace(/[,()*]/g, " ").trim();

  // Load all library songs for instant category segregation and full search
  const { data: allSongs = [], isFetching: allSongsLoading } = useQuery({
    queryKey: ["songs", "library-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Song[];
    },
    staleTime: 1000 * 60 * 5,
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

  // Calculate filtered songs based on search term and selected category
  const filteredSongs = useMemo(() => {
    let result = allSongs;

    if (activeCategory) {
      if (activeCategory.id === "new-releases") {
        result = result.slice(0, 35);
      } else if (activeCategory.id === "charts") {
        result = result.slice(0, 50);
      } else {
        result = result.filter(activeCategory.filterFn);
      }
    }

    if (term) {
      const lowTerm = term.toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(lowTerm) ||
          s.artist.toLowerCase().includes(lowTerm) ||
          (s.album && s.album.toLowerCase().includes(lowTerm)) ||
          (s.genre && s.genre.toLowerCase().includes(lowTerm))
      );
    }

    return result;
  }, [allSongs, activeCategory, term]);

  const handleCategorySelect = (cat: BrowseCategory) => {
    setActiveCategory(cat);
  };

  const clearCategory = () => {
    setActiveCategory(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Search Input Bar */}
      <div className="relative max-w-xl">
        <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={activeCategory ? `Search within ${activeCategory.name}...` : "What do you want to play?"}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-10 pr-10 h-11 rounded-full bg-card/90 border border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-sm shadow-xs placeholder:text-muted-foreground/80 transition-all"
          autoFocus={!activeCategory}
        />
        {q && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQ("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            {allSongsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* ACTIVE CATEGORY VIEW (When user clicks on a category card) */}
      {activeCategory && !term && (
        <section className="space-y-6 animate-fade-in">
          {/* Header Banner for Category */}
          <div
            className="rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[160px]"
            style={{ backgroundColor: activeCategory.color }}
          >
            <div className="flex items-center justify-between gap-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCategory}
                className="text-white hover:bg-white/20 -ml-2 gap-1.5 font-semibold text-xs rounded-full cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>All Categories</span>
              </Button>
              <Badge variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0 font-bold text-xs uppercase tracking-wider">
                {filteredSongs.length} Tracks
              </Badge>
            </div>

            <div className="flex items-end justify-between gap-4 mt-6 z-10">
              <div>
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm">
                  {activeCategory.name}
                </h1>
                <p className="text-white/80 text-sm mt-1 font-medium">
                  Curated selection of {activeCategory.name} music in your Sonara library.
                </p>
              </div>

              {filteredSongs.length > 0 && (
                <Button
                  size="icon"
                  className="h-14 w-14 rounded-full bg-white text-zinc-950 hover:bg-white/90 hover:scale-105 shadow-xl transition-all shrink-0 cursor-pointer"
                  onClick={() => playQueue(filteredSongs, 0)}
                  title={`Play all ${activeCategory.name}`}
                >
                  <Play className="h-6 w-6 fill-zinc-950 ml-0.5" />
                </Button>
              )}
            </div>

            {/* Rotated background card artwork */}
            <div className="absolute -bottom-6 -right-6 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl shadow-2xl rotate-[25deg] overflow-hidden opacity-90 border-2 border-white/20 pointer-events-none">
              <img src={activeCategory.coverUrl} alt="" className="h-full w-full object-cover" />
            </div>
          </div>

          {/* Songs in this category */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Songs in {activeCategory.name}</h2>
            {filteredSongs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-border/60">
                No songs found in this category.
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSongs.map((s, i) => (
                  <div key={s.id} style={{ animationDelay: `${Math.min(i, 15) * 20}ms` }} className="animate-fade-in">
                    <SongRow song={s} index={i} queue={filteredSongs} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* DEFAULT SPOTIFY BROWSE GRID (When no category or term is active) */}
      {!activeCategory && !term && (
        <section className="space-y-4 animate-fade-in">
          <h2 className="text-2xl font-black tracking-tight text-foreground">Browse all</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {SPOTIFY_CATEGORIES.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat)}
                style={{
                  backgroundColor: cat.color,
                  animationDelay: `${i * 30}ms`,
                }}
                className="relative h-32 sm:h-36 md:h-40 rounded-xl overflow-hidden p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer select-none group animate-fade-in"
              >
                <span className="text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight block max-w-[65%] drop-shadow-sm">
                  {cat.name}
                </span>

                {/* Spotify-style tilted corner artwork */}
                <div className="absolute -bottom-2 -right-3 w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-md shadow-2xl rotate-[24deg] translate-x-1 translate-y-1 overflow-hidden transition-transform duration-300 group-hover:rotate-[28deg] group-hover:scale-105 border border-white/10 shrink-0">
                  <img
                    src={cat.coverUrl}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* SEARCH RESULTS (When query term is active) */}
      {term && (
        <div className="space-y-6 animate-fade-in">
          {playlists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-3 tracking-tight">Playlists</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {playlists.map((p, i) => (
                  <Link
                    key={p.id}
                    to="/playlist/$id"
                    params={{ id: p.id }}
                    style={{ animationDelay: `${i * 30}ms` }}
                    className="block bg-card p-3 sm:p-4 rounded-xl border border-border/50 hover:bg-accent/60 hover:scale-[1.02] transition-all duration-200 animate-fade-in shadow-xs"
                  >
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                      {p.cover_url ? (
                        <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Music className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <div className="font-semibold text-sm truncate text-foreground">{p.name}</div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">{p.description || "Playlist"}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold tracking-tight">Songs</h2>
              <span className="text-xs text-muted-foreground font-semibold">
                {filteredSongs.length} results
              </span>
            </div>

            {allSongsLoading && filteredSongs.length === 0 ? (
              <SongTableSkeleton rows={8} />
            ) : filteredSongs.length === 0 ? (
              <div className="text-muted-foreground text-sm py-12 text-center bg-card/40 rounded-2xl border border-border/60">
                {`No songs match "${term}"`}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredSongs.map((s, i) => (
                  <div key={s.id} style={{ animationDelay: `${Math.min(i, 15) * 20}ms` }} className="animate-fade-in">
                    <SongRow song={s} index={i} queue={filteredSongs} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
