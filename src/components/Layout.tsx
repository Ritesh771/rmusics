import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { ProfileMenu } from "./ProfileMenu";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Home, Search, Library, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-hook";
import { Loader2, Sparkles } from "lucide-react";
import { MoodBackdrop } from "./MoodBackdrop";
import { useMood } from "@/lib/mood-store";
import { Button } from "./ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();
  const { user, loading } = useAuth();
  const { enabled: moodOn, toggle: toggleMood } = useMood();

  // Realtime invalidation
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      qc.invalidateQueries();
      if (event === "SIGNED_OUT") nav({ to: "/login" });
    });
    return () => subscription.unsubscribe();
  }, [qc, nav]);

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
  }, [loading, user, nav]);

  if (loading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const mobileNav = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
    { to: "/liked", icon: Heart, label: "Liked" },
  ];

  return (
    <div className="h-screen flex flex-col bg-black overflow-hidden relative">
      <MoodBackdrop intensity={0.7} />
      <div className="flex-1 flex min-h-0 relative z-10">
        <Sidebar />
        <main className="flex-1 bg-gradient-to-b from-card to-background rounded-lg m-0 md:m-2 md:ml-0 overflow-y-auto pb-36 md:pb-2">
          <div className="flex justify-end items-center gap-2 p-3 md:p-4 sticky top-0 z-30 bg-gradient-to-b from-background/80 to-transparent backdrop-blur">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggleMood}
              aria-label="Toggle mood lights"
              title={moodOn ? "Mood lights on" : "Mood lights off"}
              className="h-8 w-8 rounded-full"
            >
              <Sparkles className={cn("h-4 w-4 transition-colors", moodOn ? "text-primary animate-pulse-soft" : "text-muted-foreground")} />
            </Button>
            <ProfileMenu />
          </div>
          {children}
        </main>
      </div>
      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/95 backdrop-blur border-t border-border flex justify-around items-center z-50">
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