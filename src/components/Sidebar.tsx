import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Library, Heart, Plus, Shield, Music, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-hook";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
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
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 gap-2 p-2 h-full">
      <div className="bg-card rounded-lg p-4">
        <Link to="/" className="flex items-center gap-3 mb-6 group">
          <img
            src="/sonara-icon.png"
            alt="Sonara"
            className="h-9 w-9 rounded-full object-contain shadow-md shadow-fuchsia-500/20 group-hover:scale-105 transition-transform"
          />
          <div>
            <span className="font-extrabold text-xl tracking-tight leading-none block">Sonara</span>
            <span className="text-[9px] font-semibold text-fuchsia-600 dark:text-fuchsia-400 tracking-wider uppercase block mt-0.5">
              Beyond Boundaries
            </span>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-card rounded-lg p-2 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold text-muted-foreground">Your Library</span>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => createPlaylist.mutate()}
            title="Create playlist"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Link
          to="/liked"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            pathname === "/liked" ? "bg-accent" : "hover:bg-accent/50"
          )}
        >
          <div className="h-10 w-10 rounded bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center">
            <Heart className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <div className="font-medium">Liked Songs</div>
            <div className="text-xs text-muted-foreground">Playlist</div>
          </div>
        </Link>
        <div className="flex-1 overflow-y-auto mt-1">
          {playlists.map((p) => {
            const active = pathname === `/playlist/${p.id}`;
            return (
              <Link
                key={p.id}
                to="/playlist/$id"
                params={{ id: p.id }}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                  {p.cover_url ? (
                    <img src={p.cover_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Music className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="truncate">
                  <div className="font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground">Playlist</div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          to="/admin"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground border-t border-border mt-2 pt-3"
        >
          <Shield className="h-3.5 w-3.5" /> Admin
        </Link>
      </div>
    </aside>
  );
}