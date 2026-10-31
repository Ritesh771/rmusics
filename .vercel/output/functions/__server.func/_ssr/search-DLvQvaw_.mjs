import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { S as SongRow } from "./SongRow-DVoBGCB8.mjs";
import { G as usePlayer, I as Input, B as Button, q as SongTableSkeleton, t as cn } from "./router-SYh-4Vc5.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import "../_libs/sonner.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { S as Search, s as LoaderCircle, a6 as X, A as ArrowLeft, K as Play, y as Music } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "async_hooks";
import "stream";
import "crypto";
import "../_libs/isbot.mjs";
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
import "./song-utils-CWgDAApr.mjs";
import "./SongMenu-BuwJO59f.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-dropdown-menu.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
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
import "../_libs/dnd-kit__accessibility.mjs";
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Badge({ className, variant, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn(badgeVariants({ variant }), className), ...props });
}
const SPOTIFY_CATEGORIES = [{
  id: "kannada",
  name: "Kannada",
  color: "#BA5D07",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1779796695894-6b0dc54d-cover-1779796695821.jpeg",
  filterFn: (s) => (s.genre || "").toLowerCase().includes("kannada")
}, {
  id: "hindi",
  name: "Hindi",
  color: "#E1118C",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433449449-d22yi-Tauba_Tauba__From__Bad_Newz__.jpeg",
  filterFn: (s) => (s.genre || "").toLowerCase().includes("hindi")
}, {
  id: "tamil",
  name: "Tamil",
  color: "#BC5900",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433532755-cr294-Arabic_Kuthu___Halamithi_Habibo__From__B.jpeg",
  filterFn: (s) => (s.genre || "").toLowerCase().includes("tamil")
}, {
  id: "telugu",
  name: "Telugu",
  color: "#1E3264",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433430342-8dfg4-Ramuloo_Ramulaa.jpeg",
  filterFn: (s) => (s.genre || "").toLowerCase().includes("telugu")
}, {
  id: "malayalam",
  name: "Malayalam",
  color: "#056952",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433371300-1i20g-Illuminati___From__Aavesham_.jpeg",
  filterFn: (s) => (s.genre || "").toLowerCase().includes("malayalam")
}, {
  id: "pop-indie",
  name: "Pop & Indie",
  color: "#8D67AB",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433365489-ufzm0-Peaky_Blinder.jpeg",
  filterFn: (s) => (s.genre || "").toLowerCase().includes("pop")
}, {
  id: "chill-lofi",
  name: "Chill & Lo-Fi",
  color: "#0D73EC",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793357296659-dd9m8k-Jeene_Laga_Hoon_Lofi_Mix_.jpeg",
  filterFn: (s) => {
    const txt = `${s.title} ${s.artist} ${s.album || ""} ${s.genre || ""}`.toLowerCase();
    return (s.genre || "").toLowerCase().includes("chill") || txt.includes("lofi") || txt.includes("lo-fi") || txt.includes("slowed") || txt.includes("reverb") || txt.includes("chill");
  }
}, {
  id: "romantic",
  name: "Romantic & Melodies",
  color: "#DC143C",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/covers/playlist-eb1267cc-491b-451e-b170-5efab6f3ebd3-1793428708294.jpg",
  filterFn: (s) => {
    const txt = `${s.title} ${s.artist} ${s.album || ""}`.toLowerCase();
    return txt.includes("love") || txt.includes("preethi") || txt.includes("gulaab") || txt.includes("haadu") || txt.includes("sonu nigam") || txt.includes("shreya") || txt.includes("shilpa") || txt.includes("sanjith");
  }
}, {
  id: "party",
  name: "Party & Dance",
  color: "#7D4BEE",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433449449-d22yi-Tauba_Tauba__From__Bad_Newz__.jpeg",
  filterFn: (s) => {
    const txt = `${s.title} ${s.artist} ${s.album || ""}`.toLowerCase();
    return txt.includes("ekka") || txt.includes("tagaru") || txt.includes("bangle") || txt.includes("all ok") || txt.includes("dance") || txt.includes("party") || txt.includes("tauba") || txt.includes("chikni");
  }
}, {
  id: "new-releases",
  name: "New Releases",
  color: "#608108",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433474007-g2d0k-Aaj_Ki_Raat__From__Stree_2__.jpeg",
  filterFn: () => true
  // All top new releases
}, {
  id: "charts",
  name: "Charts & Top Hits",
  color: "#7358FF",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1793433527602-vspup-Naa_Ready__From__Leo__.jpeg",
  filterFn: () => true
}, {
  id: "classics",
  name: "Classics & Golden",
  color: "#B45309",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/songs/1779796695894-6b0dc54d-cover-1779796695821.jpeg",
  filterFn: (s) => {
    const txt = `${s.title} ${s.artist} ${s.album || ""}`.toLowerCase();
    return txt.includes("balasubrahmanyam") || txt.includes("rajkumar") || txt.includes("kailash") || txt.includes("akash");
  }
}, {
  id: "made-for-you",
  name: "Made For You",
  color: "#477D95",
  coverUrl: "https://pub-03aa5d89bee943c7a60f4f528c80bdf9.r2.dev/covers/playlist-eb1267cc-491b-451e-b170-5efab6f3ebd3-1793428708294.jpg",
  filterFn: () => true
}];
function SearchPage() {
  const [q, setQ] = reactExports.useState("");
  const [term, setTerm] = reactExports.useState("");
  const [activeCategory, setActiveCategory] = reactExports.useState(null);
  const playQueue = usePlayer((s) => s.playQueue);
  reactExports.useEffect(() => {
    const id = setTimeout(() => setTerm(q.trim()), 220);
    return () => clearTimeout(id);
  }, [q]);
  const escape = (s) => s.replace(/[,()*]/g, " ").trim();
  const {
    data: allSongs = [],
    isFetching: allSongsLoading
  } = useQuery({
    queryKey: ["songs", "library-all"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("songs").select("*").order("created_at", {
        ascending: false
      });
      if (error) throw error;
      return data || [];
    },
    staleTime: 1e3 * 60 * 5
  });
  const {
    data: playlists = []
  } = useQuery({
    queryKey: ["playlists", "search", term],
    queryFn: async () => {
      let query = supabase.from("playlists").select("*").order("updated_at", {
        ascending: false
      });
      if (term) query = query.ilike("name", `%${escape(term)}%`);
      const {
        data
      } = await query.limit(20);
      return data ?? [];
    }
  });
  const filteredSongs = reactExports.useMemo(() => {
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
      result = result.filter((s) => s.title.toLowerCase().includes(lowTerm) || s.artist.toLowerCase().includes(lowTerm) || s.album && s.album.toLowerCase().includes(lowTerm) || s.genre && s.genre.toLowerCase().includes(lowTerm));
    }
    return result;
  }, [allSongs, activeCategory, term]);
  const handleCategorySelect = (cat) => {
    setActiveCategory(cat);
  };
  const clearCategory = () => {
    setActiveCategory(null);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: activeCategory ? `Search within ${activeCategory.name}...` : "What do you want to play?", value: q, onChange: (e) => setQ(e.target.value), className: "pl-10 pr-10 h-11 rounded-full bg-card/90 border border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-sm shadow-xs placeholder:text-muted-foreground/80 transition-all", autoFocus: !activeCategory }),
      q && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", "aria-label": "Clear search", onClick: () => setQ(""), className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer", children: allSongsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
    ] }),
    activeCategory && !term && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-6 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg flex flex-col justify-between min-h-[160px]", style: {
        backgroundColor: activeCategory.color
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4 z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: clearCategory, className: "text-white hover:bg-white/20 -ml-2 gap-1.5 font-semibold text-xs rounded-full cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "All Categories" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Badge, { variant: "secondary", className: "bg-white/20 hover:bg-white/30 text-white border-0 font-bold text-xs uppercase tracking-wider", children: [
            filteredSongs.length,
            " Tracks"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between gap-4 mt-6 z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-5xl font-black tracking-tight drop-shadow-sm", children: activeCategory.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-white/80 text-sm mt-1 font-medium", children: [
              "Curated selection of ",
              activeCategory.name,
              " music in your Sonara library."
            ] })
          ] }),
          filteredSongs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", className: "h-14 w-14 rounded-full bg-white text-zinc-950 hover:bg-white/90 hover:scale-105 shadow-xl transition-all shrink-0 cursor-pointer", onClick: () => playQueue(filteredSongs, 0), title: `Play all ${activeCategory.name}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-6 w-6 fill-zinc-950 ml-0.5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-6 -right-6 w-36 h-36 sm:w-44 sm:h-44 rounded-2xl shadow-2xl rotate-[25deg] overflow-hidden opacity-90 border-2 border-white/20 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: activeCategory.coverUrl, alt: "", className: "h-full w-full object-cover" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold tracking-tight", children: [
          "Songs in ",
          activeCategory.name
        ] }),
        filteredSongs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12 text-muted-foreground bg-card/50 rounded-2xl border border-border/60", children: "No songs found in this category." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: filteredSongs.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          animationDelay: `${Math.min(i, 15) * 20}ms`
        }, className: "animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SongRow, { song: s, index: i, queue: filteredSongs }) }, s.id)) })
      ] })
    ] }),
    !activeCategory && !term && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black tracking-tight text-foreground", children: "Browse all" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4", children: SPOTIFY_CATEGORIES.map((cat, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleCategorySelect(cat), style: {
        backgroundColor: cat.color,
        animationDelay: `${i * 30}ms`
      }, className: "relative h-32 sm:h-36 md:h-40 rounded-xl overflow-hidden p-4 sm:p-5 text-left transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md cursor-pointer select-none group animate-fade-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg sm:text-xl md:text-2xl font-black text-white tracking-tight leading-tight block max-w-[65%] drop-shadow-sm", children: cat.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-2 -right-3 w-18 h-18 sm:w-22 sm:h-22 md:w-24 md:h-24 rounded-md shadow-2xl rotate-[24deg] translate-x-1 translate-y-1 overflow-hidden transition-transform duration-300 group-hover:rotate-[28deg] group-hover:scale-105 border border-white/10 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cat.coverUrl, alt: cat.name, className: "h-full w-full object-cover", loading: "lazy" }) })
      ] }, cat.id)) })
    ] }),
    term && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in", children: [
      playlists.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold mb-3 tracking-tight", children: "Playlists" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3", children: playlists.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/playlist/$id", params: {
          id: p.id
        }, style: {
          animationDelay: `${i * 30}ms`
        }, className: "block bg-card p-3 sm:p-4 rounded-xl border border-border/50 hover:bg-accent/60 hover:scale-[1.02] transition-all duration-200 animate-fade-in shadow-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center", children: p.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.cover_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-10 w-10 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm truncate text-foreground", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate mt-0.5", children: p.description || "Playlist" })
        ] }, p.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold tracking-tight", children: "Songs" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground font-semibold", children: [
            filteredSongs.length,
            " results"
          ] })
        ] }),
        allSongsLoading && filteredSongs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(SongTableSkeleton, { rows: 8 }) : filteredSongs.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground text-sm py-12 text-center bg-card/40 rounded-2xl border border-border/60", children: `No songs match "${term}"` }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: filteredSongs.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          animationDelay: `${Math.min(i, 15) * 20}ms`
        }, className: "animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SongRow, { song: s, index: i, queue: filteredSongs }) }, s.id)) })
      ] })
    ] })
  ] });
}
export {
  SearchPage as component
};
