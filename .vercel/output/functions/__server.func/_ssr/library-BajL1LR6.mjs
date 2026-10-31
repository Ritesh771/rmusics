import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { z as useAuth, L as LibrarySkeleton, I as Input } from "./router-SYh-4Vc5.mjs";
import "../_libs/sonner.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { S as Search, H as Heart, y as Music } from "../_libs/lucide-react.mjs";
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
import "./song-utils-CWgDAApr.mjs";
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "../_libs/radix-ui__react-slider.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/zustand.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
function LibraryPage() {
  const {
    user
  } = useAuth();
  const [q, setQ] = reactExports.useState("");
  const {
    data: playlists = [],
    isLoading: playlistsLoading
  } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("playlists").select("*, playlist_songs(position, songs(thumbnail_url))").eq("user_id", user.id).order("updated_at", {
        ascending: false
      });
      return data ?? [];
    },
    enabled: !!user,
    staleTime: 1e3 * 30
  });
  const {
    data: featured = []
  } = useQuery({
    queryKey: ["playlists", "featured"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("playlists").select("*, playlist_songs(position, songs(thumbnail_url))").eq("is_featured", true).order("created_at", {
        ascending: true
      });
      return data ?? [];
    },
    staleTime: 1e3 * 60
  });
  const term = q.trim().toLowerCase();
  const merged = reactExports.useMemo(() => {
    const seen = /* @__PURE__ */ new Set();
    const out = [];
    for (const p of featured) if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
    for (const p of playlists) if (!seen.has(p.id)) {
      seen.add(p.id);
      out.push(p);
    }
    return out;
  }, [featured, playlists]);
  const filtered = reactExports.useMemo(() => {
    if (!term) return merged;
    return merged.filter((p) => (p.name || "").toLowerCase().includes(term) || (p.description || "").toLowerCase().includes(term));
  }, [merged, term]);
  const showLiked = !term || "liked songs".includes(term);
  if (playlistsLoading && playlists.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LibrarySkeleton, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold", children: "Your Library" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-72", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Search in Your Library", value: q, onChange: (e) => setQ(e.target.value), className: "pl-9 bg-card border-border" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3", children: [
      showLiked && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/liked", className: "block bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200 animate-fade-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square rounded mb-3 bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-12 w-12 fill-white text-white" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Liked Songs" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Playlist" })
      ] }),
      filtered.map((p) => {
        const firstSongThumb = p.playlist_songs?.find((ps) => ps?.songs?.thumbnail_url)?.songs?.thumbnail_url;
        const cover = p.cover_url || firstSongThumb;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/playlist/$id", params: {
          id: p.id
        }, className: "block bg-card p-4 rounded-md hover:bg-accent hover:scale-[1.02] transition-all duration-200 animate-fade-in group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square bg-muted rounded mb-3 overflow-hidden flex items-center justify-center", children: cover ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: cover, alt: p.name, className: "h-full w-full object-cover group-hover:scale-105 transition-transform", loading: "eager", onError: (e) => {
            e.target.style.display = "none";
          } }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-10 w-10 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: p.description || "Playlist" })
        ] }, p.id);
      }),
      term && filtered.length === 0 && !showLiked && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full text-sm text-muted-foreground", children: [
        'No playlists match "',
        q,
        '"'
      ] })
    ] })
  ] });
}
export {
  LibraryPage as component
};
