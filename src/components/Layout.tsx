import { useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";
import { NowPlayingSidebar } from "./NowPlayingSidebar";
import { NowPlaying } from "./NowPlaying";
import { QueuePanel } from "./QueuePanel";
import { Player } from "./Player";
import { AppShellSkeleton } from "./Skeletons";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Search, Library, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-hook";
import { MoodBackdrop } from "./MoodBackdrop";

export function Layout({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const mainRef = useRef<HTMLElement>(null);

  // Automatically scroll main viewport back to top on page navigation
  useEffect(() => {
    const el = mainRef.current;
    if (el) {
      el.scrollTop = 0;
      el.scrollLeft = 0;
    }
  }, [pathname]);

  // Realtime updates for library, playlists, and songs
  useEffect(() => {
    const ch = supabase
      .channel("realtime-all")
      .on("postgres_changes", { event: "*", schema: "public", table: "songs" }, () =>
        qc.invalidateQueries({ queryKey: ["songs"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "playlists" }, () =>
        qc.invalidateQueries({ queryKey: ["playlists"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "playlist_songs" }, () =>
        qc.invalidateQueries({ queryKey: ["playlist"] })
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "liked_songs" }, () =>
        qc.invalidateQueries({ queryKey: ["liked"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);

  const PUBLIC_ROUTES = ["/login", "/privacy", "/terms", "/cookies", "/data-deletion"];
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      const redirectQuery = pathname && pathname !== "/" ? `?redirect=${encodeURIComponent(pathname)}` : "";
      nav({ to: `/login${redirectQuery}` as any });
    }
  }, [loading, user, pathname, isPublicRoute, nav]);

  const mobileNav = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
    { to: "/liked", icon: Heart, label: "Liked" },
  ];

  return (
    <div id="app-layout" className="h-screen flex flex-col bg-background text-foreground overflow-hidden relative">
      <MoodBackdrop intensity={0.7} />

      {/* TOP SPOTIFY-STYLE NAVBAR */}
      <TopNavbar />

      {/* 3-COLUMN WORKSPACE: LEFT SIDEBAR + CENTER MAIN OUTLET + RIGHT NOW PLAYING PANEL */}
      <div className="flex-1 flex min-h-0 relative z-10 px-2 pb-2 gap-2 overflow-hidden">
        <Sidebar />

        <main
          ref={mainRef}
          key={pathname}
          id="main-content"
          className="flex-1 bg-card border border-border/70 rounded-2xl overflow-y-auto pb-28 md:pb-24 shadow-xs [contain:paint]"
        >
          {loading || (!user && !isPublicRoute) ? (
            <>
              <AppShellSkeleton />
              <div className="hidden">{children}</div>
            </>
          ) : (
            children
          )}
        </main>

        <NowPlayingSidebar />
      </div>

      {/* FULLSCREEN NOW PLAYING OVERLAY (Outside main container to avoid transform/blur containment) */}
      <NowPlaying />

      {/* QUEUE DRAWER */}
      <QueuePanel />

      {/* BOTTOM FIXED FULL PLAYER */}
      <Player />

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur border-t border-border flex justify-around items-center z-50">
        {mobileNav.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "flex flex-col items-center text-xs gap-0.5 px-3 py-1 transition-all duration-200 active:scale-90",
              pathname === it.to ? "text-primary" : "text-muted-foreground"
            )}
          >
            <it.icon className={cn("h-5 w-5 transition-transform", pathname === it.to && "scale-110")} />
            {it.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
