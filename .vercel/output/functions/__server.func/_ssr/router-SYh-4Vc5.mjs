import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, b as useQueryClient, a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { b as createRouter, a as createRootRouteWithContext, d as useRouter, L as Link, H as HeadContent, S as Scripts, c as createFileRoute, l as lazyRouteComponent, e as useRouterState, O as Outlet, u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { S as Slot } from "../_libs/radix-ui__react-slot.mjs";
import { c as cva } from "../_libs/class-variance-authority.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { c as Root2, T as Trigger, P as Portal2, a as Content2, I as Item2, L as Label2, S as Separator2, f as SubTrigger2, e as SubContent2, C as CheckboxItem2, b as ItemIndicator2, R as RadioItem2, d as Sub2 } from "../_libs/radix-ui__react-dropdown-menu.mjs";
import { R as Root$2, I as Image$1, F as Fallback } from "../_libs/radix-ui__react-avatar.mjs";
import { R as Root$3, T as Thumb$1 } from "../_libs/radix-ui__react-switch.mjs";
import { c as cleanSongTitle } from "./song-utils-CWgDAApr.mjs";
import { R as Root, P as Portal, a as Content, C as Close, T as Title, O as Overlay, D as Description } from "../_libs/radix-ui__react-dialog.mjs";
import { T as Toaster$1, t as toast } from "../_libs/sonner.mjs";
import { e as useSensors, d as useSensor, D as DndContext, c as closestCenter, P as PointerSensor } from "../_libs/dnd-kit__core.mjs";
import { S as SortableContext, v as verticalListSortingStrategy, u as useSortable } from "../_libs/dnd-kit__sortable.mjs";
import { C as CSS } from "../_libs/dnd-kit__utilities.mjs";
import { a as Root$1, b as Track, R as Range, T as Thumb } from "../_libs/radix-ui__react-slider.mjs";
import { n as House, S as Search, o as Library, H as Heart, a6 as X, h as Clock, T as Settings, N as Plus, y as Music, V as Shield, K as Play, q as ListMusic, I as Pause, W as Shuffle, X as SkipBack, Y as SkipForward, O as Repeat1, R as Repeat, a5 as VolumeX, a3 as Volume1, a4 as Volume2, B as PanelRight, w as Minimize2, v as Maximize2, P as Palette, x as Moon, _ as Sun, Z as Smartphone, u as LogOut, U as Share2, c as ChevronDown, G as GripVertical, $ as Trash2, d as ChevronRight, C as Check, e as Circle } from "../_libs/lucide-react.mjs";
import { c as create } from "../_libs/zustand.mjs";
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
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
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
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/radix-ui__number.mjs";
const appCss = "/assets/styles-BaAqmr16.css";
const useAuthStore = create((set) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  setSession: (session) => set({
    user: session?.user ?? null,
    session: session ?? null,
    loading: false,
    initialized: true
  })
}));
if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
  });
  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });
}
function useAuth() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  return { user, loading };
}
function getDisplayName(user) {
  if (!user) return "";
  const md = user.user_metadata || {};
  return md.full_name || md.name || (user.email ? user.email.split("@")[0] : "User");
}
function getAvatarUrl(user) {
  if (!user) return null;
  return user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
}
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
const Button = reactExports.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Comp, { className: cn(buttonVariants({ variant, size, className })), ref, ...props });
  }
);
Button.displayName = "Button";
let _lastPlayedId = null;
async function recordPlay(song) {
  if (!song || typeof window === "undefined") return;
  if (_lastPlayedId === song.id) return;
  _lastPlayedId = song.id;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("recently_played").insert({ song_id: song.id, user_id: user.id });
  } catch {
  }
}
function shuffleArr(arr, keepIndex) {
  const current2 = arr[keepIndex];
  const rest = arr.filter((_, i) => i !== keepIndex);
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  for (let i = 1; i < rest.length; i++) {
    const prev = rest[i - 1];
    if (!prev || rest[i].artist !== prev.artist) continue;
    let swap = -1;
    for (let j = i + 1; j < Math.min(rest.length, i + 6); j++) {
      if (rest[j].artist !== prev.artist) {
        swap = j;
        break;
      }
    }
    if (swap !== -1) [rest[i], rest[swap]] = [rest[swap], rest[i]];
  }
  return [current2, ...rest];
}
const usePlayer = create((set, get) => ({
  queue: [],
  originalQueue: [],
  currentIndex: -1,
  isPlaying: false,
  volume: 0.8,
  muted: false,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: "off",
  sleepTimer: null,
  _seekTarget: null,
  nowPlayingOpen: false,
  queuePanelOpen: false,
  sidebarRightOpen: true,
  openNowPlaying: () => set({ nowPlayingOpen: true }),
  closeNowPlaying: () => set({ nowPlayingOpen: false }),
  toggleNowPlaying: () => set((s) => ({ nowPlayingOpen: !s.nowPlayingOpen })),
  openQueuePanel: () => set({ queuePanelOpen: true }),
  closeQueuePanel: () => set({ queuePanelOpen: false }),
  toggleQueuePanel: () => set((s) => ({ queuePanelOpen: !s.queuePanelOpen })),
  openSidebarRight: () => set({ sidebarRightOpen: true }),
  closeSidebarRight: () => set({ sidebarRightOpen: false }),
  toggleSidebarRight: () => set((s) => ({ sidebarRightOpen: !s.sidebarRightOpen })),
  currentSong: () => {
    const { queue, currentIndex } = get();
    return queue[currentIndex] ?? null;
  },
  playQueue: (songs, startIndex = 0) => {
    if (!songs.length) return;
    const { shuffle } = get();
    const q = shuffle ? shuffleArr(songs, startIndex) : songs;
    const idx = shuffle ? 0 : startIndex;
    set({ queue: q, originalQueue: songs, currentIndex: idx, isPlaying: true, progress: 0, duration: q[idx]?.duration ?? 0 });
    void recordPlay(q[idx]);
  },
  playSong: (song) => {
    set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0, duration: song.duration ?? 0 });
    void recordPlay(song);
  },
  togglePlay: () => {
    const { currentIndex } = get();
    if (currentIndex < 0) return;
    set((s) => ({ isPlaying: !s.isPlaying }));
  },
  next: () => {
    const { queue, currentIndex, repeat, shuffle } = get();
    if (!queue.length) return null;
    if (currentIndex + 1 >= queue.length) {
      if (repeat === "all") {
        if (shuffle && queue.length > 1) {
          const reshuffled = shuffleArr(queue, 0);
          set({ queue: reshuffled, currentIndex: 0, isPlaying: true, progress: 0, duration: reshuffled[0]?.duration ?? 0 });
          void recordPlay(reshuffled[0]);
          return reshuffled[0] ?? null;
        } else {
          set({ currentIndex: 0, isPlaying: true, progress: 0, duration: queue[0]?.duration ?? 0 });
          void recordPlay(queue[0]);
          return queue[0] ?? null;
        }
      } else {
        set({ isPlaying: false, progress: 0 });
        return null;
      }
    }
    const nextIndex = currentIndex + 1;
    set({ currentIndex: nextIndex, isPlaying: true, progress: 0, duration: queue[nextIndex]?.duration ?? 0 });
    void recordPlay(queue[nextIndex]);
    return queue[nextIndex] ?? null;
  },
  prev: () => {
    const { queue, currentIndex, progress, repeat } = get();
    if (!queue.length || currentIndex < 0) return null;
    if (progress > 3) {
      set({ _seekTarget: 0, progress: 0 });
      return queue[currentIndex] ?? null;
    }
    if (currentIndex <= 0) {
      if (repeat === "all" && queue.length > 1) {
        const last = queue.length - 1;
        set({ currentIndex: last, isPlaying: true, progress: 0, duration: queue[last]?.duration ?? 0 });
        void recordPlay(queue[last]);
        return queue[last] ?? null;
      }
      set({ _seekTarget: 0, progress: 0 });
      return queue[0] ?? null;
    }
    const prevIndex = currentIndex - 1;
    set({ currentIndex: prevIndex, isPlaying: true, progress: 0, duration: queue[prevIndex]?.duration ?? 0 });
    void recordPlay(queue[prevIndex]);
    return queue[prevIndex] ?? null;
  },
  setVolume: (v) => set({ volume: v, muted: v === 0 }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  toggleShuffle: () => {
    const { shuffle, queue, originalQueue, currentIndex } = get();
    const next = !shuffle;
    if (!queue.length) {
      set({ shuffle: next });
      return;
    }
    if (next) {
      const reshuffled = shuffleArr(queue, currentIndex);
      set({ shuffle: true, queue: reshuffled, currentIndex: 0 });
    } else {
      const cur = queue[currentIndex];
      const idx = originalQueue.findIndex((s) => s.id === cur?.id);
      set({ shuffle: false, queue: originalQueue, currentIndex: idx >= 0 ? idx : 0 });
    }
  },
  cycleRepeat: () => set((s) => ({
    repeat: s.repeat === "off" ? "all" : s.repeat === "all" ? "one" : "off"
  })),
  seek: (t) => set({ _seekTarget: t, progress: t }),
  clearSeek: () => set({ _seekTarget: null }),
  setSleepTimer: (minutes) => set({ sleepTimer: minutes == null ? null : Date.now() + minutes * 6e4 }),
  addToQueue: (song) => {
    const { queue, originalQueue, currentIndex } = get();
    if (!queue.length) {
      set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0, duration: song.duration ?? 0 });
      return;
    }
    const insertAt = Math.max(currentIndex + 1, 0);
    const nq = [...queue];
    nq.splice(insertAt, 0, song);
    const noq = [...originalQueue];
    noq.splice(insertAt, 0, song);
    set({ queue: nq, originalQueue: noq });
  },
  playNext: (song) => {
    const { queue, originalQueue, currentIndex } = get();
    if (!queue.length) {
      set({ queue: [song], originalQueue: [song], currentIndex: 0, isPlaying: true, progress: 0, duration: song.duration ?? 0 });
      return;
    }
    const insertAt = currentIndex + 1;
    const nq = [...queue];
    nq.splice(insertAt, 0, song);
    const noq = [...originalQueue];
    noq.splice(insertAt, 0, song);
    set({ queue: nq, originalQueue: noq });
  },
  removeFromQueue: (index) => {
    const { queue, currentIndex } = get();
    if (index < 0 || index >= queue.length) return;
    const nq = queue.filter((_, i) => i !== index);
    let nci = currentIndex;
    if (index < currentIndex) nci = currentIndex - 1;
    else if (index === currentIndex) {
      if (nci >= nq.length) {
        set({ queue: nq, currentIndex: -1, isPlaying: false, progress: 0 });
        return;
      }
    }
    set({ queue: nq, currentIndex: nci, progress: index === currentIndex ? 0 : get().progress });
  },
  reorderQueue: (from, to) => {
    const { queue, currentIndex } = get();
    if (from === to || from < 0 || to < 0 || from >= queue.length || to >= queue.length) return;
    const nq = [...queue];
    const [moved] = nq.splice(from, 1);
    nq.splice(to, 0, moved);
    let nci = currentIndex;
    if (from === currentIndex) nci = to;
    else if (from < currentIndex && to >= currentIndex) nci = currentIndex - 1;
    else if (from > currentIndex && to <= currentIndex) nci = currentIndex + 1;
    set({ queue: nq, currentIndex: nci });
  },
  hydrate: (state) => set(state)
}));
function SpotifyIcon({ className = "h-5 w-5" }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.305a.75.75 0 01-1.03.248c-2.822-1.724-6.375-2.114-10.558-1.159a.75.75 0 01-.334-1.462c4.58-1.045 8.514-.603 11.674 1.343a.75.75 0 01.248 1.03zm1.468-3.264a.938.938 0 01-1.288.309c-3.23-1.986-8.156-2.56-11.977-1.4a.938.938 0 01-.55-1.794c4.372-1.328 9.807-.684 13.506 1.597a.938.938 0 01.309 1.288zm.126-3.41c-3.874-2.3-10.264-2.512-13.978-1.385a1.125 1.125 0 11-.652-2.154c4.266-1.295 11.316-1.049 15.794 1.609a1.125 1.125 0 11-1.164 1.93z" }) });
}
function Sidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const qc = useQueryClient();
  const { user } = useAuth();
  const closeNowPlaying2 = usePlayer((s) => s.closeNowPlaying);
  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      let q = supabase.from("playlists").select("*, playlist_songs(position, songs(thumbnail_url))").order("updated_at", { ascending: false });
      if (user?.id) {
        q = q.or(`user_id.eq.${user.id},is_public.eq.true`);
      } else {
        q = q.eq("is_public", true);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1e3 * 30,
    refetchOnWindowFocus: true
  });
  const createPlaylist = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("playlists").insert({ name: `My Playlist #${playlists.length + 1}`, user_id: user.id }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["playlists"] })
  });
  const navItems = [
    { to: "/", icon: House, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
    { to: "/history", icon: Clock, label: "Recently played" },
    { to: "/import", icon: SpotifyIcon, label: "Import from Spotify" },
    { to: "/settings", icon: Settings, label: "Settings" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden md:flex flex-col w-64 lg:w-72 shrink-0 gap-2 h-full pb-24 select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-3 shadow-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex flex-col gap-1", children: navItems.map((item) => {
      const active = pathname === item.to;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: item.to,
          onClick: () => closeNowPlaying2(),
          className: cn(
            "flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer",
            active ? "bg-accent text-primary shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-5 w-5 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: item.label })
          ]
        },
        item.to
      );
    }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl p-3 flex-1 flex flex-col min-h-0 shadow-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-2 py-1.5 mb-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-bold text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Library, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Your Library" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-7 w-7 rounded-full hover:bg-accent cursor-pointer",
            onClick: () => createPlaylist.mutate(),
            title: "Create playlist",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/liked",
          onClick: () => closeNowPlaying2(),
          className: cn(
            "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all cursor-pointer mb-1",
            pathname === "/liked" ? "bg-accent text-primary font-semibold" : "hover:bg-accent/50"
          ),
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-lg bg-gradient-to-br from-purple-500 to-primary flex items-center justify-center shrink-0 shadow-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 fill-white text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground truncate", children: "Liked Songs" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Playlist • Auto" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto space-y-0.5 pr-1", children: playlists.map((p) => {
        const active = pathname === `/playlist/${p.id}`;
        const firstSongThumb = p.playlist_songs?.find((ps) => ps?.songs?.thumbnail_url)?.songs?.thumbnail_url;
        const cover = p.cover_url || firstSongThumb;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/playlist/$id",
            params: { id: p.id },
            onClick: () => closeNowPlaying2(),
            className: cn(
              "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-all cursor-pointer group",
              active ? "bg-accent text-primary font-semibold" : "hover:bg-accent/50"
            ),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50", children: cover ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: cover,
                  alt: "",
                  className: "h-full w-full object-cover group-hover:scale-105 transition-transform",
                  loading: "eager",
                  onError: (e) => {
                    e.target.style.display = "none";
                  }
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-5 w-5 text-muted-foreground" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "truncate min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate text-foreground", children: p.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Playlist" })
              ] })
            ]
          },
          p.id
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/admin",
          onClick: () => closeNowPlaying2(),
          className: "flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground border-t border-border/60 mt-2 pt-2.5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-3.5 w-3.5" }),
            " Admin Panel"
          ]
        }
      )
    ] })
  ] });
}
const Input = reactExports.forwardRef(
  ({ className, type, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        type,
        className: cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Input.displayName = "Input";
const DropdownMenu = Root2;
const DropdownMenuTrigger = Trigger;
const DropdownMenuSub = Sub2;
const DropdownMenuSubTrigger = reactExports.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  SubTrigger2,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = SubTrigger2.displayName;
const DropdownMenuSubContent = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  SubContent2,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = SubContent2.displayName;
const DropdownMenuContent = reactExports.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(Portal2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
  Content2,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = Content2.displayName;
const DropdownMenuItem = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Item2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = Item2.displayName;
const DropdownMenuCheckboxItem = reactExports.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  CheckboxItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = CheckboxItem2.displayName;
const DropdownMenuRadioItem = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  RadioItem2,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ItemIndicator2, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = RadioItem2.displayName;
const DropdownMenuLabel = reactExports.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Label2,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = Label2.displayName;
const DropdownMenuSeparator = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Separator2,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = Separator2.displayName;
const Avatar = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root$2,
  {
    ref,
    className: cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className),
    ...props
  }
));
Avatar.displayName = Root$2.displayName;
const AvatarImage = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Image$1,
  {
    ref,
    className: cn("aspect-square h-full w-full", className),
    ...props
  }
));
AvatarImage.displayName = Image$1.displayName;
const AvatarFallback = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Fallback,
  {
    ref,
    className: cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    ),
    ...props
  }
));
AvatarFallback.displayName = Fallback.displayName;
const initial$2 = (() => {
  if (typeof window === "undefined") return true;
  const v = window.localStorage.getItem("mood-enabled");
  return v == null ? true : v === "1";
})();
const useMood = create((set) => ({
  enabled: initial$2,
  color: "139,92,246",
  // default violet
  palette: ["139,92,246", "59,130,246", "236,72,153", "16,185,129"],
  setColor: (c) => set({ color: c }),
  setPalette: (p) => set({ palette: p, color: p[0] ?? "139,92,246" }),
  toggle: () => set((s) => {
    const next = !s.enabled;
    if (typeof window !== "undefined")
      window.localStorage.setItem("mood-enabled", next ? "1" : "0");
    return { enabled: next };
  }),
  setEnabled: (v) => {
    if (typeof window !== "undefined")
      window.localStorage.setItem("mood-enabled", v ? "1" : "0");
    set({ enabled: v });
  }
}));
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Root$3,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Thumb$1,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Root$3.displayName;
const STORAGE_KEY$2 = "rmusics.theme";
function readStored() {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY$2);
  if (v === "light" || v === "dark") return v;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}
let current = "dark";
const listeners = /* @__PURE__ */ new Set();
function apply(theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#000000" : "#ffffff");
  const apple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (apple) apple.setAttribute("content", theme === "dark" ? "black-translucent" : "default");
}
function setTheme(theme) {
  current = theme;
  try {
    window.localStorage.setItem(STORAGE_KEY$2, theme);
  } catch {
  }
  apply(theme);
  listeners.forEach((l) => l());
}
function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark");
}
function subscribe(cb) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function useTheme() {
  const theme = reactExports.useSyncExternalStore(subscribe, () => current, () => "dark");
  reactExports.useEffect(() => {
    const stored = readStored();
    if (stored !== current) setTheme(stored);
    else apply(stored);
  }, []);
  return theme;
}
const initial$1 = (() => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("shake-volume") === "1";
})();
function persist(v) {
  if (typeof window !== "undefined")
    window.localStorage.setItem("shake-volume", v ? "1" : "0");
}
const useShake = create((set, get) => ({
  enabled: initial$1,
  supported: typeof window !== "undefined" && "DeviceMotionEvent" in window,
  needsPermission: typeof window !== "undefined" && typeof window.DeviceMotionEvent?.requestPermission === "function",
  setSupported: (v) => set({ supported: v }),
  setEnabled: (v) => {
    persist(v);
    set({ enabled: v });
  },
  toggle: async () => {
    const next = !get().enabled;
    if (next && get().needsPermission) {
      try {
        const res = await window.DeviceMotionEvent.requestPermission();
        if (res !== "granted") return;
      } catch {
        return;
      }
    }
    persist(next);
    set({ enabled: next });
  }
}));
function ProfileMenu() {
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { enabled: moodOn, toggle: toggleMood } = useMood();
  const theme = useTheme();
  const isDark = theme === "dark";
  const shakeOn = useShake((s) => s.enabled);
  const shakeSupported = useShake((s) => s.supported);
  const toggleShake = useShake((s) => s.toggle);
  if (!user) return null;
  const name = getDisplayName(user);
  const avatar = getAvatarUrl(user);
  const initial2 = (name[0] || "U").toUpperCase();
  const logout = async () => {
    await supabase.auth.signOut();
    qc.clear();
    nav({ to: "/login" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "rounded-full h-9 w-9 p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-9 w-9", children: [
      avatar && /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: avatar, alt: name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-primary text-primary-foreground text-sm", children: initial2 })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-56", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuLabel, { className: "flex flex-col gap-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold truncate", children: name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-normal text-muted-foreground truncate", children: user.email })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          onSelect: (e) => {
            e.preventDefault();
            toggleMood();
          },
          className: "flex items-center justify-between gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: cn("h-4 w-4 mr-2 transition-colors", moodOn ? "text-primary" : "text-muted-foreground") }),
              "Mood lights"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: moodOn, onCheckedChange: () => toggleMood(), onClick: (e) => e.stopPropagation() })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          onSelect: (e) => {
            e.preventDefault();
            toggleTheme();
          },
          className: "flex items-center justify-between gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
              isDark ? /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "h-4 w-4 mr-2 text-primary transition-colors" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "h-4 w-4 mr-2 text-primary transition-colors" }),
              isDark ? "Dark mode" : "Light mode"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: isDark, onCheckedChange: () => toggleTheme(), onClick: (e) => e.stopPropagation() })
          ]
        }
      ),
      shakeSupported && /* @__PURE__ */ jsxRuntimeExports.jsxs(
        DropdownMenuItem,
        {
          onSelect: (e) => {
            e.preventDefault();
            void toggleShake();
          },
          className: "flex items-center justify-between gap-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: cn("h-4 w-4 mr-2 transition-colors", shakeOn ? "text-primary" : "text-muted-foreground") }),
              "Shake for volume"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: shakeOn, onCheckedChange: () => void toggleShake(), onClick: (e) => e.stopPropagation() })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/settings", onClick: () => closeNowPlaying(), className: "cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "h-4 w-4 mr-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Settings" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: logout, className: "text-destructive focus:text-destructive", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4 w-4 mr-2" }),
        "Log out"
      ] })
    ] })
  ] });
}
function TopNavbar() {
  const nav = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const [query, setQuery] = reactExports.useState("");
  const closeNowPlaying2 = usePlayer((s) => s.closeNowPlaying);
  reactExports.useEffect(() => {
    if (!pathname.startsWith("/search")) {
      setQuery("");
    }
  }, [pathname]);
  const handleSearchChange = (val) => {
    setQuery(val);
    if (pathname !== "/search") {
      nav({ to: "/search" });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "h-16 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 bg-background/60 backdrop-blur-md z-30 select-none", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", onClick: () => closeNowPlaying2(), className: "flex items-center gap-2.5 group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "/sonara-icon.png",
          alt: "Sonara",
          className: "h-9 w-9 rounded-full object-contain shadow-md shadow-fuchsia-500/20 group-hover:scale-105 transition-transform"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden sm:flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-lg tracking-tight text-foreground leading-none", children: "Sonara" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-semibold text-primary tracking-wider uppercase hidden xl:block mt-0.5", children: "Music Beyond Boundaries" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 max-w-md md:max-w-xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: query,
          onChange: (e) => handleSearchChange(e.target.value),
          onFocus: () => {
            closeNowPlaying2();
            if (pathname !== "/search") nav({ to: "/search" });
          },
          placeholder: "What do you want to play?",
          className: "h-11 pl-10 pr-9 rounded-full bg-card/90 border border-border/80 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary text-sm shadow-xs placeholder:text-muted-foreground/80 transition-all"
        }
      ),
      query && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setQuery(""),
          className: "absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full hover:bg-accent cursor-pointer",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileMenu, {}) })
  ] });
}
function NowPlayingSidebar() {
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const nextSong = usePlayer((s) => s.queue[s.currentIndex + 1] ?? null);
  const open = usePlayer((s) => s.sidebarRightOpen);
  const close = usePlayer((s) => s.closeSidebarRight);
  const next = usePlayer((s) => s.next);
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: liked = [] } = useQuery({
    queryKey: ["liked", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id");
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!user,
    staleTime: 1e3 * 60 * 10
  });
  const isLiked = song ? liked.includes(song.id) : false;
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!song || !user) return;
      if (isLiked) {
        await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      } else {
        await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] })
  });
  if (!open || !song || nowPlayingOpen) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden xl:flex flex-col w-80 2xl:w-88 shrink-0 bg-card/90 backdrop-blur-xl border border-border/70 rounded-2xl m-2 ml-0 overflow-y-auto pb-24 shadow-sm animate-in slide-in-from-right-4 duration-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3.5 border-b border-border/50 sticky top-0 bg-card/95 backdrop-blur-md z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 pr-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-muted-foreground uppercase tracking-wider block", children: "Now Playing" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold truncate block text-foreground", children: song.album || song.artist })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "icon",
          variant: "ghost",
          className: "h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/60 shrink-0 cursor-pointer",
          onClick: close,
          title: "Close now playing panel",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square w-full rounded-2xl overflow-hidden bg-muted shadow-md border border-border/60 relative group", children: song.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: song.thumbnail_url,
          alt: song.title,
          className: "h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-16 w-16 text-muted-foreground/40" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold text-xl text-foreground truncate tracking-tight", children: cleanSongTitle(song.title) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-muted-foreground truncate mt-0.5", children: song.artist })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-9 w-9 rounded-full text-foreground hover:bg-accent/60 shrink-0 cursor-pointer",
            onClick: () => toggleLike.mutate(),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: cn("h-5 w-5 transition-colors", isLiked ? "fill-primary text-primary" : "text-muted-foreground") })
          }
        )
      ] }),
      nextSong && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border/60 rounded-xl p-3.5 space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Next In Queue" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/50", children: nextSong.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: nextSong.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-4 w-4 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate text-foreground", children: cleanSongTitle(nextSong.title) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: nextSong.artist })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "h-8 w-8 rounded-full text-foreground hover:bg-accent/80 shrink-0 cursor-pointer",
              onClick: () => next(),
              title: "Skip to next",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 fill-current ml-0.5" })
            }
          )
        ] })
      ] })
    ] })
  ] });
}
const Dialog = Root;
const DialogPortal = Portal;
const DialogOverlay = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = Overlay.displayName;
const DialogContent = reactExports.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(
    Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = Title.displayName;
const DialogDescription = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = Description.displayName;
function streamUrl(raw) {
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) return raw;
  return `/api/stream?u=${encodeURIComponent(raw)}`;
}
const paletteCache = /* @__PURE__ */ new Map();
async function extractPalette(url) {
  const cachedPalette = paletteCache.get(url);
  if (cachedPalette) return cachedPalette;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 40;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);
        const buckets = /* @__PURE__ */ new Map();
        for (let i = 0; i < data.length; i += 4) {
          const rr = data[i], gg = data[i + 1], bb = data[i + 2];
          const max = Math.max(rr, gg, bb);
          const min = Math.min(rr, gg, bb);
          if (max < 25 || min > 235) continue;
          const key = `${rr >> 5}-${gg >> 5}-${bb >> 5}`;
          const sat = max - min;
          const cur = buckets.get(key);
          if (cur) {
            cur.r += rr;
            cur.g += gg;
            cur.b += bb;
            cur.n += 1;
            cur.score += sat + 8;
          } else buckets.set(key, { r: rr, g: gg, b: bb, n: 1, score: sat + 8 });
        }
        const sorted = [...buckets.values()].sort((a, b) => b.score - a.score).slice(0, 4);
        if (!sorted.length) return resolve(["80,80,120", "100,80,140", "60,100,140"]);
        const palette = sorted.map((b) => `${Math.round(b.r / b.n)},${Math.round(b.g / b.n)},${Math.round(b.b / b.n)}`);
        paletteCache.set(url, palette);
        resolve(palette);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}
function MoodBackdrop({ intensity = 1 }) {
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const { enabled, palette, setPalette } = useMood();
  const lastUrl = reactExports.useRef(null);
  reactExports.useEffect(() => {
    const artworkUrl = song?.thumbnail_url;
    if (!artworkUrl || artworkUrl === lastUrl.current) return;
    lastUrl.current = artworkUrl;
    extractPalette(streamUrl(artworkUrl)).then((p) => {
      if (p && p.length && lastUrl.current === artworkUrl) setPalette(p);
    });
  }, [song?.thumbnail_url, setPalette]);
  if (!enabled) return null;
  const baseOpacity = (isPlaying ? 0.6 : 0.32) * intensity;
  const c = (i) => palette[i % palette.length] ?? palette[0] ?? "139,92,246";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      "aria-hidden": true,
      className: `pointer-events-none fixed inset-0 -z-0 overflow-hidden ${isPlaying ? "aurora-active" : ""}`,
      style: { transition: "opacity 600ms ease" },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "aurora-blob aurora-1",
            style: {
              background: `radial-gradient(circle at 30% 30%, rgba(${c(0)},${baseOpacity}) 0%, rgba(${c(0)},0) 65%)`
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "aurora-blob aurora-2",
            style: {
              background: `radial-gradient(circle at 60% 50%, rgba(${c(1)},${baseOpacity * 0.95}) 0%, rgba(${c(1)},0) 65%)`
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "aurora-blob aurora-3",
            style: {
              background: `radial-gradient(circle at 50% 50%, rgba(${c(2)},${baseOpacity * 0.85}) 0%, rgba(${c(2)},0) 65%)`
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "aurora-blob aurora-4",
            style: {
              background: `radial-gradient(circle at 50% 50%, rgba(${c(3)},${baseOpacity * 0.7}) 0%, rgba(${c(3)},0) 65%)`
            }
          }
        )
      ]
    }
  );
}
function NowPlaying() {
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const [mounted, setMounted] = reactExports.useState(false);
  const [closing, setClosing] = reactExports.useState(false);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const prevPath = reactExports.useRef(pathname);
  reactExports.useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      if (nowPlayingOpen) {
        usePlayer.getState().closeNowPlaying();
      }
    }
  }, [pathname, nowPlayingOpen]);
  reactExports.useEffect(() => {
    if (nowPlayingOpen && song) {
      setMounted(true);
      setClosing(false);
      return;
    }
    if (!mounted) return;
    setClosing(true);
    const id = window.setTimeout(() => {
      setMounted(false);
      setClosing(false);
    }, 200);
    return () => window.clearTimeout(id);
  }, [mounted, nowPlayingOpen, song]);
  const shouldRender = mounted || nowPlayingOpen && song && !closing;
  if (!shouldRender || !song) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NowPlayingContent, { song, closing });
}
function NowPlayingContent({ song, closing }) {
  const closeNowPlaying2 = usePlayer((s) => s.closeNowPlaying);
  const queue = usePlayer((s) => s.queue);
  const currentIndex = usePlayer((s) => s.currentIndex);
  const next = usePlayer((s) => s.next);
  const toggleQueuePanel = usePlayer((s) => s.toggleQueuePanel);
  const [showCreditsModal, setShowCreditsModal] = reactExports.useState(false);
  const qc = useQueryClient();
  const { user } = useAuth();
  const nextSong = queue[currentIndex + 1] ?? null;
  reactExports.useEffect(() => {
    if (closing) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeNowPlaying2();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [closing, closeNowPlaying2]);
  const { data: liked = [] } = useQuery({
    queryKey: ["liked", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id");
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!user
  });
  const isLiked = liked.includes(song.id);
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (isLiked) {
        await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      } else {
        await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] })
  });
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Song link copied to clipboard");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "fixed inset-0 pb-20 md:pb-24 z-30 bg-background/95 md:bg-background/98 text-foreground flex flex-col overflow-y-auto backdrop-blur-2xl transition-all duration-300 select-none",
        closing ? "opacity-0 translate-y-4 scale-[0.99] pointer-events-none ease-in" : "opacity-100 translate-y-0 scale-100 ease-out animate-in fade-in zoom-in-95"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MoodBackdrop, { intensity: 0.85 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex items-center justify-between px-6 py-4 shrink-0 border-b border-border/40 bg-background/30 backdrop-blur-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 pr-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] uppercase tracking-widest text-muted-foreground font-bold", children: "Playing from" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold truncate text-foreground", children: song.album || "Library Tracks" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                className: "text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full h-9 w-9 cursor-pointer",
                onClick: handleShare,
                title: "Share track",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                className: "text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full h-9 w-9 cursor-pointer",
                onClick: toggleQueuePanel,
                title: "Queue",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListMusic, { className: "h-4 w-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                className: "text-foreground hover:bg-accent/60 rounded-full h-9 w-9 cursor-pointer",
                onClick: closeNowPlaying2,
                title: "Collapse view",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-5 w-5" })
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 min-h-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-2xl flex flex-col items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-72 h-72 sm:w-88 sm:h-88 md:w-[380px] md:h-[380px] lg:w-[400px] lg:h-[400px] rounded-2xl md:rounded-3xl overflow-hidden bg-muted/60 shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-border/60 flex items-center justify-center transition-transform duration-500 hover:scale-[1.01] group relative", children: song.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: song.thumbnail_url,
              alt: song.title,
              draggable: false,
              className: "h-full w-full object-cover transition-transform duration-700 ease-out"
            },
            song.id
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-28 w-28 text-muted-foreground/30" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full flex items-center justify-between gap-4 mt-6 px-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl sm:text-3xl font-black tracking-tight text-foreground truncate", children: cleanSongTitle(song.title) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm sm:text-base font-medium text-muted-foreground truncate mt-1", children: song.artist })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "icon",
                variant: "ghost",
                className: "text-foreground hover:bg-accent/60 rounded-full h-10 w-10 shrink-0 cursor-pointer",
                onClick: () => toggleLike.mutate(),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Heart,
                  {
                    className: cn(
                      "h-6 w-6 transition-colors",
                      isLiked ? "fill-primary text-primary" : "text-muted-foreground"
                    )
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/70 border border-border/70 rounded-2xl p-4 backdrop-blur-md shadow-xs flex flex-col justify-between space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-foreground", children: "Credits" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setShowCreditsModal(true),
                    className: "text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline cursor-pointer",
                    children: "Show all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground truncate", children: song.artist }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "Main Artist • Performer" })
              ] }),
              song.album && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground/80 truncate pt-1 border-t border-border/40", children: [
                "Album: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium", children: song.album })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/70 border border-border/70 rounded-2xl p-4 backdrop-blur-md shadow-xs flex flex-col justify-between space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-foreground", children: "Next in queue" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: toggleQueuePanel,
                    className: "text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline cursor-pointer",
                    children: "Open queue"
                  }
                )
              ] }),
              nextSong ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-lg bg-muted shrink-0 overflow-hidden border border-border/50", children: nextSong.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: nextSong.thumbnail_url,
                    alt: "",
                    className: "h-full w-full object-cover"
                  }
                ) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-4 w-4 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate text-foreground", children: cleanSongTitle(nextSong.title) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: nextSong.artist })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "h-8 w-8 rounded-full text-foreground hover:bg-accent/80 shrink-0 cursor-pointer",
                    onClick: () => next(),
                    title: "Skip to next",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 fill-current ml-0.5" })
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground py-2", children: "No more tracks queued up." })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: showCreditsModal, onOpenChange: setShowCreditsModal, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl font-bold tracking-tight", children: "Credits" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Song Title" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-bold text-foreground mt-0.5", children: cleanSongTitle(song.title) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Main Artist / Performer" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-medium text-foreground mt-0.5", children: song.artist })
            ] }),
            song.album && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Album" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground mt-0.5", children: song.album })
            ] }),
            song.genre && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Genre" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-foreground mt-0.5", children: song.genre })
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
function QueuePanel() {
  const {
    queuePanelOpen,
    closeQueuePanel,
    queue,
    currentIndex,
    removeFromQueue,
    reorderQueue
  } = usePlayer();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  if (!queuePanelOpen) return null;
  const current2 = queue[currentIndex];
  const upNext = queue.slice(currentIndex + 1);
  const onDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = Number(active.id);
    const to = Number(over.id);
    reorderQueue(from, to);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "fixed z-[90] bg-card/95 text-card-foreground backdrop-blur-xl border border-border/80 shadow-2xl flex flex-col\n                 inset-x-2 bottom-36 top-20 rounded-xl animate-in slide-in-from-bottom-4 fade-in duration-200\n                 md:inset-auto md:right-3 md:bottom-24 md:top-20 md:w-96 md:slide-in-from-right-4",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-4 py-3.5 border-b border-border/60 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-extrabold text-lg text-foreground tracking-tight", children: "Queue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground font-medium", children: [
              queue.length,
              " track",
              queue.length === 1 ? "" : "s"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/60 rounded-full", onClick: closeQueuePanel, children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-3 space-y-4", children: [
          current2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase font-semibold mb-2 px-1", children: "Now playing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { song: current2, highlight: true, onJump: () => {
            } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground uppercase font-semibold mb-2 px-1", children: "Next up" }),
            upNext.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground px-1", children: "Queue is empty" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(DndContext, { sensors, collisionDetection: closestCenter, onDragEnd, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              SortableContext,
              {
                items: upNext.map((_, i) => String(currentIndex + 1 + i)),
                strategy: verticalListSortingStrategy,
                children: upNext.map((s, i) => {
                  const absIdx = currentIndex + 1 + i;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SortableRow,
                    {
                      id: String(absIdx),
                      song: s,
                      onJump: () => usePlayer.setState({ currentIndex: absIdx, isPlaying: true, progress: 0, duration: s.duration ?? 0 }),
                      onRemove: () => removeFromQueue(absIdx)
                    },
                    s.id + absIdx
                  );
                })
              }
            ) })
          ] })
        ] })
      ]
    }
  );
}
function Row({ song, highlight, onJump }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick: onJump,
      className: cn(
        "w-full flex items-center gap-3 p-2.5 rounded-xl text-left hover:bg-accent/70 transition-all border border-transparent",
        highlight && "bg-primary/10 border-primary/25 shadow-xs"
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center border border-border/50", children: song.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: song.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-5 w-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("text-sm font-semibold truncate text-foreground", highlight && "text-primary font-bold"), children: cleanSongTitle(song.title) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate mt-0.5", children: song.artist })
        ] })
      ]
    }
  );
}
function SortableRow({
  id,
  song,
  onJump,
  onRemove
}) {
  const { attributes, listeners: listeners2, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: setNodeRef, style, className: "flex items-center gap-1 group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        ...attributes,
        ...listeners2,
        className: "touch-none cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground",
        "aria-label": "Drag",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { song, onJump }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-7 w-7 opacity-0 group-hover:opacity-100 shrink-0 text-muted-foreground hover:text-destructive", onClick: onRemove, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3.5 w-3.5" }) })
  ] });
}
const Slider = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Root$1,
  {
    ref,
    className: cn(
      "group relative flex w-full touch-none select-none items-center py-2",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Track, { className: "relative h-1 w-full grow overflow-hidden rounded-full bg-muted-foreground/20 transition-all duration-150 group-hover:h-[5px] group-active:h-[5px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Range, { className: "absolute h-full bg-primary transition-colors" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Thumb, { className: "block h-3.5 w-3.5 rounded-full bg-primary border-2 border-background shadow-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-active:opacity-100 focus-visible:opacity-100 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0 hover:scale-110 cursor-pointer" })
    ]
  }
));
Slider.displayName = Root$1.displayName;
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
const THRESHOLD = 22;
const COOLDOWN = 900;
const STEP = 0.1;
function useShakeVolume() {
  const enabled = useShake((s) => s.enabled);
  reactExports.useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    if (!("DeviceMotionEvent" in window)) return;
    let last = 0;
    const onMotion = (e) => {
      const a = e.accelerationIncludingGravity ?? e.acceleration;
      if (!a) return;
      const jolt = Math.sqrt((a.x ?? 0) ** 2 + (a.y ?? 0) ** 2 + (a.z ?? 0) ** 2);
      if (jolt - 9.81 < THRESHOLD - 9.81) return;
      const now = Date.now();
      if (now - last < COOLDOWN) return;
      last = now;
      const state = usePlayer.getState();
      const nextVol = state.volume >= 0.999 ? 0.5 : Math.min(1, state.volume + STEP);
      state.setVolume(nextVol);
      if (state.muted) usePlayer.setState({ muted: false });
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate?.(15);
        } catch {
        }
      }
      toast.success(`Volume ${Math.round(nextVol * 100)}%`, { duration: 900 });
    };
    window.addEventListener("devicemotion", onMotion);
    return () => window.removeEventListener("devicemotion", onMotion);
  }, [enabled]);
}
let lastSeekTick = 0;
function vibrate(pattern) {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
  }
}
function seekTouchHaptic() {
  vibrate(6);
}
function seekDragHaptic(value) {
  const tick = Math.floor(value / 5);
  if (tick === lastSeekTick) return;
  lastSeekTick = tick;
  vibrate(4);
}
function seekCommitHaptic() {
  vibrate(10);
}
const EQ_FREQUENCIES = [60, 150, 400, 1e3, 2400, 15e3];
const EQ_LABELS = ["60Hz", "150Hz", "400Hz", "1kHz", "2.4kHz", "15kHz"];
const EQ_PRESETS = {
  Flat: [0, 0, 0, 0, 0, 0],
  "Bass Booster": [6, 5, 2, 0, -1, -2],
  "Bass Reducer": [-6, -5, -2, 0, 1, 2],
  Rock: [5, 3, -1, 1, 3, 5],
  Pop: [-1, 2, 4, 3, 1, -1],
  "Hip-Hop": [6, 4, 0, 2, 1, 3],
  Electronic: [4, 3, 0, 2, 4, 5],
  Jazz: [3, 2, 1, 2, 1, 3],
  Classical: [4, 3, 2, 2, 3, 4],
  "Vocal Booster": [-2, -1, 3, 5, 3, 0],
  Acoustic: [3, 2, 1, 2, 3, 2],
  Deep: [5, 3, 1, 0, -2, -4],
  "Treble Booster": [-3, -2, 0, 2, 4, 6],
  "R&B": [4, 5, 2, -1, 2, 3]
};
let audioCtx = null;
let mediaSourceNode = null;
let biquadFilters = [];
let boundAudioEl = null;
function applyFilterGains(gains, enabled) {
  if (!biquadFilters.length || !audioCtx) return;
  const now = audioCtx.currentTime;
  biquadFilters.forEach((filter, idx) => {
    const targetGain = enabled ? gains[idx] ?? 0 : 0;
    try {
      filter.gain.setTargetAtTime(targetGain, now, 0.05);
    } catch {
      filter.gain.value = targetGain;
    }
  });
}
function attachEqualizerToAudio(audioElement) {
  if (typeof window === "undefined") return;
  if (boundAudioEl === audioElement && biquadFilters.length === 6) {
    const st = useEqualizer.getState();
    applyFilterGains(st.gains, st.enabled);
    return;
  }
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }
    if (!mediaSourceNode || boundAudioEl !== audioElement) {
      try {
        mediaSourceNode = audioCtx.createMediaElementSource(audioElement);
      } catch (err) {
        console.warn("[Equalizer] createMediaElementSource note:", err);
      }
    }
    if (mediaSourceNode && biquadFilters.length === 0) {
      biquadFilters = EQ_FREQUENCIES.map((freq, index) => {
        const filter = audioCtx.createBiquadFilter();
        if (index === 0) {
          filter.type = "lowshelf";
        } else if (index === EQ_FREQUENCIES.length - 1) {
          filter.type = "highshelf";
        } else {
          filter.type = "peaking";
          filter.Q.value = 1;
        }
        filter.frequency.value = freq;
        return filter;
      });
      let current2 = mediaSourceNode;
      for (const filter of biquadFilters) {
        current2.connect(filter);
        current2 = filter;
      }
      current2.connect(audioCtx.destination);
    }
    boundAudioEl = audioElement;
    const st = useEqualizer.getState();
    applyFilterGains(st.gains, st.enabled);
  } catch (err) {
    console.error("[Equalizer] Setup error:", err);
  }
}
function resumeAudioContext() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {
    });
  }
}
const STORAGE_KEY$1 = "sonara_eq_settings_v1";
function loadSavedSettings() {
  if (typeof window === "undefined") {
    return { enabled: true, preset: "Rock", gains: EQ_PRESETS.Rock };
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY$1);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.gains) && parsed.gains.length === 6) {
        return {
          enabled: parsed.enabled ?? true,
          preset: parsed.preset ?? "Rock",
          gains: parsed.gains
        };
      }
    }
  } catch {
  }
  return { enabled: true, preset: "Rock", gains: EQ_PRESETS.Rock };
}
const initial = loadSavedSettings();
const useEqualizer = create((set, get) => ({
  enabled: initial.enabled,
  preset: initial.preset,
  gains: initial.gains,
  setEnabled: (enabled) => {
    set({ enabled });
    applyFilterGains(get().gains, enabled);
    try {
      localStorage.setItem(STORAGE_KEY$1, JSON.stringify({ ...get(), enabled }));
    } catch {
    }
  },
  setPreset: (presetName) => {
    const presetGains = EQ_PRESETS[presetName] || EQ_PRESETS.Flat;
    set({ preset: presetName, gains: [...presetGains] });
    applyFilterGains(presetGains, get().enabled);
    try {
      localStorage.setItem(
        STORAGE_KEY$1,
        JSON.stringify({ ...get(), preset: presetName, gains: presetGains })
      );
    } catch {
    }
  },
  setGain: (bandIndex, gain) => {
    const newGains = [...get().gains];
    newGains[bandIndex] = Math.max(-12, Math.min(12, Math.round(gain * 10) / 10));
    let matchingPreset = "Custom";
    for (const [name, pGains] of Object.entries(EQ_PRESETS)) {
      if (pGains.every((g, i) => Math.abs(g - newGains[i]) < 0.1)) {
        matchingPreset = name;
        break;
      }
    }
    set({ gains: newGains, preset: matchingPreset });
    applyFilterGains(newGains, get().enabled);
    try {
      localStorage.setItem(
        STORAGE_KEY$1,
        JSON.stringify({ ...get(), gains: newGains, preset: matchingPreset })
      );
    } catch {
    }
  },
  setAllGains: (gains) => {
    set({ gains: [...gains] });
    applyFilterGains(gains, get().enabled);
    try {
      localStorage.setItem(STORAGE_KEY$1, JSON.stringify({ ...get(), gains }));
    } catch {
    }
  },
  resetToFlat: () => {
    const flat = EQ_PRESETS.Flat;
    set({ preset: "Flat", gains: [...flat] });
    applyFilterGains(flat, get().enabled);
    try {
      localStorage.setItem(
        STORAGE_KEY$1,
        JSON.stringify({ ...get(), preset: "Flat", gains: flat })
      );
    } catch {
    }
  }
}));
function Player() {
  const audioRef = reactExports.useRef(null);
  const lastProgressPush = reactExports.useRef(0);
  const pendingSeekRef = reactExports.useRef(null);
  const playRequestRef = reactExports.useRef(0);
  const suppressPauseUntil = reactExports.useRef(0);
  const errorRetryRef = reactExports.useRef(0);
  const completedSongRef = reactExports.useRef(null);
  const scrubbingRef = reactExports.useRef(false);
  const seekHoldRef = reactExports.useRef(null);
  const prefetchRef = reactExports.useRef(null);
  const prefetchedIdRef = reactExports.useRef(null);
  const playRetryRef = reactExports.useRef(null);
  const [scrubbing, setScrubbing] = reactExports.useState(false);
  const [scrubValue, setScrubValue] = reactExports.useState(0);
  const song = usePlayer((s) => s.queue[s.currentIndex] ?? null);
  const isPlaying = usePlayer((s) => s.isPlaying);
  const volume = usePlayer((s) => s.volume);
  const muted = usePlayer((s) => s.muted);
  const progress = usePlayer((s) => s.progress);
  const duration = usePlayer((s) => s.duration);
  const shuffle = usePlayer((s) => s.shuffle);
  const repeat = usePlayer((s) => s.repeat);
  const _seekTarget = usePlayer((s) => s._seekTarget);
  const sleepTimer = usePlayer((s) => s.sleepTimer);
  const togglePlay = usePlayer((s) => s.togglePlay);
  const next = usePlayer((s) => s.next);
  const prev = usePlayer((s) => s.prev);
  const setVolume = usePlayer((s) => s.setVolume);
  const toggleMute = usePlayer((s) => s.toggleMute);
  const setProgress = usePlayer((s) => s.setProgress);
  const setDuration = usePlayer((s) => s.setDuration);
  const toggleShuffle = usePlayer((s) => s.toggleShuffle);
  const cycleRepeat = usePlayer((s) => s.cycleRepeat);
  const seek = usePlayer((s) => s.seek);
  const clearSeek = usePlayer((s) => s.clearSeek);
  const setSleepTimer = usePlayer((s) => s.setSleepTimer);
  const openNowPlaying = usePlayer((s) => s.openNowPlaying);
  const nowPlayingOpen = usePlayer((s) => s.nowPlayingOpen);
  const toggleNowPlaying = usePlayer((s) => s.toggleNowPlaying);
  const toggleQueuePanel = usePlayer((s) => s.toggleQueuePanel);
  const sidebarRightOpen = usePlayer((s) => s.sidebarRightOpen);
  const toggleSidebarRight = usePlayer((s) => s.toggleSidebarRight);
  const qc = useQueryClient();
  const { user } = useAuth();
  useShakeVolume();
  const commitSeek = reactExports.useCallback(
    (time) => {
      const state = usePlayer.getState();
      const max = state.duration || Number.POSITIVE_INFINITY;
      const target = Math.max(0, Math.min(time, max));
      seekHoldRef.current = { target, until: performance.now() + 700 };
      seek(target);
    },
    [seek]
  );
  const seekAudio = reactExports.useCallback((audio, time) => {
    const target = Math.max(0, Number.isFinite(time) ? time : 0);
    const fastAudio = audio;
    if (typeof fastAudio.fastSeek === "function") {
      try {
        fastAudio.fastSeek(target);
        return;
      } catch {
      }
    }
    try {
      audio.currentTime = target;
    } catch {
      pendingSeekRef.current = target;
    }
  }, []);
  const ensurePlaying = reactExports.useCallback((attempt = 0) => {
    resumeAudioContext();
    if (playRetryRef.current) {
      clearTimeout(playRetryRef.current);
      playRetryRef.current = null;
    }
    const audio = audioRef.current;
    if (!audio) return;
    if (!usePlayer.getState().isPlaying) return;
    audio.autoplay = true;
    if (!audio.paused) return;
    audio.play().catch(() => void 0);
    if (attempt < 12) {
      playRetryRef.current = setTimeout(() => ensurePlaying(attempt + 1), 500);
    }
  }, []);
  const playAudioSong = reactExports.useCallback(
    (targetSong, seekTo = 0) => {
      const audio = audioRef.current;
      if (!audio || !targetSong) return;
      const requestId = ++playRequestRef.current;
      completedSongRef.current = null;
      audio.autoplay = true;
      if (audio.dataset.songId !== targetSong.id) {
        suppressPauseUntil.current = Date.now() + 15e3;
        audio.dataset.songId = targetSong.id;
        audio.src = streamUrl(targetSong.audio_url);
        audio.load();
      }
      pendingSeekRef.current = null;
      errorRetryRef.current = 0;
      seekAudio(audio, seekTo);
      audio.play().then(() => {
        if (requestId === playRequestRef.current) {
          usePlayer.setState({ isPlaying: true });
        }
      }).catch(() => {
        audio.autoplay = true;
      });
      usePlayer.setState({ isPlaying: true });
      ensurePlaying(0);
    },
    [seekAudio, ensurePlaying]
  );
  const advanceToNext = reactExports.useCallback(() => {
    const upcoming = next();
    if (upcoming) playAudioSong(upcoming, 0);
  }, [next, playAudioSong]);
  const completeCurrentSong = reactExports.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const state = usePlayer.getState();
    const currentSong = state.queue[state.currentIndex];
    if (!currentSong || completedSongRef.current === currentSong.id) return;
    completedSongRef.current = currentSong.id;
    if (state.repeat === "one") {
      completedSongRef.current = null;
      suppressPauseUntil.current = Date.now() + 5e3;
      seekAudio(audio, 0);
      usePlayer.setState({ progress: 0, isPlaying: true });
      audio.autoplay = true;
      audio.play().catch(() => void 0);
      return;
    }
    const upcoming = state.next();
    if (upcoming) {
      try {
        navigator.mediaSession.playbackState = "playing";
      } catch {
      }
      playAudioSong(upcoming, 0);
    }
  }, [playAudioSong, seekAudio]);
  const goToPrevious = reactExports.useCallback(() => {
    const previous = prev();
    if (previous) playAudioSong(previous, 0);
  }, [prev, playAudioSong]);
  const publishAudioTime = reactExports.useCallback((force = false) => {
    const audio = audioRef.current;
    if (!audio || scrubbingRef.current) return;
    const hold = seekHoldRef.current;
    if (hold) {
      if (Math.abs(audio.currentTime - hold.target) < 0.5 || performance.now() > hold.until) {
        seekHoldRef.current = null;
      } else {
        return;
      }
    }
    const now = performance.now();
    if (force || now - lastProgressPush.current > 120 || Math.abs(usePlayer.getState().progress - audio.currentTime) > 0.35) {
      lastProgressPush.current = now;
      setProgress(audio.currentTime);
    }
  }, [setProgress]);
  reactExports.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!song) {
      audio.autoplay = false;
      audio.pause();
      audio.removeAttribute("src");
      audio.dataset.songId = "";
      return;
    }
    if (audio.dataset.songId !== song.id) {
      if (isPlaying) suppressPauseUntil.current = Date.now() + 5e3;
      audio.dataset.songId = song.id;
      audio.src = streamUrl(song.audio_url);
      const resumeAt = Math.max(0, usePlayer.getState().progress || 0);
      pendingSeekRef.current = resumeAt;
      errorRetryRef.current = 0;
      audio.load();
      setDuration(song.duration ?? 0);
    }
    audio.autoplay = isPlaying;
    if (isPlaying) audio.play().catch(() => {
    });
    else audio.pause();
  }, [song?.id, song?.audio_url, isPlaying, setDuration]);
  reactExports.useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);
  reactExports.useEffect(() => {
    if (_seekTarget != null && audioRef.current) {
      const audio = audioRef.current;
      seekHoldRef.current = { target: _seekTarget, until: performance.now() + 700 };
      const readyForSeek = audio.readyState >= 1 && (!Number.isFinite(audio.duration) || audio.currentSrc);
      if (readyForSeek) {
        seekAudio(audio, _seekTarget);
      } else {
        pendingSeekRef.current = _seekTarget;
      }
      clearSeek();
    }
  }, [_seekTarget, clearSeek, seekAudio]);
  reactExports.useEffect(() => {
    if (!isPlaying) return;
    let raf = 0;
    const tick = () => {
      publishAudioTime();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, publishAudioTime]);
  reactExports.useEffect(() => {
    if (!sleepTimer) return;
    const id = setInterval(() => {
      if (Date.now() >= sleepTimer) {
        usePlayer.setState({ isPlaying: false, sleepTimer: null });
      }
    }, 1e3);
    return () => clearInterval(id);
  }, [sleepTimer]);
  reactExports.useEffect(() => {
    const id = setInterval(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const state = usePlayer.getState();
      const currentSong = state.queue[state.currentIndex];
      if (!currentSong) return;
      if (audio.dataset.songId !== currentSong.id) {
        suppressPauseUntil.current = Date.now() + 5e3;
        audio.dataset.songId = currentSong.id;
        audio.src = streamUrl(currentSong.audio_url);
        pendingSeekRef.current = Math.max(0, state.progress || 0);
        audio.load();
        if (state.isPlaying) audio.play().catch(() => {
        });
        return;
      }
      if (!scrubbingRef.current && !seekHoldRef.current && Math.abs(state.progress - audio.currentTime) > 0.5) {
        setProgress(audio.currentTime);
      }
      if (audio.ended) {
        completeCurrentSong();
        return;
      }
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (dur > 0 && audio.currentTime >= dur - 0.35 && audio.paused && state.isPlaying) {
        completeCurrentSong();
        return;
      }
      if (state.isPlaying && audio.paused && Date.now() > suppressPauseUntil.current) {
        ensurePlaying(0);
      }
    }, 1e3);
    return () => clearInterval(id);
  }, [completeCurrentSong, setProgress, ensurePlaying]);
  reactExports.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onEnded = () => completeCurrentSong();
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [completeCurrentSong]);
  reactExports.useEffect(() => {
    const upcomingIndex = usePlayer.getState().currentIndex + 1;
    const upcoming = usePlayer.getState().queue[upcomingIndex];
    if (!upcoming || prefetchedIdRef.current === upcoming.id) return;
    prefetchedIdRef.current = upcoming.id;
    let el = prefetchRef.current;
    if (!el) {
      el = document.createElement("audio");
      el.preload = "auto";
      el.muted = true;
      el.volume = 0;
      prefetchRef.current = el;
    }
    el.src = streamUrl(upcoming.audio_url);
    try {
      el.load();
    } catch {
    }
  }, [song?.id]);
  reactExports.useEffect(() => {
    if (typeof document === "undefined") return;
    const resync = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.visibilityState !== "visible") return;
      const state = usePlayer.getState();
      const currentSong = state.queue[state.currentIndex];
      if (!currentSong) return;
      if (audio.dataset.songId !== currentSong.id || !audio.currentSrc) {
        suppressPauseUntil.current = Date.now() + 5e3;
        audio.dataset.songId = currentSong.id;
        audio.src = streamUrl(currentSong.audio_url);
        pendingSeekRef.current = Math.max(0, state.progress || 0);
        audio.load();
        if (state.isPlaying) ensurePlaying(0);
        return;
      }
      const dur = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (audio.ended || dur > 0 && audio.currentTime >= dur - 0.3 && audio.paused) {
        completeCurrentSong();
        return;
      }
      if (!scrubbingRef.current && !seekHoldRef.current) setProgress(audio.currentTime);
      if (state.isPlaying && audio.paused) ensurePlaying(0);
    };
    document.addEventListener("visibilitychange", resync);
    window.addEventListener("focus", resync);
    window.addEventListener("pageshow", resync);
    return () => {
      document.removeEventListener("visibilitychange", resync);
      window.removeEventListener("focus", resync);
      window.removeEventListener("pageshow", resync);
    };
  }, [setProgress, ensurePlaying, completeCurrentSong]);
  reactExports.useEffect(() => () => {
    if (playRetryRef.current) clearTimeout(playRetryRef.current);
    const el = prefetchRef.current;
    if (el) {
      el.removeAttribute("src");
      try {
        el.load();
      } catch {
      }
    }
  }, []);
  reactExports.useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!song) {
      try {
        navigator.mediaSession.metadata = null;
      } catch {
      }
      return;
    }
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: song.title,
        artist: song.artist,
        album: song.album ?? "",
        artwork: song.thumbnail_url ? [96, 128, 192, 256, 384, 512].flatMap(
          (s) => ["image/jpeg", "image/png"].map((type) => ({
            // Same-origin proxy so iOS/Android can actually fetch the art.
            src: streamUrl(song.thumbnail_url),
            sizes: `${s}x${s}`,
            type
          }))
        ) : []
      });
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    } catch {
    }
    const ms = navigator.mediaSession;
    const safe = (action, handler) => {
      try {
        ms.setActionHandler(action, handler);
      } catch {
      }
    };
    safe("play", () => {
      if (audioRef.current) audioRef.current.autoplay = true;
      audioRef.current?.play().then(() => usePlayer.setState({ isPlaying: true })).catch(() => void 0);
    });
    safe("pause", () => {
      if (audioRef.current) {
        audioRef.current.autoplay = false;
        audioRef.current.pause();
      }
      usePlayer.setState({ isPlaying: false });
    });
    safe("previoustrack", goToPrevious);
    safe("nexttrack", advanceToNext);
    safe("seekto", (e) => {
      if (typeof e.seekTime !== "number") return;
      const audio = audioRef.current;
      if (e.fastSeek && audio && typeof audio.fastSeek === "function") {
        audio.fastSeek(e.seekTime);
        setProgress(e.seekTime);
        return;
      }
      commitSeek(e.seekTime);
    });
    safe("seekbackward", (e) => {
      const by = e.seekOffset ?? 10;
      commitSeek(usePlayer.getState().progress - by);
    });
    safe("seekforward", (e) => {
      const by = e.seekOffset ?? 10;
      commitSeek(usePlayer.getState().progress + by);
    });
    safe("stop", () => {
      audioRef.current?.pause();
      usePlayer.setState({ isPlaying: false });
    });
    return () => {
      [
        "play",
        "pause",
        "previoustrack",
        "nexttrack",
        "seekto",
        "seekbackward",
        "seekforward",
        "stop"
      ].forEach((a) => safe(a, null));
    };
  }, [song?.id, song?.title, song?.artist, song?.album, song?.thumbnail_url, isPlaying, advanceToNext, goToPrevious, commitSeek, setProgress]);
  reactExports.useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!duration || !isFinite(duration)) return;
    try {
      navigator.mediaSession.setPositionState?.({
        duration,
        position: Math.max(0, Math.min(audioRef.current?.currentTime ?? progress, duration)),
        playbackRate: audioRef.current?.playbackRate ?? 1
      });
    } catch {
    }
  }, [progress, duration, isPlaying]);
  const { data: liked = [] } = useQuery({
    queryKey: ["liked", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id");
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!user
  });
  const isLiked = song ? liked.includes(song.id) : false;
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!song || !user) return;
      if (isLiked) {
        await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      } else {
        await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] })
  });
  reactExports.useEffect(() => {
    if (audioRef.current) {
      attachEqualizerToAudio(audioRef.current);
    }
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "audio",
      {
        ref: audioRef,
        preload: "auto",
        playsInline: true,
        crossOrigin: "anonymous",
        onLoadedMetadata: (e) => {
          const audio = e.currentTarget;
          const loadedSong = usePlayer.getState().currentSong();
          if (loadedSong && audio.dataset.songId !== loadedSong.id) return;
          const realDuration = Number.isFinite(audio.duration) ? audio.duration : loadedSong?.duration ?? 0;
          setDuration(realDuration);
          const pending = pendingSeekRef.current;
          if (pending != null) {
            pendingSeekRef.current = null;
            seekAudio(audio, Math.min(pending, realDuration || pending));
            setProgress(Math.min(pending, realDuration || pending));
          }
        },
        onPlay: () => {
          suppressPauseUntil.current = 0;
          if (audioRef.current) audioRef.current.autoplay = true;
          usePlayer.setState({ isPlaying: true });
        },
        onPause: () => {
          const audio = audioRef.current;
          if (audio?.ended || audio && Number.isFinite(audio.duration) && audio.duration > 0 && audio.currentTime >= audio.duration - 0.1) {
            completeCurrentSong();
            return;
          }
          if (Date.now() < suppressPauseUntil.current) return;
          if (audioRef.current) audioRef.current.autoplay = false;
          usePlayer.setState({ isPlaying: false });
        },
        onCanPlay: () => {
          if (usePlayer.getState().isPlaying) audioRef.current?.play().catch(() => {
          });
        },
        onStalled: () => {
          if (usePlayer.getState().isPlaying) audioRef.current?.play().catch(() => {
          });
        },
        onError: () => {
          const audio = audioRef.current;
          if (!audio) return;
          const state = usePlayer.getState();
          const maxRetries = state.repeat === "one" ? 3 : 1;
          errorRetryRef.current += 1;
          if (errorRetryRef.current <= maxRetries) {
            suppressPauseUntil.current = Date.now() + 5e3;
            const at = state.progress || 0;
            pendingSeekRef.current = at;
            audio.load();
            audio.play().catch(() => {
            });
          } else {
            errorRetryRef.current = 0;
            if (state.repeat === "one") {
              pendingSeekRef.current = 0;
              audio.load();
              audio.play().catch(() => {
              });
            } else {
              advanceToNext();
            }
          }
        },
        onTimeUpdate: () => publishAudioTime(true),
        onSeeked: () => {
          const audio = audioRef.current;
          if (!audio) return;
          seekHoldRef.current = null;
          if (!scrubbingRef.current) setProgress(audio.currentTime);
          if (usePlayer.getState().isPlaying && audio.paused) audio.play().catch(() => {
          });
        }
      }
    ),
    song && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: openNowPlaying,
        className: "md:hidden fixed left-2 right-2 bottom-18 h-14 z-40 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-lg flex items-center gap-2 pl-2 pr-3 overflow-hidden cursor-pointer",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-lg bg-muted shrink-0 overflow-hidden flex items-center justify-center", children: song.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: song.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-5 w-5 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate text-foreground", children: cleanSongTitle(song.title) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: song.artist })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "h-9 w-9 shrink-0 text-foreground/80 hover:text-foreground hover:bg-accent/60",
              onClick: (e) => {
                e.stopPropagation();
                toggleQueuePanel();
              },
              "aria-label": "Queue",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListMusic, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "h-9 w-9 shrink-0 text-foreground/80 hover:text-foreground hover:bg-accent/60",
              onClick: (e) => {
                e.stopPropagation();
                toggleLike.mutate();
              },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: isLiked ? "h-5 w-5 fill-primary text-primary" : "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "h-9 w-9 shrink-0 text-foreground hover:bg-accent/60",
              onClick: (e) => {
                e.stopPropagation();
                togglePlay();
              },
              children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-5 w-5 fill-current" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-5 w-5 fill-current ml-0.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 right-0 bottom-0 h-1 bg-muted-foreground/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "h-full origin-left bg-primary transition-transform duration-150 ease-linear will-change-transform",
              style: { transform: `scaleX(${duration ? Math.min(progress / duration, 1) : 0})` }
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex fixed bottom-0 left-0 right-0 h-20 z-50 bg-card/95 backdrop-blur-md border-t border-border/80 px-4 items-center gap-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3 w-1/4 min-w-0", children: song && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: toggleNowPlaying,
            className: "h-14 w-14 rounded-xl bg-muted shrink-0 overflow-hidden flex items-center justify-center hover:opacity-90 shadow-sm border border-border/60 cursor-pointer",
            "aria-label": "Toggle now playing",
            children: song.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: song.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-6 w-6 text-muted-foreground" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: toggleNowPlaying, className: "min-w-0 hidden sm:block text-left hover:underline cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate text-foreground", children: cleanSongTitle(song.title) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: song.artist })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/60 cursor-pointer",
            onClick: () => toggleLike.mutate(),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: isLiked ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center gap-1 max-w-2xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer", onClick: toggleShuffle, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shuffle, { className: shuffle ? "h-4 w-4 text-primary" : "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer", onClick: goToPrevious, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipBack, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "icon",
              className: "h-10 w-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 shadow-md transition flex items-center justify-center cursor-pointer",
              onClick: togglePlay,
              disabled: !song,
              children: isPlaying ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-5 w-5 fill-current" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-5 w-5 fill-current ml-0.5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer", onClick: advanceToNext, children: /* @__PURE__ */ jsxRuntimeExports.jsx(SkipForward, { className: "h-4 w-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer", onClick: cycleRepeat, children: repeat === "one" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat1, { className: "h-4 w-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat, { className: repeat === "all" ? "h-4 w-4 text-primary" : "h-4 w-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full max-w-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-10 text-right tabular-nums", children: formatDuration(scrubbing ? scrubValue : progress) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Slider,
            {
              value: [scrubbing ? scrubValue : progress],
              max: duration || 1,
              step: 0.01,
              onPointerDown: seekTouchHaptic,
              onValueChange: (v) => {
                scrubbingRef.current = true;
                setScrubbing(true);
                setScrubValue(v[0]);
                seekDragHaptic(v[0]);
              },
              onValueCommit: (v) => {
                commitSeek(v[0]);
                seekCommitHaptic();
                scrubbingRef.current = false;
                setScrubbing(false);
              },
              onPointerCancel: () => {
                scrubbingRef.current = false;
                setScrubbing(false);
              },
              className: "flex-1 group"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground w-10 tabular-nums", children: formatDuration(duration) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden md:flex items-center gap-2 w-1/4 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer", title: "Sleep timer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: sleepTimer ? "h-4 w-4 text-primary" : "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", children: [
            [5, 15, 30, 60].map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => setSleepTimer(m), children: [
              m,
              " minutes"
            ] }, m)),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => setSleepTimer(null), children: "Cancel timer" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer shrink-0",
            onClick: toggleMute,
            title: muted ? "Unmute" : "Mute",
            children: muted || volume === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(VolumeX, { className: "h-4 w-4" }) : volume < 0.5 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Volume1, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Slider,
          {
            value: [muted ? 0 : volume * 100],
            max: 100,
            step: 1,
            onValueChange: (v) => {
              if (muted) toggleMute();
              setVolume(v[0] / 100);
            },
            className: "w-24 lg:w-28 cursor-pointer"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: cn(
              "h-8 w-8 hover:bg-accent/60 cursor-pointer shrink-0",
              sidebarRightOpen ? "text-primary" : "text-foreground/80 hover:text-foreground"
            ),
            onClick: toggleSidebarRight,
            title: "Now playing side view",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelRight, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: "h-8 w-8 text-foreground/80 hover:text-foreground hover:bg-accent/60 cursor-pointer shrink-0",
            onClick: toggleQueuePanel,
            title: "Queue",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ListMusic, { className: "h-4 w-4" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            size: "icon",
            variant: "ghost",
            className: cn(
              "h-8 w-8 hover:bg-accent/60 cursor-pointer shrink-0",
              nowPlayingOpen ? "text-primary" : "text-foreground/80 hover:text-foreground"
            ),
            onClick: toggleNowPlaying,
            title: nowPlayingOpen ? "Exit full screen" : "Full screen",
            children: nowPlayingOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize2, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "h-4 w-4" })
          }
        )
      ] })
    ] })
  ] });
}
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("animate-pulse animate-shimmer rounded-md bg-muted/65", className), ...props });
}
function HomeSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-8 animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-52 rounded-xl mb-5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 bg-card/60 p-2 rounded-xl border border-border/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-14 rounded-lg shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 flex-1 min-w-0 pr-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2 rounded" })
        ] })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-36 rounded-lg mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/60 p-3.5 rounded-2xl border border-border/40 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square w-full rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4/5 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-3/5 rounded" })
      ] }, i)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-7 w-44 rounded-lg mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4", children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/60 p-3.5 rounded-2xl border border-border/40 space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square w-full rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-3/4 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2 rounded" })
      ] }, i)) })
    ] })
  ] });
}
function SongTableSkeleton({ rows = 8 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 p-2", children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "grid grid-cols-[16px_4fr_3fr_minmax(0,1fr)_60px] items-center gap-4 px-4 py-2.5 rounded-xl border border-transparent",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-10 rounded-lg shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-36 rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-24 rounded" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3.5 w-28 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4 rounded-full ml-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3.5 w-10 rounded ml-auto" })
      ]
    },
    i
  )) });
}
function PlaylistSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 pb-10 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent border-b border-border/40", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-end gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-44 w-44 rounded-2xl shrink-0 shadow-lg" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3.5 w-20 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-64 sm:w-80 rounded-xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-48 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3.5 w-28 rounded" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-14 w-14 rounded-full shadow-md" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-9 rounded-full" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-9 rounded-full" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SongTableSkeleton, { rows: 8 })
    ] })
  ] });
}
function LibrarySkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-9 w-48 rounded-xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-10 w-full sm:w-72 rounded-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4", children: Array.from({ length: 10 }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/60 p-3.5 rounded-2xl border border-border/40 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "aspect-square w-full rounded-xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-4 w-4/5 rounded" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-3 w-1/2 rounded" })
    ] }, i)) })
  ] });
}
function AppShellSkeleton() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6 animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-8 w-44 rounded-xl" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(HomeSkeleton, {})
  ] });
}
function Layout({ children }) {
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const nav = useNavigate();
  const { user, loading } = useAuth();
  reactExports.useEffect(() => {
    const ch = supabase.channel("realtime-all").on(
      "postgres_changes",
      { event: "*", schema: "public", table: "songs" },
      () => qc.invalidateQueries({ queryKey: ["songs"] })
    ).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "playlists" },
      () => qc.invalidateQueries({ queryKey: ["playlists"] })
    ).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "playlist_songs" },
      () => qc.invalidateQueries({ queryKey: ["playlist"] })
    ).on(
      "postgres_changes",
      { event: "*", schema: "public", table: "liked_songs" },
      () => qc.invalidateQueries({ queryKey: ["liked"] })
    ).subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [qc]);
  reactExports.useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      nav({ to: "/login" });
    }
  }, [loading, user, pathname, nav]);
  const mobileNav = [
    { to: "/", icon: House, label: "Home" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/library", icon: Library, label: "Library" },
    { to: "/liked", icon: Heart, label: "Liked" }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-screen flex flex-col bg-background text-foreground overflow-hidden relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(MoodBackdrop, { intensity: 0.7 }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TopNavbar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex min-h-0 relative z-10 px-2 pb-2 gap-2 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sidebar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "main",
        {
          id: "main-content",
          className: "flex-1 bg-card/85 backdrop-blur-xl border border-border/70 rounded-2xl overflow-y-auto pb-28 md:pb-24 shadow-xs",
          children: loading || !user ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AppShellSkeleton, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden", children })
          ] }) : children
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(NowPlayingSidebar, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(NowPlaying, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QueuePanel, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Player, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card/95 backdrop-blur border-t border-border flex justify-around items-center z-50", children: mobileNav.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to: it.to,
        className: cn(
          "flex flex-col items-center text-xs gap-0.5 px-3 py-1 transition-all duration-200 active:scale-90",
          pathname === it.to ? "text-primary" : "text-muted-foreground"
        ),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: cn("h-5 w-5 transition-transform", pathname === it.to && "scale-110") }),
          it.label
        ]
      },
      it.to
    )) })
  ] });
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const STORAGE_KEY = "r-musics-player-snapshot-v2";
function readLocalSnapshot(userId) {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!parsed || parsed.userId !== userId || !Array.isArray(parsed.queue) || !parsed.queue.length) return null;
    return parsed;
  } catch {
    return null;
  }
}
function writeLocalSnapshot(userId) {
  if (typeof window === "undefined") return;
  const s = usePlayer.getState();
  if (!s.queue.length || s.currentIndex < 0) return;
  const snapshot = {
    userId,
    queue: s.queue,
    currentIndex: s.currentIndex,
    shuffle: s.shuffle,
    repeat: s.repeat,
    progress: s.progress,
    sleepTimer: s.sleepTimer,
    updatedAt: Date.now()
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
  }
}
function usePersistentQueue(userId) {
  const hydratedFor = reactExports.useRef(null);
  const saveTimer = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (!userId) {
      hydratedFor.current = null;
      return;
    }
    if (hydratedFor.current === userId) return;
    hydratedFor.current = userId;
    (async () => {
      if (usePlayer.getState().queue.length) return;
      const { data } = await supabase.from("user_queue").select("queue, current_index, shuffle, repeat, progress, sleep_until, updated_at").eq("user_id", userId).maybeSingle();
      const local = readLocalSnapshot(userId);
      const remote = data ? {
        queue: data.queue ?? [],
        currentIndex: data.current_index ?? 0,
        shuffle: !!data.shuffle,
        repeat: data.repeat ?? "off",
        progress: Number(data.progress) || 0,
        sleepTimer: data.sleep_until ? new Date(data.sleep_until).getTime() : null,
        updatedAt: Date.parse(data.updated_at) || 0
      } : null;
      const snapshot = local && (!remote || local.updatedAt >= remote.updatedAt) ? local : remote;
      if (!snapshot || usePlayer.getState().queue.length) return;
      const queue = snapshot.queue;
      if (!queue.length) return;
      const idx = Math.min(Math.max(snapshot.currentIndex ?? 0, 0), queue.length - 1);
      usePlayer.getState().hydrate({
        queue,
        originalQueue: queue,
        currentIndex: idx,
        shuffle: snapshot.shuffle,
        repeat: snapshot.repeat,
        progress: snapshot.progress,
        duration: queue[idx]?.duration ?? 0,
        _seekTarget: snapshot.progress > 0 ? snapshot.progress : null,
        isPlaying: false,
        sleepTimer: snapshot.sleepTimer
      });
    })();
  }, [userId]);
  reactExports.useEffect(() => {
    if (!userId) return;
    const flushLocal = () => {
      const audio = typeof document !== "undefined" ? document.querySelector("audio") : null;
      if (audio && Number.isFinite(audio.currentTime) && audio.currentTime > 0) {
        const s = usePlayer.getState();
        if (Math.abs(s.progress - audio.currentTime) > 0.25) {
          usePlayer.setState({ progress: audio.currentTime });
        }
      }
      writeLocalSnapshot(userId);
    };
    window.addEventListener("pagehide", flushLocal);
    document.addEventListener("visibilitychange", flushLocal);
    const unsub = usePlayer.subscribe((state, prev) => {
      const watched = state.queue !== prev.queue || state.currentIndex !== prev.currentIndex || state.shuffle !== prev.shuffle || state.repeat !== prev.repeat || state.sleepTimer !== prev.sleepTimer || Math.floor(state.progress) !== Math.floor(prev.progress);
      if (!watched) return;
      writeLocalSnapshot(userId);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const s = usePlayer.getState();
        writeLocalSnapshot(userId);
        await supabase.from("user_queue").upsert({
          user_id: userId,
          queue: s.queue,
          current_index: s.currentIndex,
          shuffle: s.shuffle,
          repeat: s.repeat,
          progress: s.progress,
          sleep_until: s.sleepTimer ? new Date(s.sleepTimer).toISOString() : null,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        });
      }, 1500);
    });
    return () => {
      writeLocalSnapshot(userId);
      window.removeEventListener("pagehide", flushLocal);
      document.removeEventListener("visibilitychange", flushLocal);
      unsub();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [userId]);
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    error?.message && /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-xs text-destructive font-mono mt-3 p-3 rounded-lg bg-destructive/10 text-left max-h-28 overflow-auto whitespace-pre-wrap break-all", children: error.message }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$c = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sonara — Music Beyond Boundaries" },
      { name: "description", content: "Sonara — premium music streaming. Discover songs, build playlists, like tracks, and enjoy a beautiful player anywhere." },
      { name: "keywords", content: "sonara, music streaming, premium music player, playlists, online music" },
      { name: "robots", content: "index, follow" },
      { property: "og:site_name", content: "Sonara" },
      { property: "og:title", content: "Sonara — Music Beyond Boundaries" },
      { property: "og:description", content: "Stream music, build playlists and enjoy a beautiful player. Music Beyond Boundaries." },
      { property: "og:type", content: "website" },
      // Dual theme-color so the PWA / iOS status bar / Android chrome match
      // the user's system (or in-app) theme. The theme-store also swaps the
      // no-media fallback live when the user toggles theme inside the app.
      { name: "theme-color", content: "#ffffff" },
      { name: "theme-color", media: "(prefers-color-scheme: light)", content: "#ffffff" },
      { name: "theme-color", media: "(prefers-color-scheme: dark)", content: "#0d0b14" },
      { name: "color-scheme", content: "light dark" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Sonara" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Sonara — Music Beyond Boundaries" },
      { name: "twitter:description", content: "Stream music, build playlists, enjoy a beautiful player." },
      { property: "og:image", content: "/icon-512.png" },
      { name: "twitter:image", content: "/icon-512.png" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      { rel: "icon", href: "/icon-192.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" }
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Sonara",
          alternateName: ["Sonara Music"],
          url: "https://rmusics.lovable.app/",
          description: "Premium music streaming app with playlists and a beautiful player.",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://rmusics.lovable.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Sonara",
          url: "https://rmusics.lovable.app/",
          logo: "https://rmusics.lovable.app/icon-512.png"
        })
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", className: "dark", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("head", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: `(function(){try{var t=localStorage.getItem('rmusics.theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}var r=document.documentElement;r.classList.toggle('dark',t==='dark');r.style.colorScheme=t;}catch(e){}})();`
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { className: "bg-background text-foreground", suppressHydrationWarning: true, children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$c.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(RootInner, {}) });
}
function RootInner() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const isLoginPage = pathname === "/login";
  const { user } = useAuth();
  usePersistentQueue(user?.id ?? null);
  const theme = useTheme();
  if (isLoginPage) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { theme })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Layout, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { theme })
  ] });
}
const BASE_URL = "https://rmusics.lovable.app";
const Route$b = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          { path: "/search", changefreq: "weekly", priority: "0.8" },
          { path: "/library", changefreq: "weekly", priority: "0.7" },
          { path: "/liked", changefreq: "weekly", priority: "0.6" },
          { path: "/history", changefreq: "weekly", priority: "0.5" },
          { path: "/login", changefreq: "monthly", priority: "0.4" }
        ];
        const urls = entries.map(
          (e) => `  <url>
    <loc>${BASE_URL}${e.path}</loc>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
        ).join("\n");
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600"
          }
        });
      }
    }
  }
});
const $$splitComponentImporter$9 = () => import("./settings-DKIqSt_j.mjs");
const Route$a = createFileRoute("/settings")({
  head: () => ({
    meta: [{
      title: "Sonara — Settings & Equalizer"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./search-DLvQvaw_.mjs");
const Route$9 = createFileRoute("/search")({
  head: () => ({
    meta: [{
      title: "Sonara — Search & Browse"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./login-CRTiau0M.mjs");
const Route$8 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in — Sonara"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./liked-BXS7ZToQ.mjs");
const Route$7 = createFileRoute("/liked")({
  head: () => ({
    meta: [{
      title: "Sonara — Liked Songs"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./library-BajL1LR6.mjs");
const Route$6 = createFileRoute("/library")({
  head: () => ({
    meta: [{
      title: "Sonara — Library"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./import-Cl96ddeC.mjs");
const Route$5 = createFileRoute("/import")({
  head: () => ({
    meta: [{
      title: "Sonara — Import from Spotify"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./history-SkZyPkl1.mjs");
const Route$4 = createFileRoute("/history")({
  head: () => ({
    meta: [{
      title: "Sonara — Recently Played"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin-CmBl9oJO.mjs");
const Route$3 = createFileRoute("/admin")({
  head: () => ({
    meta: [{
      title: "Sonara — Admin Dashboard"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./index-B_I96ihS.mjs");
const Route$2 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Sonara — Music Beyond Boundaries"
    }, {
      name: "description",
      content: "Sonara — premium music streaming. Discover songs, build playlists, like tracks, and enjoy a beautiful player on any device."
    }, {
      name: "keywords",
      content: "sonara, music streaming, premium music player, playlists, online music player"
    }, {
      property: "og:title",
      content: "Sonara — Music Beyond Boundaries"
    }, {
      property: "og:description",
      content: "Stream music, build playlists, and enjoy a beautiful player. Music Beyond Boundaries."
    }, {
      property: "og:url",
      content: "https://rmusics.lovable.app/"
    }],
    links: [{
      rel: "canonical",
      href: "https://rmusics.lovable.app/"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./playlist._id-ZKaYYWFz.mjs");
const Route$1 = createFileRoute("/playlist/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const HOP_BY_HOP = /* @__PURE__ */ new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer"
]);
function allowedHost() {
  const pub = process.env.R2_PUBLIC_URL;
  if (!pub) return null;
  try {
    return new URL(pub).hostname;
  } catch {
    return null;
  }
}
async function handle(request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("u");
  if (!target) return new Response("Missing u", { status: 400 });
  let upstream;
  try {
    upstream = new URL(target);
  } catch {
    return new Response("Invalid url", { status: 400 });
  }
  const host = allowedHost();
  if (!host || upstream.hostname !== host || upstream.protocol !== "https:") {
    return new Response("Forbidden host", { status: 403 });
  }
  const forwardHeaders = new Headers();
  const range = request.headers.get("range");
  if (range) forwardHeaders.set("range", range);
  const ifRange = request.headers.get("if-range");
  if (ifRange) forwardHeaders.set("if-range", ifRange);
  const upstreamRes = await fetch(upstream.toString(), {
    method: request.method === "HEAD" ? "HEAD" : "GET",
    headers: forwardHeaders
  });
  const headers = new Headers();
  upstreamRes.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("Accept-Ranges", "bytes");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cache-Control", headers.get("cache-control") ?? "public, max-age=31536000, immutable");
  return new Response(request.method === "HEAD" ? null : upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers
  });
}
const Route = createFileRoute("/api/stream")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      HEAD: ({ request }) => handle(request)
    }
  }
});
const SitemapDotxmlRoute = Route$b.update({
  id: "/sitemap.xml",
  path: "/sitemap.xml",
  getParentRoute: () => Route$c
});
const SettingsRoute = Route$a.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => Route$c
});
const SearchRoute = Route$9.update({
  id: "/search",
  path: "/search",
  getParentRoute: () => Route$c
});
const LoginRoute = Route$8.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$c
});
const LikedRoute = Route$7.update({
  id: "/liked",
  path: "/liked",
  getParentRoute: () => Route$c
});
const LibraryRoute = Route$6.update({
  id: "/library",
  path: "/library",
  getParentRoute: () => Route$c
});
const ImportRoute = Route$5.update({
  id: "/import",
  path: "/import",
  getParentRoute: () => Route$c
});
const HistoryRoute = Route$4.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => Route$c
});
const AdminRoute = Route$3.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$c
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const PlaylistIdRoute = Route$1.update({
  id: "/playlist/$id",
  path: "/playlist/$id",
  getParentRoute: () => Route$c
});
const ApiStreamRoute = Route.update({
  id: "/api/stream",
  path: "/api/stream",
  getParentRoute: () => Route$c
});
const rootRouteChildren = {
  IndexRoute,
  AdminRoute,
  HistoryRoute,
  ImportRoute,
  LibraryRoute,
  LikedRoute,
  LoginRoute,
  SearchRoute,
  SettingsRoute,
  SitemapDotxmlRoute,
  ApiStreamRoute,
  PlaylistIdRoute
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1e3 * 60 * 5,
        // 5 minutes fresh in cache — smooth instant navigation
        gcTime: 1e3 * 60 * 30,
        // 30 minutes in memory
        refetchOnWindowFocus: false,
        // Prevent jarring refetches on window blur/focus
        refetchOnReconnect: false,
        retry: 1
      }
    }
  });
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 1e3 * 60 * 5
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Avatar as A,
  Button as B,
  useEqualizer as C,
  Dialog as D,
  EQ_LABELS as E,
  useMood as F,
  usePlayer as G,
  HomeSkeleton as H,
  Input as I,
  useShake as J,
  useTheme as K,
  LibrarySkeleton as L,
  PlaylistSkeleton as P,
  Route$1 as R,
  Slider as S,
  AvatarFallback as a,
  AvatarImage as b,
  DialogContent as c,
  DialogDescription as d,
  DialogFooter as e,
  DialogHeader as f,
  DialogTitle as g,
  DropdownMenu as h,
  DropdownMenuContent as i,
  DropdownMenuItem as j,
  DropdownMenuSeparator as k,
  DropdownMenuSub as l,
  DropdownMenuSubContent as m,
  DropdownMenuSubTrigger as n,
  DropdownMenuTrigger as o,
  EQ_PRESETS as p,
  SongTableSkeleton as q,
  Switch as r,
  buttonVariants as s,
  cn as t,
  formatDuration as u,
  getAvatarUrl as v,
  getDisplayName as w,
  router as x,
  toggleTheme as y,
  useAuth as z
};
