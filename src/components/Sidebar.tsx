import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Library, Heart, Plus, Shield, Music } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getOwnerKey } from "@/lib/owner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const qc = useQueryClient();
  const owner = typeof window !== "undefined" ? getOwnerKey() : "";

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", owner],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playlists")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!owner,
  });

  const createPlaylist = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("playlists")
        .insert({ name: `My Playlist #${playlists.length + 1}`, owner_key: owner })
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
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 gap-2 p-2 h-full">
      <div className="bg-card rounded-lg p-4">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Music className="h-7 w-7 text-primary" />
          <span className="font-bold text-lg">Wavely</span>
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