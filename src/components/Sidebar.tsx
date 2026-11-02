import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Library, Heart, Plus, Music, Clock, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-hook";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePlayer } from "@/lib/player-store";

function SpotifyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.305a.75.75 0 01-1.03.248c-2.822-1.724-6.375-2.114-10.558-1.159a.75.75 0 01-.334-1.462c4.58-1.045 8.514-.603 11.674 1.343a.75.75 0 01.248 1.03zm1.468-3.264a.938.938 0 01-1.288.309c-3.23-1.986-8.156-2.56-11.977-1.4a.938.938 0 01-.55-1.794c4.372-1.328 9.807-.684 13.506 1.597a.938.938 0 01.309 1.288zm.126-3.41c-3.874-2.3-10.264-2.512-13.978-1.385a1.125 1.125 0 11-.652-2.154c4.266-1.295 11.316-1.049 15.794 1.609a1.125 1.125 0 11-1.164 1.93z" />
    </svg>
  );
}

export function Sidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const qc = useQueryClient();
  const { user } = useAuth();
  const closeNowPlaying = usePlayer((s) => s.closeNowPlaying);

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("playlists")
        .select("*, playlist_songs(position, songs(thumbnail_url))")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: true,
  });

  const createPlaylist = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase
        .from("playlists")
        .insert({ name: `My Playlist #${playlists.length + 1}`, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] }),
  });

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
    { to: "/history", icon: Clock, label: "Recently played" },
    { to: "/import", icon: SpotifyIcon, label: "Import from Spotify" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 gap-2 h-full pb-24 select-none">
      <div className="bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-3 shadow-xs">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => closeNowPlaying()}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer",
                  active
                    ? "bg-accent text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-3 flex-1 flex flex-col min-h-0 shadow-xs">
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
            <Library className="h-4 w-4" />
            <span>Your Library</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-full hover:bg-accent cursor-pointer"
            onClick={() => createPlaylist.mutate()}
            title="Create playlist"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Link
          to="/liked"
          onClick={() => closeNowPlaying()}
          className={cn(
            "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all cursor-pointer mb-1",
            pathname === "/liked" ? "bg-accent text-primary font-semibold" : "hover:bg-accent/50"
          )}
        >
          <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center shrink-0 shadow-xs">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>
          <div className="truncate">
            <div className="font-semibold text-foreground truncate">Liked Songs</div>
            <div className="text-xs text-muted-foreground">Playlist • Auto</div>
          </div>
        </Link>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
          {playlists.map((p: any) => {
            const active = pathname === `/playlist/${p.id}`;
            const firstSongThumb = p.playlist_songs?.find((ps: any) => ps?.songs?.thumbnail_url)?.songs?.thumbnail_url;
            const cover = p.cover_url || firstSongThumb;
            return (
              <Link
                key={p.id}
                to="/playlist/$id"
                params={{ id: p.id }}
                onClick={() => closeNowPlaying()}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all cursor-pointer group",
                  active ? "bg-accent text-primary font-semibold" : "hover:bg-accent/50"
                )}
              >
                <div className="h-11 w-11 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                  {cover ? (
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      loading="eager"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <Music className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="truncate min-w-0">
                  <div className="font-semibold truncate text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Playlist</div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="border-t border-border/60 mt-2 pt-2 space-y-2">
          {/* Sidebar Footer */}
          <div className="px-3 pt-1 text-[11px] text-muted-foreground/60 leading-tight">
            © 2026 Sonara — Music Beyond Boundaries
          </div>
        </div>
      </div>
    </aside>
  );
}