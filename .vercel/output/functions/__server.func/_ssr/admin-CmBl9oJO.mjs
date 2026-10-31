import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQuery, b as useQueryClient, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, c as createSsrRpc } from "./createSsrRpc-BHHX7Rzb.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { z as useAuth, B as Button, I as Input, u as formatDuration } from "./router-SYh-4Vc5.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { a as createServerFn } from "./server-D2YdkoOS.mjs";
import { r as requireSupabaseAuth } from "./auth-middleware-BkDS9Vh_.mjs";
import { c as cleanSongTitle } from "./song-utils-CWgDAApr.mjs";
import { A as AlertDialog, h as AlertDialogTrigger, c as AlertDialogContent, f as AlertDialogHeader, g as AlertDialogTitle, d as AlertDialogDescription, e as AlertDialogFooter, b as AlertDialogCancel, a as AlertDialogAction } from "./alert-dialog-B6rfx7Ba.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { s as LoaderCircle, a0 as TriangleAlert, F as FileHeadphone, a1 as Upload, y as Music, $ as Trash2 } from "../_libs/lucide-react.mjs";
import { parseBlob } from "../_libs/music-metadata.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
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
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/radix-ui__react-alert-dialog.mjs";
import "../_libs/strtok3.mjs";
import "node:fs/promises";
import "../_libs/debug.mjs";
import "../_libs/ms.mjs";
import "tty";
import "../_libs/supports-color.mjs";
import "os";
import "../_libs/has-flag.mjs";
import "../_libs/content-type.mjs";
import "../_libs/media-typer.mjs";
import "../_libs/token-types.mjs";
import "../_libs/ieee754.mjs";
import "../_libs/borewit__text-codec.mjs";
import "../_libs/file-type.mjs";
import "../_libs/tokenizer__inflate.mjs";
import "../_libs/uint8array-extras.mjs";
import "../_libs/win-guid.mjs";
const inputSchema = objectType({
  filename: stringType().min(1).max(255),
  contentType: stringType().min(1).max(100)
});
const getR2UploadUrl = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => inputSchema.parse(input)).handler(createSsrRpc("d16207b6c2bf6b7a0b17ccc12c8cb294b17cfdbc36f9c9c8cfde09a0c4d136fb"));
const deleteR2Object = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  key: stringType().min(1)
}).parse(input)).handler(createSsrRpc("21bb041f9c04d7100bf2143962313612283af96c9dec132a99868b4a55f004e4"));
const extractR2Metadata = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).inputValidator((input) => objectType({
  url: stringType().url()
}).parse(input)).handler(createSsrRpc("e02e4f4f23276e7d1ede7d12373ddf903f39ef2cf2c7b3741f53471745a490b7"));
function AdminPage() {
  const {
    user,
    loading
  } = useAuth();
  const {
    data: isAdmin,
    isLoading: roleLoading
  } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const {
        data
      } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
    enabled: !!user
  });
  if (loading || roleLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-10 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 max-w-md mx-auto text-center space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-10 w-10 text-yellow-500 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Admin access required" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Your account doesn't have the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "admin" }),
        " role. Ask an existing admin to grant it via the ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "user_roles" }),
        " table."
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminPanel, {});
}
function AdminPanel() {
  const qc = useQueryClient();
  const fileRef = reactExports.useRef(null);
  const [queue, setQueue] = reactExports.useState([]);
  const [bulkRunning, setBulkRunning] = reactExports.useState(false);
  const [bulkProgress, setBulkProgress] = reactExports.useState(null);
  const getUploadUrl = useServerFn(getR2UploadUrl);
  const deleteObj = useServerFn(deleteR2Object);
  const extractMeta = useServerFn(extractR2Metadata);
  const {
    data: songs = []
  } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const {
        data
      } = await supabase.from("songs").select("*").order("created_at", {
        ascending: false
      });
      return data ?? [];
    }
  });
  const updateItem = (id, patch) => setQueue((q) => q.map((it) => it.id === id ? {
    ...it,
    ...patch
  } : it));
  const normKey = (title, artist) => `${title.trim().toLowerCase()}::${artist.trim().toLowerCase()}`;
  const checkDuplicate = (title, artist, selfId, currentQueue, library) => {
    const key = normKey(title, artist);
    if (!title || !artist) return null;
    const inLib = library.find((s) => normKey(s.title, s.artist) === key);
    if (inLib) return {
      id: inLib.id,
      title: inLib.title,
      artist: inLib.artist,
      source: "library"
    };
    const inQueue = currentQueue.find((it) => it.id !== selfId && it.status !== "duplicate" && normKey(it.title, it.artist) === key);
    if (inQueue) return {
      title: inQueue.title,
      artist: inQueue.artist,
      source: "queue"
    };
    return null;
  };
  const parseOne = async (item) => {
    updateItem(item.id, {
      status: "parsing"
    });
    try {
      const meta = await parseBlob(item.file);
      const c = meta.common;
      let thumbDataUrl = null;
      let thumbBlob = null;
      if (c.picture && c.picture[0]) {
        const pic = c.picture[0];
        thumbBlob = new Blob([new Uint8Array(pic.data)], {
          type: pic.format || "image/jpeg"
        });
        thumbDataUrl = URL.createObjectURL(thumbBlob);
      }
      const rawTitle = c.title || item.file.name.replace(/\.[^.]+$/, "");
      const title = cleanSongTitle(rawTitle);
      const artist = c.artist || c.albumartist || "Unknown Artist";
      updateItem(item.id, {
        title,
        artist,
        album: c.album || "",
        genre: c.genre && c.genre[0] || "",
        duration: Math.round(meta.format.duration || 0),
        thumbDataUrl,
        thumbBlob,
        status: "ready"
      });
    } catch (err) {
      console.error("Metadata parse failed:", err);
      const dur = await new Promise((resolve) => {
        const a = document.createElement("audio");
        a.src = URL.createObjectURL(item.file);
        a.addEventListener("loadedmetadata", () => resolve(Math.round(a.duration || 0)));
        a.addEventListener("error", () => resolve(0));
      });
      updateItem(item.id, {
        title: cleanSongTitle(item.file.name.replace(/\.[^.]+$/, "")),
        artist: "Unknown Artist",
        duration: dur,
        status: "ready"
      });
    }
  };
  const addFiles = async (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("audio/") || /\.(mp3|m4a|wav|flac|ogg|aac)$/i.test(f.name));
    if (!arr.length) return;
    const items = arr.map((file) => ({
      id: crypto.randomUUID(),
      file,
      title: file.name.replace(/\.[^.]+$/, ""),
      artist: "",
      album: "",
      genre: "",
      duration: 0,
      thumbDataUrl: null,
      thumbBlob: null,
      status: "pending",
      progress: 0
    }));
    setQueue((q) => [...q, ...items]);
    await Promise.all(items.map((it) => parseOne(it)));
    setQueue((q) => {
      const next = [...q];
      for (const it of next) {
        if (it.status !== "ready") continue;
        const dup = checkDuplicate(it.title, it.artist, it.id, next, songs);
        if (dup) {
          const idx = next.findIndex((x) => x.id === it.id);
          next[idx] = {
            ...it,
            status: "duplicate",
            duplicateOf: dup
          };
        }
      }
      return next;
    });
  };
  const uploadBlob = (uploadUrl, blob, contentType, onProgress) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round(e.loaded / e.total * 100));
    };
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
    xhr.onerror = () => reject(new Error("Network error (check R2 CORS)"));
    xhr.send(blob);
  });
  const uploadOne = async (item) => {
    updateItem(item.id, {
      status: "uploading",
      progress: 0,
      error: void 0
    });
    try {
      const audioInfo = await getUploadUrl({
        data: {
          filename: item.file.name,
          contentType: item.file.type || "audio/mpeg"
        }
      });
      await uploadBlob(audioInfo.uploadUrl, item.file, item.file.type || "audio/mpeg", (p) => updateItem(item.id, {
        progress: p
      }));
      let thumbUrl = null;
      if (item.thumbBlob) {
        const thumbInfo = await getUploadUrl({
          data: {
            filename: `cover-${Date.now()}.${item.thumbBlob.type.split("/")[1] || "jpg"}`,
            contentType: item.thumbBlob.type || "image/jpeg"
          }
        });
        await uploadBlob(thumbInfo.uploadUrl, item.thumbBlob, item.thumbBlob.type || "image/jpeg");
        thumbUrl = thumbInfo.publicUrl;
      }
      let serverMeta = null;
      try {
        serverMeta = await extractMeta({
          data: {
            url: audioInfo.publicUrl
          }
        });
      } catch (e) {
        console.warn("Server meta failed", e);
      }
      const duration = item.duration > 0 ? item.duration : serverMeta?.duration && serverMeta.duration > 0 ? serverMeta.duration : 0;
      const rawTitle = item.title || serverMeta?.title || item.file.name.replace(/\.[^.]+$/, "");
      const finalTitle = cleanSongTitle(rawTitle);
      const {
        error
      } = await supabase.from("songs").insert({
        title: finalTitle,
        artist: item.artist || serverMeta?.artist || "Unknown Artist",
        album: item.album || serverMeta?.album || null,
        genre: item.genre || serverMeta?.genre || null,
        duration,
        audio_url: audioInfo.publicUrl,
        thumbnail_url: thumbUrl
      });
      if (error) throw error;
      updateItem(item.id, {
        status: "done",
        progress: 100
      });
    } catch (e) {
      updateItem(item.id, {
        status: "error",
        error: e.message || "Upload failed"
      });
    }
  };
  const uploadAll = async () => {
    const snapshot = queue.filter((it) => it.status === "ready" || it.status === "error");
    if (!snapshot.length) return;
    setBulkRunning(true);
    setBulkProgress({
      current: 0,
      total: snapshot.length,
      pct: 0,
      title: ""
    });
    try {
      for (let i = 0; i < snapshot.length; i++) {
        const it = snapshot[i];
        const latest = await new Promise((res) => {
          setQueue((q) => {
            res(q.find((x) => x.id === it.id));
            return q;
          });
        });
        if (!latest) continue;
        const currentNum = i + 1;
        const pct = Math.round(i / snapshot.length * 100);
        setBulkProgress({
          current: currentNum,
          total: snapshot.length,
          pct,
          title: latest.title || latest.file.name
        });
        if (!latest.title || !latest.artist) {
          updateItem(latest.id, {
            status: "error",
            error: "Title and artist required"
          });
          continue;
        }
        await uploadOne(latest);
      }
      setBulkProgress({
        current: snapshot.length,
        total: snapshot.length,
        pct: 100,
        title: "All tracks uploaded"
      });
      qc.invalidateQueries({
        queryKey: ["songs"]
      });
      toast.success(`Completed upload of ${snapshot.length} tracks.`);
    } finally {
      setBulkRunning(false);
      setTimeout(() => setBulkProgress(null), 3500);
    }
  };
  const removeItem = (id) => setQueue((q) => q.filter((it) => it.id !== id));
  const clearDone = () => setQueue((q) => q.filter((it) => it.status !== "done"));
  const del = useMutation({
    mutationFn: async (s) => {
      const r2Pub = s.audio_url.match(/\/songs\/.+$/)?.[0];
      if (r2Pub) {
        try {
          await deleteObj({
            data: {
              key: r2Pub.replace(/^\//, "")
            }
          });
        } catch {
        }
      }
      await supabase.from("songs").delete().eq("id", s.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["songs"]
      });
      toast.success("Song removed from library");
    }
  });
  const readyCount = queue.filter((q) => q.status === "ready" || q.status === "error").length;
  const dupCount = queue.filter((q) => q.status === "duplicate").length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-5xl mx-auto space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-1", children: "Bulk upload songs" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Drop multiple audio files. Metadata is auto-extracted; edit as needed, then upload all." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card p-6 rounded-lg space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "audio-files", className: "flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 transition", onDragOver: (e) => e.preventDefault(), onDrop: (e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileHeadphone, { className: "h-10 w-10 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm", children: [
            "Drop audio files or ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary underline", children: "browse" }),
            " (multi-select supported)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "MP3, M4A, WAV, FLAC, OGG…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: "audio-files", ref: fileRef, type: "file", accept: "audio/*", multiple: true, className: "hidden", onChange: (e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            if (fileRef.current) fileRef.current.value = "";
          } })
        ] }),
        queue.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            queue.length,
            " file",
            queue.length === 1 ? "" : "s",
            " · ",
            readyCount,
            " ready · ",
            dupCount,
            " duplicate · ",
            queue.filter((q) => q.status === "done").length,
            " uploaded"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: clearDone, disabled: bulkRunning, children: "Clear done" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "sm", onClick: () => setQueue([]), disabled: bulkRunning, children: "Clear all" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: uploadAll, disabled: bulkRunning || readyCount === 0, children: [
              bulkRunning ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4 mr-2" }),
              bulkRunning ? "Uploading…" : `Upload all (${readyCount})`
            ] })
          ] })
        ] }),
        bulkProgress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/90 border border-primary/40 rounded-xl p-4 space-y-2 shadow-sm animate-fade-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
              "Uploading track ",
              bulkProgress.current,
              " of ",
              bulkProgress.total,
              ": “",
              cleanSongTitle(bulkProgress.title),
              "”"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-bold tabular-nums", children: [
              bulkProgress.pct,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 transition-all duration-300 rounded-full", style: {
            width: `${bulkProgress.pct}%`
          } }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: queue.map((it) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border border-border rounded-lg p-3 bg-background/50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 w-20 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0", children: it.thumbDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: it.thumbDataUrl, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-8 w-8 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: it.file.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: it.status }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-6 w-6", onClick: () => removeItem(it.id), disabled: it.status === "uploading", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-3 w-3" }) })
              ] })
            ] }),
            it.status === "parsing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3 w-3 animate-spin" }),
              " Reading tags…"
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "Title", value: it.title, onChange: (e) => updateItem(it.id, {
                title: e.target.value
              }), disabled: it.status === "uploading" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "Artist", value: it.artist, onChange: (e) => updateItem(it.id, {
                artist: e.target.value
              }), disabled: it.status === "uploading" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "Album", value: it.album, onChange: (e) => updateItem(it.id, {
                album: e.target.value
              }), disabled: it.status === "uploading" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", placeholder: "Genre", value: it.genre, onChange: (e) => updateItem(it.id, {
                genre: e.target.value
              }), disabled: it.status === "uploading" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { className: "h-8 text-xs", type: "number", placeholder: "Duration", value: it.duration, onChange: (e) => updateItem(it.id, {
                duration: Number(e.target.value)
              }), disabled: it.status === "uploading" })
            ] }),
            it.status === "uploading" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1.5 bg-muted rounded overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary transition-all", style: {
                width: `${it.progress}%`
              } }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                it.progress,
                "%"
              ] })
            ] }),
            it.error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-destructive", children: it.error }),
            it.status === "duplicate" && it.duplicateOf && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2 text-xs bg-yellow-500/10 border border-yellow-500/30 rounded p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-yellow-500 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-3.5 w-3.5 shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                  "Already ",
                  it.duplicateOf.source === "library" ? "in library" : "in this queue",
                  ":",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                    " ",
                    it.duplicateOf.title
                  ] }),
                  " — ",
                  it.duplicateOf.artist
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "sm", variant: "ghost", className: "h-6 text-xs", onClick: () => updateItem(it.id, {
                status: "ready",
                duplicateOf: void 0
              }), children: "Upload anyway" })
            ] })
          ] })
        ] }) }, it.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("details", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("summary", { className: "cursor-pointer", children: "Cloudflare R2 bucket CORS configuration reference" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-2 p-3 bg-background rounded overflow-auto", children: `[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]` })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold mb-4", children: [
        "All songs (",
        songs.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card rounded-lg divide-y divide-border", children: [
        songs.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 bg-muted rounded overflow-hidden flex items-center justify-center", children: s.thumbnail_url ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-4 w-4 text-muted-foreground" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium truncate", children: cleanSongTitle(s.title) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
              s.artist,
              " · ",
              s.album || "—",
              " · ",
              s.genre || "—"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: formatDuration(s.duration) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { children: "Delete Song" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { children: [
                  "Are you sure you want to delete “",
                  cleanSongTitle(s.title),
                  "”? This will permanently remove the song from your library and delete its audio file from R2 storage."
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogCancel, { children: "Cancel" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogAction, { onClick: () => del.mutate(s), className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
              ] })
            ] })
          ] })
        ] }, s.id)),
        !songs.length && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 text-muted-foreground text-center", children: "No songs yet." })
      ] })
    ] })
  ] });
}
function StatusBadge({
  status
}) {
  const map = {
    pending: {
      label: "Pending",
      cls: "bg-muted text-muted-foreground"
    },
    parsing: {
      label: "Parsing",
      cls: "bg-muted text-muted-foreground"
    },
    ready: {
      label: "Ready",
      cls: "bg-primary/20 text-primary"
    },
    duplicate: {
      label: "Duplicate",
      cls: "bg-yellow-500/20 text-yellow-500"
    },
    uploading: {
      label: "Uploading",
      cls: "bg-primary/30 text-primary"
    },
    done: {
      label: "Uploaded",
      cls: "bg-green-500/20 text-green-500"
    },
    error: {
      label: "Error",
      cls: "bg-destructive/20 text-destructive"
    }
  };
  const {
    label,
    cls
  } = map[status];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${cls}`, children: label });
}
export {
  AdminPage as component
};
