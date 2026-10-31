import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { b as useQueryClient, a as useQuery } from "../_libs/tanstack__react-query.mjs";
import { u as useServerFn, c as createSsrRpc } from "./createSsrRpc-BHHX7Rzb.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { z as useAuth, I as Input, B as Button, D as Dialog, c as DialogContent, f as DialogHeader, g as DialogTitle, d as DialogDescription, e as DialogFooter } from "./router-SYh-4Vc5.mjs";
import { T as Textarea } from "./textarea-DTVw3Kh7.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { c as cleanSongTitle } from "./song-utils-CWgDAApr.mjs";
import { a as createServerFn } from "./server-D2YdkoOS.mjs";
import "../_libs/dnd-kit__core.mjs";
import "../_libs/dnd-kit__sortable.mjs";
import "../_libs/seroval.mjs";
import { s as LoaderCircle, S as Search, y as Music, i as CloudDownload, r as ListPlus, h as Clock, g as CircleCheck, k as ExternalLink, f as CircleAlert } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType, n as numberType, a as arrayType } from "../_libs/zod.mjs";
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
const fetchSpotifyPlaylist = createServerFn({
  method: "POST"
}).inputValidator((input) => objectType({
  url: stringType().min(5)
}).parse(input)).handler(createSsrRpc("5ffb07bfd8b55166548e72f1d82ec16c11e6de94eb2d6e9e95d0a27a8211c1ad"));
const importAndSyncSchema = objectType({
  playlistName: stringType().min(1),
  playlistDescription: stringType().optional(),
  coverArt: stringType().optional(),
  userId: stringType().min(1),
  tracks: arrayType(objectType({
    title: stringType(),
    artist: stringType(),
    album: stringType().optional(),
    duration: numberType().optional(),
    coverUrl: stringType().optional()
  }))
});
createServerFn({
  method: "POST"
}).inputValidator((input) => importAndSyncSchema.parse(input)).handler(createSsrRpc("28c9251783a34f9d83380141d9b3f4dc6bb961e505090e1908d40b43669246e8"));
const syncSingleTrackSchema = objectType({
  track: objectType({
    title: stringType(),
    artist: stringType(),
    album: stringType().optional(),
    duration: numberType().optional(),
    coverUrl: stringType().optional()
  })
});
const syncSingleTrack = createServerFn({
  method: "POST"
}).inputValidator((input) => syncSingleTrackSchema.parse(input)).handler(createSsrRpc("5af629546dd9ed3ab252147fba562371a9c9475662c52cc865768a7e37246ce8"));
const saveImportedPlaylistSchema = objectType({
  playlistName: stringType(),
  playlistDescription: stringType().optional(),
  coverArt: stringType().optional(),
  userId: stringType(),
  songIds: arrayType(stringType())
});
const saveImportedPlaylist = createServerFn({
  method: "POST"
}).inputValidator((input) => saveImportedPlaylistSchema.parse(input)).handler(createSsrRpc("fa144d4c2add10cf3e57578bfefee313b8cadc91c075486c0ddc16539fc2387a"));
function SpotifyIcon({
  className = "h-5 w-5"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className, viewBox: "0 0 24 24", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.305a.75.75 0 01-1.03.248c-2.822-1.724-6.375-2.114-10.558-1.159a.75.75 0 01-.334-1.462c4.58-1.045 8.514-.603 11.674 1.343a.75.75 0 01.248 1.03zm1.468-3.264a.938.938 0 01-1.288.309c-3.23-1.986-8.156-2.56-11.977-1.4a.938.938 0 01-.55-1.794c4.372-1.328 9.807-.684 13.506 1.597a.938.938 0 01.309 1.288zm.126-3.41c-3.874-2.3-10.264-2.512-13.978-1.385a1.125 1.125 0 11-.652-2.154c4.266-1.295 11.316-1.049 15.794 1.609a1.125 1.125 0 11-1.164 1.93z" }) });
}
function clean(str) {
  return (str || "").replace(/\s*-\s*SpotubeDL\.com/gi, "").replace(/\s*[\(\[\{].*?[\)\]\}]\s*/g, " ").replace(/[^a-z0-9]/gi, " ").replace(/\s+/g, " ").toLowerCase().trim();
}
function formatDuration(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function ImportSpotifyPage() {
  const {
    user
  } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const getPlaylistFn = useServerFn(fetchSpotifyPlaylist);
  const syncTrackFn = useServerFn(syncSingleTrack);
  const savePlaylistFn = useServerFn(saveImportedPlaylist);
  const [url, setUrl] = reactExports.useState("");
  const [fetching, setFetching] = reactExports.useState(false);
  const [importing, setImporting] = reactExports.useState(false);
  const [spotifyData, setSpotifyData] = reactExports.useState(null);
  const [playlistTitle, setPlaylistTitle] = reactExports.useState("");
  const [playlistDesc, setPlaylistDesc] = reactExports.useState("");
  const [filterQuery, setFilterQuery] = reactExports.useState("");
  const [modalOpen, setModalOpen] = reactExports.useState(false);
  const [syncPhase, setSyncPhase] = reactExports.useState("idle");
  const [syncProgress, setSyncProgress] = reactExports.useState(0);
  const [syncStats, setSyncStats] = reactExports.useState({
    current: 0,
    total: 0,
    synced: 0,
    matched: 0,
    failed: 0,
    currentTrackTitle: "",
    currentTrackArtist: ""
  });
  const [trackStatusMap, setTrackStatusMap] = reactExports.useState({});
  const [syncResult, setSyncResult] = reactExports.useState(null);
  const [syncErrorMessage, setSyncErrorMessage] = reactExports.useState("");
  const cancelSyncRef = reactExports.useRef(false);
  const {
    data: librarySongs = []
  } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("songs").select("id, title, artist, audio_url, thumbnail_url, duration");
      if (error) throw error;
      return data ?? [];
    }
  });
  const matchedList = reactExports.useMemo(() => {
    if (!spotifyData) return [];
    return spotifyData.tracks.map((track, index) => {
      const ct = clean(track.title);
      const ca = clean(track.artist);
      const match = librarySongs.find((song) => {
        const st = clean(song.title);
        const sa = clean(song.artist);
        if (ct === st) return true;
        if (ct.length >= 4 && (ct.includes(st) || st.includes(ct))) {
          const aTokens = ca.split(" ").filter((t) => t.length > 2);
          const sTokens = sa.split(" ").filter((t) => t.length > 2);
          if (aTokens.some((tok) => sTokens.includes(tok)) || aTokens.length === 0) return true;
        }
        return false;
      });
      return {
        index: index + 1,
        spotifyTrack: track,
        matchedSong: match || null
      };
    });
  }, [spotifyData, librarySongs]);
  const matchedCount = reactExports.useMemo(() => matchedList.filter((it) => it.matchedSong !== null).length, [matchedList]);
  const handleFetch = async () => {
    const rawUrl = url.trim();
    if (!rawUrl) {
      toast.error("Please enter a valid Spotify playlist URL.");
      return;
    }
    setFetching(true);
    try {
      const data = await getPlaylistFn({
        data: {
          url: rawUrl
        }
      });
      setSpotifyData(data);
      setPlaylistTitle(data.name || "Imported Playlist");
      setPlaylistDesc(data.description || `Imported from Spotify playlist (${data.name})`);
      setTrackStatusMap({});
      toast.success(`Loaded playlist "${data.name}" with ${data.tracks.length} tracks.`);
    } catch (err) {
      console.error("Fetch Spotify playlist error:", err);
      toast.error(err.message || "Failed to fetch Spotify playlist. Please ensure the playlist is public.");
    } finally {
      setFetching(false);
    }
  };
  const handleStartSync = async () => {
    if (!user) {
      toast.error("Please sign in to save playlists to your library.");
      return;
    }
    if (!spotifyData || spotifyData.tracks.length === 0) return;
    cancelSyncRef.current = false;
    setImporting(true);
    setModalOpen(true);
    setSyncPhase("syncing");
    setSyncProgress(0);
    setSyncErrorMessage("");
    setSyncResult(null);
    const initialStatus = {};
    const songIdMap = {};
    let initialMatched = 0;
    matchedList.forEach((it) => {
      if (it.matchedSong) {
        initialStatus[it.index] = "ready";
        songIdMap[it.index] = it.matchedSong.id;
        initialMatched++;
      }
    });
    setTrackStatusMap(initialStatus);
    const tracksToProcess = matchedList.filter((it) => !it.matchedSong);
    const totalToSync = tracksToProcess.length;
    setSyncStats({
      current: 0,
      total: totalToSync,
      synced: 0,
      matched: initialMatched,
      failed: 0,
      currentTrackTitle: tracksToProcess[0]?.spotifyTrack.title || "",
      currentTrackArtist: tracksToProcess[0]?.spotifyTrack.artist || ""
    });
    let newlySynced = 0;
    let failedCount = 0;
    if (totalToSync === 0) {
      setSyncProgress(100);
      setSyncPhase("saving");
    } else {
      for (let i = 0; i < tracksToProcess.length; i++) {
        if (cancelSyncRef.current) {
          setSyncPhase("idle");
          setImporting(false);
          setModalOpen(false);
          toast.info("Playlist import cancelled.");
          return;
        }
        const item = tracksToProcess[i];
        const track = item.spotifyTrack;
        const currentNum = i + 1;
        const pct = Math.round(i / totalToSync * 100);
        setSyncProgress(pct);
        setSyncStats((prev) => ({
          ...prev,
          current: currentNum,
          currentTrackTitle: track.title,
          currentTrackArtist: track.artist
        }));
        setTrackStatusMap((prev) => ({
          ...prev,
          [item.index]: "syncing"
        }));
        try {
          const res = await syncTrackFn({
            data: {
              track: {
                title: track.title,
                artist: track.artist,
                album: track.album,
                duration: track.duration,
                coverUrl: track.coverUrl
              }
            }
          });
          songIdMap[item.index] = res.songId;
          if (res.isNew) newlySynced++;
          setTrackStatusMap((prev) => ({
            ...prev,
            [item.index]: "synced"
          }));
          setSyncStats((prev) => ({
            ...prev,
            synced: newlySynced
          }));
        } catch (err) {
          console.error(`Failed to sync "${track.title}":`, err);
          failedCount++;
          setTrackStatusMap((prev) => ({
            ...prev,
            [item.index]: "failed"
          }));
          setSyncStats((prev) => ({
            ...prev,
            failed: failedCount
          }));
        }
      }
    }
    setSyncProgress(100);
    setSyncPhase("saving");
    const orderedSongIds = [];
    matchedList.forEach((it) => {
      const id = songIdMap[it.index];
      if (id) orderedSongIds.push(id);
    });
    if (orderedSongIds.length === 0) {
      setSyncPhase("error");
      setSyncErrorMessage("Unable to save tracks to the playlist. Please verify the playlist and try again.");
      setImporting(false);
      return;
    }
    try {
      const result = await savePlaylistFn({
        data: {
          playlistName: playlistTitle.trim() || spotifyData.name,
          playlistDescription: playlistDesc.trim() || `Imported from Spotify (${spotifyData.name})`,
          coverArt: spotifyData.coverArt,
          userId: user.id,
          songIds: orderedSongIds
        }
      });
      qc.invalidateQueries({
        queryKey: ["playlists"]
      });
      qc.invalidateQueries({
        queryKey: ["songs"]
      });
      setSyncResult(result);
      setSyncPhase("complete");
      toast.success(`Created "${result.name}" with ${result.totalTracks} tracks.`);
    } catch (saveErr) {
      console.error("Save playlist error:", saveErr);
      setSyncPhase("error");
      setSyncErrorMessage(saveErr.message || "Failed to create playlist in library.");
    } finally {
      setImporting(false);
    }
  };
  const handleCancelSync = () => {
    cancelSyncRef.current = true;
    setModalOpen(false);
    setImporting(false);
    setSyncPhase("idle");
  };
  const filteredItems = reactExports.useMemo(() => {
    if (!filterQuery.trim()) return matchedList;
    const q = filterQuery.toLowerCase();
    return matchedList.filter((it) => it.spotifyTrack.title.toLowerCase().includes(q) || it.spotifyTrack.artist.toLowerCase().includes(q));
  }, [matchedList, filterQuery]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-indigo-900/40 border border-violet-500/20 overflow-hidden shadow-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-12 -right-12 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 max-w-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/30 text-[#1ED760] text-xs font-semibold uppercase tracking-wider", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(SpotifyIcon, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Spotify Playlist Importer" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground", children: "Import from Spotify" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground leading-relaxed", children: "Paste any public Spotify playlist URL to synchronize all its tracks to your personal library and streaming storage." })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/70 border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md backdrop-blur space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-sm font-semibold text-foreground", children: "Spotify Playlist URL" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SpotifyIcon, { className: "h-5 w-5 text-[#1ED760]" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: url, onChange: (e) => setUrl(e.target.value), placeholder: "https://open.spotify.com/playlist/3TF3chMJ4Ecu4zqCvcO10d...", className: "pl-11 h-12 bg-background/80 border-border text-sm rounded-xl focus-visible:ring-primary", onKeyDown: (e) => {
            if (e.key === "Enter") handleFetch();
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => handleFetch(), disabled: fetching || !url.trim(), className: "h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shrink-0 shadow-sm cursor-pointer", children: fetching ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Fetching…" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Fetch Playlist" })
        ] }) })
      ] })
    ] }),
    spotifyData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card/80 border border-border rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-44 w-44 rounded-2xl overflow-hidden bg-muted shadow-lg shrink-0 border border-border/80", children: [
          spotifyData.coverArt ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: spotifyData.coverArt, alt: spotifyData.name, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full w-full flex items-center justify-center bg-violet-950/40 text-violet-400", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Music, { className: "h-12 w-12" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 right-2 bg-black/75 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white", children: "Spotify" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Playlist Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: playlistTitle, onChange: (e) => setPlaylistTitle(e.target.value), className: "h-10 text-base font-bold bg-background/80 rounded-lg", placeholder: "Playlist Title" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider", children: "Description (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { value: playlistDesc, onChange: (e) => setPlaylistDesc(e.target.value), rows: 2, className: "text-xs bg-background/80 rounded-lg resize-none", placeholder: "Add an optional description" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30", children: [
                spotifyData.tracks.length,
                " tracks"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30", children: [
                matchedCount,
                " / ",
                spotifyData.tracks.length,
                " ready in library"
              ] }),
              spotifyData.tracks.length > matchedCount && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  spotifyData.tracks.length - matchedCount,
                  " will auto-sync to R2"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleStartSync, disabled: importing || spotifyData.tracks.length === 0, className: "h-11 px-6 rounded-xl font-bold bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white gap-2 shadow-lg hover:shadow-purple-500/25 cursor-pointer transition-all", children: importing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Recreating & Syncing…" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListPlus, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: matchedCount === spotifyData.tracks.length ? `Create Playlist & Add ${spotifyData.tracks.length} Songs` : `Create Playlist & Sync ${spotifyData.tracks.length} Songs` })
            ] }) })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card/80 border border-border rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-foreground", children: [
            "Tracks in Spotify Playlist (",
            spotifyData.tracks.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-64", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: filterQuery, onChange: (e) => setFilterQuery(e.target.value), placeholder: "Filter tracks...", className: "pl-9 h-9 text-xs bg-background/70 rounded-lg" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border/70 rounded-xl overflow-hidden divide-y divide-border/60 max-h-[460px] overflow-y-auto", children: [
          filteredItems.map((item) => {
            const liveStatus = trackStatusMap[item.index];
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-8 text-center text-xs font-mono text-muted-foreground shrink-0", children: item.index }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-foreground truncate", children: cleanSongTitle(item.spotifyTrack.title) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: item.spotifyTrack.artist })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-mono text-muted-foreground shrink-0 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDuration(item.spotifyTrack.duration) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "shrink-0 pl-2", children: liveStatus === "syncing" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-semibold animate-pulse", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Syncing audio..." })
              ] }) : liveStatus === "synced" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Uploaded to R2" })
              ] }) : liveStatus === "failed" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Skipped" }) }) : item.matchedSong ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-semibold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Ready in library" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30 text-xs font-medium", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-3.5 w-3.5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Auto-syncs to R2" })
              ] }) })
            ] }, item.index);
          }),
          filteredItems.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center text-sm text-muted-foreground", children: "No tracks matched your search filter." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open: modalOpen, onOpenChange: (open) => {
      if (!open && (syncPhase === "syncing" || syncPhase === "saving")) {
        return;
      }
      setModalOpen(open);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { className: "sm:max-w-md bg-card/95 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-2xl p-6", children: [
      (syncPhase === "syncing" || syncPhase === "saving") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 animate-fade-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { className: "space-y-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownload, { className: "h-5 w-5 animate-bounce" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-lg font-bold text-foreground", children: syncPhase === "saving" ? "Finalizing Playlist" : "Synchronizing Spotify Playlist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs text-muted-foreground", children: syncPhase === "saving" ? "Saving track relationships and playlist metadata..." : "Downloading high-resolution audio and streaming to R2" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: syncPhase === "saving" ? "Complete" : `Track ${syncStats.current} of ${syncStats.total}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-bold tabular-nums", children: [
              syncProgress,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-2.5 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 transition-all duration-300 rounded-full shadow-xs", style: {
            width: `${syncProgress}%`
          } }) })
        ] }),
        syncPhase === "syncing" && syncStats.currentTrackTitle && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background/80 border border-border/60 rounded-xl p-3 space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider", children: "Currently processing" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold text-foreground truncate", children: cleanSongTitle(syncStats.currentTrackTitle) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: syncStats.currentTrackArtist })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 rounded-lg p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-foreground tabular-nums", children: syncStats.matched }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "In Library" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 rounded-lg p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-emerald-500 tabular-nums", children: syncStats.synced }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Synced to R2" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-muted/50 rounded-lg p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-primary tabular-nums", children: Math.max(0, syncStats.total - syncStats.current) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Remaining" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground/80 leading-relaxed text-center", children: "Audio is encoded and delivered to your personal R2 streaming storage. Please keep this window open while synchronization finishes." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", size: "sm", onClick: handleCancelSync, className: "w-full text-xs font-semibold cursor-pointer", children: "Cancel Synchronization" }) })
      ] }),
      syncPhase === "complete" && syncResult && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 animate-fade-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl font-extrabold text-foreground", children: "Playlist Imported Successfully" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs text-muted-foreground", children: "All tracks have been processed and saved to your Sonara library." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-background/80 border border-border/60 rounded-xl p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Playlist Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground truncate max-w-[200px]", children: syncResult.name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Total Tracks" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-foreground", children: [
              syncResult.totalTracks,
              " songs"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Storage Destination" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-primary", children: "Cloudflare R2 Master FLAC/M4A" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex flex-col sm:flex-row gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), className: "flex-1 text-xs font-semibold cursor-pointer", children: "Done" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: () => {
            setModalOpen(false);
            nav({
              to: "/playlist/$id",
              params: {
                id: syncResult.playlistId
              }
            });
          }, className: "flex-1 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Open Playlist" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-3.5 w-3.5" })
          ] })
        ] })
      ] }),
      syncPhase === "error" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 animate-fade-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, { className: "text-center space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-12 w-12 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-xl font-extrabold text-foreground", children: "Synchronization Issue" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { className: "text-xs text-muted-foreground", children: syncErrorMessage || "An error occurred while synchronizing the playlist." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, { className: "flex flex-col sm:flex-row gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: () => setModalOpen(false), className: "flex-1 text-xs font-semibold cursor-pointer", children: "Close" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: handleStartSync, className: "flex-1 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm", children: "Try Again" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  ImportSpotifyPage as component
};
