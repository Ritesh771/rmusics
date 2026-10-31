import { useState, useEffect } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ProfileMenu } from "./ProfileMenu";
import { usePlayer } from "@/lib/player-store";

export function TopNavbar() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [query, setQuery] = useState("");
  const closeNowPlaying = usePlayer((s) => s.closeNowPlaying);

  // Sync with search page if already on search
  useEffect(() => {
    if (!pathname.startsWith("/search")) {
      setQuery("");
    }
  }, [pathname]);

  const handleSearchChange = (val: string) => {
    setQuery(val);
    if (pathname !== "/search") {
      nav({ to: "/search" });
    }
  };

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 bg-background/60 backdrop-blur-md z-30 select-none">
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

      {/* CENTER: Spotify-Style Global Search Bar */}
      <div className="flex-1 max-w-md md:max-w-xl mx-auto">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => {
              closeNowPlaying();
              if (pathname !== "/search") nav({ to: "/search" });
            }}
            placeholder="What do you want to play?"
            className="h-11 pl-10 pr-9 rounded-full bg-card/90 border border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-sm shadow-xs placeholder:text-muted-foreground/80 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-accent cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Profile Dropdown */}
      <div className="flex items-center gap-3 shrink-0">
        <ProfileMenu />
      </div>
    </header>
  );
}

