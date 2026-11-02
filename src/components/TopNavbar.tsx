import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, X, Music, Disc, Loader2, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileMenu } from "./ProfileMenu";
import { usePlayer, type Song } from "@/lib/player-store";
import { useAuth } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";

interface PlaylistResult {
  id: string;
  name: string;
  cover_url?: string | null;
}

export function TopNavbar() {
  const nav = useNavigate();
  const { user } = useAuth();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const playQueue = usePlayer((s) => s.playQueue);
  const closeNowPlaying = usePlayer((s) => s.closeNowPlaying);
  const currentSongId = usePlayer((s) => s.queue[s.currentIndex]?.id);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchingSongs, setMatchingSongs] = useState<Song[]>([]);
  const [matchingPlaylists, setMatchingPlaylists] = useState<PlaylistResult[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setMatchingSongs([]);
      setMatchingPlaylists([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const fetchData = async () => {
      try {
        const cleanTerm = debouncedQuery.replace(/[,()*]/g, " ").trim();

        // 1. Search Songs (Public to all users)
        const songsPromise = supabase
          .from("songs")
          .select("*")
          .or(`title.ilike.%${cleanTerm}%,artist.ilike.%${cleanTerm}%,album.ilike.%${cleanTerm}%`)
          .limit(6);

        // 2. Search Playlists (Isolated to user's account only)
        const playlistsPromise = user?.id
          ? supabase
              .from("playlists")
              .select("id, name, cover_url")
              .eq("user_id", user.id)
              .ilike("name", `%${cleanTerm}%`)
              .limit(4)
          : Promise.resolve({ data: [] });

        const [songsRes, playlistsRes] = await Promise.all([songsPromise, playlistsPromise]);

        if (!isCancelled) {
          setMatchingSongs((songsRes.data as Song[]) || []);
          setMatchingPlaylists((playlistsRes.data as PlaylistResult[]) || []);
        }
      } catch (err) {
        console.error("Debounced search error:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, user?.id]);

  // Handle clicking outside the search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      nav({ to: "/search", search: { q: query.trim() } as any });
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handlePlaySong = (song: Song, all: Song[]) => {
    closeNowPlaying();
    setIsOpen(false);
    const startIdx = all.findIndex((s) => s.id === song.id);
    playQueue(all, startIdx >= 0 ? startIdx : 0);
  };

  const handleOpenPlaylist = (playlistId: string) => {
    setIsOpen(false);
    nav({ to: "/playlist/$id", params: { id: playlistId } });
  };

  const handleSeeAll = () => {
    setIsOpen(false);
    nav({ to: "/search", search: { q: query.trim() } as any });
  };

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 bg-background/60 backdrop-blur-md z-40 select-none relative">
      {/* LEFT: Sonara Branding */}
      <div className="flex items-center gap-3 shrink-0">
        <Link to="/" onClick={() => closeNowPlaying()} className="flex items-center gap-2.5 group">
          <img
            src="/sonara-icon.png"
            alt="Sonara"
            className="h-9 w-9 rounded-full object-contain shadow-md shadow-fuchsia-500/20 group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-foreground leading-none">
              Sonara
            </span>
            <span className="text-[9px] font-semibold text-primary tracking-wider uppercase hidden xl:block mt-0.5">
              Music Beyond Boundaries
            </span>
          </div>
        </Link>
      </div>

      {/* CENTER: Spotify-Style Debounced Global Search Bar & Popup */}
      <div ref={containerRef} className="flex-1 max-w-md md:max-w-xl mx-auto relative">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              closeNowPlaying();
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to play?"
            className="h-11 pl-10 pr-9 rounded-full bg-card/90 border border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-sm shadow-xs placeholder:text-muted-foreground/80 transition-all"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-accent cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* SPOTIFY-STYLE FLOATING SEARCH RESULTS DROPDOWN */}
        {isOpen && query.trim().length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-card text-card-foreground border border-border rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[75vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {loading && matchingSongs.length === 0 && matchingPlaylists.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground gap-2.5 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Searching catalog...</span>
              </div>
            ) : matchingSongs.length === 0 && matchingPlaylists.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No songs or playlists matching &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="overflow-y-auto divide-y divide-border/40 p-2 space-y-2">
                {/* MATCHING SONGS */}
                {matchingSongs.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1">
                      Songs
                    </div>
                    {matchingSongs.map((song) => {
                      const isCurrent = currentSongId === song.id;
                      return (
                        <div
                          key={song.id}
                          onClick={() => handlePlaySong(song, matchingSongs)}
                          className={
                            "group flex items-center gap-3 p-2 rounded-xl transition cursor-pointer relative border " +
                            (isCurrent
                              ? "bg-primary/10 border-primary/40 shadow-xs"
                              : "border-transparent hover:bg-muted/80")
                          }
                        >
                          <div className={"relative h-11 w-11 rounded-lg overflow-hidden shrink-0 bg-muted border " + (isCurrent ? "border-primary/50" : "border-border/30")}>
                            {song.thumbnail_url ? (
                              <img
                                src={song.thumbnail_url}
                                alt={song.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-secondary">
                                <Music className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Play className="h-5 w-5 fill-white text-white drop-shadow" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={"font-semibold text-sm truncate transition-colors " + (isCurrent ? "text-primary" : "text-foreground group-hover:text-primary")}>
                              {song.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {song.artist} {song.album ? `• ${song.album}` : ""}
                            </div>
                          </div>

                          {song.duration ? (
                            <div className={"text-xs tabular-nums shrink-0 pr-1 " + (isCurrent ? "text-primary font-semibold" : "text-muted-foreground")}>
                              {Math.floor(song.duration / 60)}:
                              {(song.duration % 60).toString().padStart(2, "0")}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* MATCHING USER PLAYLISTS */}
                {matchingPlaylists.length > 0 && (
                  <div className="p-2 space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 pb-1">
                      Your Playlists
                    </div>
                    {matchingPlaylists.map((pl) => (
                      <div
                        key={pl.id}
                        onClick={() => handleOpenPlaylist(pl.id)}
                        className="group flex items-center gap-3 p-2 rounded-xl hover:bg-muted/80 transition cursor-pointer"
                      >
                        <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                          {pl.cover_url ? (
                            <img
                              src={pl.cover_url}
                              alt={pl.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Disc className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {pl.name}
                          </div>
                          <div className="text-xs text-muted-foreground">Playlist</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* BOTTOM "SEE ALL" BAR */}
                <div className="pt-2 pb-1 px-2">
                  <button
                    onClick={handleSeeAll}
                    className="w-full text-center py-2 px-3 text-xs font-semibold text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg transition"
                  >
                    See all results for &ldquo;{query}&rdquo; →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT: Profile Dropdown */}
      <div className="flex items-center gap-3 shrink-0">
        <ProfileMenu />
      </div>
    </header>
  );
}
