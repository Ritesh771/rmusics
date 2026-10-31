import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { b as useQueryClient, a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { S as SongRow } from "./SongRow-DVoBGCB8.mjs";
import { R as Route$1, G as usePlayer, P as PlaylistSkeleton, B as Button, D as Dialog, c as DialogContent, f as DialogHeader, g as DialogTitle, I as Input, e as DialogFooter } from "./router-SYh-4Vc5.mjs";
import { T as Textarea } from "./textarea-DTVw3Kh7.mjs";
import { A as AlertDialog, h as AlertDialogTrigger, c as AlertDialogContent, f as AlertDialogHeader, g as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, b as AlertDialogCancel, a as AlertDialogAction } from "./alert-dialog-B6rfx7Ba.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import { y as Music, K as Play, J as Pencil, U as Share2, D as Download, $ as Trash2 } from "../_libs/lucide-react.mjs";
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
import "../_libs/radix-ui__react-dialog.mjs";
import "../_libs/dnd-kit__utilities.mjs";
import "../_libs/radix-ui__react-slider.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/zustand.mjs";
import "../_libs/dnd-kit__accessibility.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
function PlaylistPage() {
  const {
    id
  } = Route$1.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const playQueue = usePlayer((s) => s.playQueue);
  const [downloading, setDownloading] = reactExports.useState(false);
  const [dlProgress, setDlProgress] = reactExports.useState(0);
  const downloadAll = async (list) => {
    if (!list.length || downloading) return;
    setDownloading(true);
    setDlProgress(0);
    try {
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        try {
          const res = await fetch(s.audio_url);
          if (!res.ok) throw new Error(String(res.status));
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          const ext = (s.audio_url.split(".").pop() || "mp3").split("?")[0].slice(0, 4);
          a.href = url;
          a.download = `${s.artist ? s.artist + " - " : ""}${s.title}.${ext}`.replace(/[\\/:*?"<>|]/g, "_");
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 2e3);
        } catch (err) {
          console.error("Download failed for", s.title, err);
          toast.error(`Failed: ${s.title}`);
        }
        setDlProgress(Math.round((i + 1) / list.length * 100));
        await new Promise((r) => setTimeout(r, 400));
      }
      toast.success("Downloads complete");
    } finally {
      setDownloading(false);
    }
  };
  const {
    data: playlist
  } = useQuery({
    queryKey: ["playlist", id, "meta"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("playlists").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: songs = []
  } = useQuery({
    queryKey: ["playlist", id, "songs"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("playlist_songs").select("position, added_at, songs(*)").eq("playlist_id", id).order("added_at", {
        ascending: true
      });
      return (data ?? []).map((r) => r.songs).filter(Boolean);
    }
  });
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [name, setName] = reactExports.useState("");
  const [desc, setDesc] = reactExports.useState("");
  const [cover, setCover] = reactExports.useState("");
  const openEdit = () => {
    setName(playlist?.name ?? "");
    setDesc(playlist?.description ?? "");
    setCover(playlist?.cover_url ?? "");
    setEditOpen(true);
  };
  const save = useMutation({
    mutationFn: async () => {
      await supabase.from("playlists").update({
        name,
        description: desc || null,
        cover_url: cover || null,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["playlist", id]
      });
      qc.invalidateQueries({
        queryKey: ["playlists"]
      });
      setEditOpen(false);
      toast.success("Playlist details updated");
    }
  });
  const del = useMutation({
    mutationFn: async () => {
      await supabase.from("playlists").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["playlists"]
      });
      toast.success("Playlist deleted successfully");
      nav({
        to: "/library"
      });
    }
  });
  if (!playlist) return /* @__PURE__ */ jsxRuntimeExports.jsx(PlaylistSkeleton, {});
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-b from-primary/30 to-transparent p-6 pb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-end gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-44 w-44 bg-muted rounded shadow-2xl overflow-hidden flex items-center justify-center", children: playlist.cover_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: playlist.cover_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-20 w-20 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold uppercase", children: "Playlist" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-5xl font-extrabold mt-2", children: playlist.name }),
        playlist.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mt-2", children: playlist.description }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground mt-2", children: [
          songs.length,
          " songs"
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", className: "h-14 w-14 rounded-full bg-primary hover:scale-105 transition", onClick: () => playQueue(songs), disabled: !songs.length, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-6 w-6 fill-primary-foreground text-primary-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: openEdit, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          navigator.clipboard.writeText(window.location.href);
          toast.success("Link copied");
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => downloadAll(songs), disabled: !songs.length || downloading, className: "gap-2", title: "Download all songs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-5 w-5" }),
          downloading ? `Downloading ${dlProgress}%` : "Download all"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", title: "Delete playlist", className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-5 w-5" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Playlist" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                "Are you sure you want to delete “",
                playlist.name,
                "”? This action will remove the playlist from your library."
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => del.mutate(), className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        songs.map((s, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(SongRow, { song: s, index: i, queue: songs, inPlaylistId: id }, s.id)),
        !songs.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "No songs yet. Add some from your library." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: editOpen, onOpenChange: setEditOpen, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Edit playlist" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Name", value: name, onChange: (e) => setName(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { placeholder: "Description", value: desc, onChange: (e) => setDesc(e.target.value) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Cover image URL", value: cover, onChange: (e) => setCover(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", onClick: () => setEditOpen(false), children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => save.mutate(), children: "Save" })
      ] })
    ] }) })
  ] });
}
export {
  PlaylistPage as component
};
