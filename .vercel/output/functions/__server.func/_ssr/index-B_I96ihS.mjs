import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { S as SongMenu } from "./SongMenu-BuwJO59f.mjs";
import { z as useAuth, G as usePlayer, H as HomeSkeleton, B as Button } from "./router-SYh-4Vc5.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { c as cleanSongTitle } from "./song-utils-CWgDAApr.mjs";
import "../_libs/sonner.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { y as Music, E as Ellipsis, K as Play } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/radix-ui__react-menu.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "../_libs/radix-ui__react-slider.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/zustand.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
function greeting() {
  const h = (/* @__PURE__ */ new Date()).getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}
function HomePage() {
  const {
    user
  } = useAuth();
  const {
    data: songs = [],
    isLoading: songsLoading
  } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("songs").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data;
    },
    staleTime: 1e3 * 60 * 5
  });
  const {
    data: playlists = []
  } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("playlists").select("*").eq("user_id", user.id).order("updated_at", {
        ascending: false
      }).limit(6);
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 1e3 * 60 * 5
  });
  const {
    data: featured = []
  } = useQuery({
    queryKey: ["playlists", "featured"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("playlists").select("*").eq("is_featured", true).order("created_at", {
        ascending: true
      });
      return data ?? [];
    },
    staleTime: 1e3 * 60 * 10
  });
  const playQueue = usePlayer((s) => s.playQueue);
  const recent = songs.slice(0, 8);
  const byGenre = {};
  for (const s of songs) {
    const g = s.genre || "Kannada";
    (byGenre[g] ||= []).push(s);
  }
  const GENRE_LABELS = {
    Kannada: "Kannada Blockbusters & Hits",
    Tamil: "Tamil Hits & Soundtracks",
    Hindi: "Bollywood & Hindi Hits",
    Telugu: "Telugu Hits & Melodies",
    "Pop & Indie": "Pop & Indie Hits",
    Malayalam: "Malayalam Chartbusters",
    "Chill & Lo-Fi": "Chill & Lo-Fi Vibes"
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
    return /* @__PURE__ */ jsxRuntimeExports.jsx(HomeSkeleton, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-5", children: greeting() }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: recent.slice(0, 6).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group relative flex items-center gap-3 bg-card/60 hover:bg-accent rounded-md overflow-hidden transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => playQueue(recent, recent.findIndex((x) => x.id === s.id)), className: "flex items-center gap-3 flex-1 min-w-0 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 bg-muted shrink-0 overflow-hidden", children: s.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-6 w-6 text-muted-foreground" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 font-semibold truncate pr-2", children: cleanSongTitle(s.title) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SongMenu, { song: s, trigger: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 mr-2 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) })
      ] }, s.id)) })
    ] }),
    featured.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Featured", children: featured.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/playlist/$id", params: {
      id: p.id
    }, className: "block group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-muted rounded mb-3 overflow-hidden", children: p.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.cover_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center bg-gradient-to-br from-primary to-purple-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-10 w-10 text-white" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: p.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: p.description || "Playlist" })
    ] }) }, p.id)) }),
    playlists.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Your playlists", children: playlists.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/playlist/$id", params: {
      id: p.id
    }, className: "block group", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-4 rounded-md hover:bg-accent transition", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-muted rounded mb-3 overflow-hidden", children: p.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.cover_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/40 to-purple-600/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-10 w-10 text-white/70" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: p.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: p.description || "Playlist" })
    ] }) }, p.id)) }),
    sortedGenreEntries.map(([genre, list]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: GENRE_LABELS[genre] || `${genre} Hits`, children: list.slice(0, 6).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-card p-4 rounded-md hover:bg-accent transition group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => playQueue(list, list.findIndex((x) => x.id === s.id)), className: "block text-left w-full cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "aspect-square bg-muted rounded mb-3 overflow-hidden relative", children: [
          s.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-10 w-10 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 right-2 h-10 w-10 rounded-full bg-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 fill-primary-foreground text-primary-foreground" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: cleanSongTitle(s.title) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: s.artist })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SongMenu, { song: s, trigger: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 bg-background/70 backdrop-blur hover:bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }) })
    ] }, s.id)) }, genre)),
    songs.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-16 w-16 mx-auto text-muted-foreground mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "No songs yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-4", children: "Head to admin to add your first track." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/admin", className: "text-primary hover:underline", children: "Go to admin →" })
    ] })
  ] });
}
function Section({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold mb-3", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3", children })
  ] });
}
export {
  HomePage as component
};
