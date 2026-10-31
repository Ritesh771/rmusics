import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ListPlus,
  Loader2,
  CheckCircle2,
  Search,
  Clock,
  CloudDownload,
  Music,
  ExternalLink,
  Library,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cleanSongTitle } from "@/lib/song-utils";
import {
  fetchSpotifyPlaylist,
  syncSingleTrack,
  saveImportedPlaylist,
  type SpotifyPlaylistData,
} from "@/lib/spotify-import.functions";

export const Route = createFileRoute("/import")({
  head: () => ({ meta: [{ title: "Sonara — Import from Spotify" }] }),
  component: ImportSpotifyPage,
});

function SpotifyIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.494 17.305a.75.75 0 01-1.03.248c-2.822-1.724-6.375-2.114-10.558-1.159a.75.75 0 01-.334-1.462c4.58-1.045 8.514-.603 11.674 1.343a.75.75 0 01.248 1.03zm1.468-3.264a.938.938 0 01-1.288.309c-3.23-1.986-8.156-2.56-11.977-1.4a.938.938 0 01-.55-1.794c4.372-1.328 9.807-.684 13.506 1.597a.938.938 0 01.309 1.288zm.126-3.41c-3.874-2.3-10.264-2.512-13.978-1.385a1.125 1.125 0 11-.652-2.154c4.266-1.295 11.316-1.049 15.794 1.609a1.125 1.125 0 11-1.164 1.93z" />
    </svg>
  );
}

function clean(str: string) {
  return (str || "")
    .replace(/\s*-\s*SpotubeDL\.com/gi, "")
    .replace(/\s*[\(\[\{].*?[\)\]\}]\s*/g, " ")
    .replace(/[^a-z0-9]/gi, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function ImportSpotifyPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const getPlaylistFn = useServerFn(fetchSpotifyPlaylist);
  const syncTrackFn = useServerFn(syncSingleTrack);
  const savePlaylistFn = useServerFn(saveImportedPlaylist);

  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyPlaylistData | null>(null);

  // Form edit states
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

  // Live import & progress states
  const [modalOpen, setModalOpen] = useState(false);
  const [syncPhase, setSyncPhase] = useState<"idle" | "syncing" | "saving" | "complete" | "error">("idle");
  const [syncProgress, setSyncProgress] = useState(0); // 0 to 100
  const [syncStats, setSyncStats] = useState({
    current: 0,
    total: 0,
    synced: 0,
    matched: 0,
    failed: 0,
    currentTrackTitle: "",
    currentTrackArtist: "",
  });
  const [trackStatusMap, setTrackStatusMap] = useState<Record<number, "ready" | "syncing" | "synced" | "failed">>({});
  const [syncResult, setSyncResult] = useState<{ playlistId: string; name: string; totalTracks: number } | null>(null);
  const [syncErrorMessage, setSyncErrorMessage] = useState("");
  const cancelSyncRef = useRef(false);

  // Load existing songs library to match tracks
  const { data: librarySongs = [] } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("songs")
        .select("id, title, artist, audio_url, thumbnail_url, duration");
      if (error) throw error;
      return data ?? [];
    },
  });

  // Calculate matched tracks against Sonara's library
  const matchedList = useMemo(() => {
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
        matchedSong: match || null,
      };
    });
  }, [spotifyData, librarySongs]);

  const matchedCount = useMemo(
    () => matchedList.filter((it) => it.matchedSong !== null).length,
    [matchedList]
  );

  const handleFetch = async () => {
    const rawUrl = url.trim();
    if (!rawUrl) {
      toast.error("Please enter a valid Spotify playlist URL.");
      return;
    }

    setFetching(true);
    try {
      const data = await getPlaylistFn({ data: { url: rawUrl } });
      setSpotifyData(data);
      setPlaylistTitle(data.name || "Imported Playlist");
      setPlaylistDesc(data.description || `Imported from Spotify playlist (${data.name})`);
      setTrackStatusMap({});
      toast.success(`Loaded playlist "${data.name}" with ${data.tracks.length} tracks.`);
    } catch (err: any) {
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

    // Initial map: if matchedSong exists, marked as "ready", otherwise "pending"
    const initialStatus: Record<number, "ready" | "syncing" | "synced" | "failed"> = {};
    const songIdMap: Record<number, string> = {};
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
      currentTrackArtist: tracksToProcess[0]?.spotifyTrack.artist || "",
    });

    let newlySynced = 0;
    let failedCount = 0;

    // If all tracks are already in library, jump straight to saving
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
        const pct = Math.round(((i) / totalToSync) * 100);

        setSyncProgress(pct);
        setSyncStats((prev) => ({
          ...prev,
          current: currentNum,
          currentTrackTitle: track.title,
          currentTrackArtist: track.artist,
        }));
        setTrackStatusMap((prev) => ({ ...prev, [item.index]: "syncing" }));

        try {
          const res = await syncTrackFn({
            data: {
              track: {
                title: track.title,
                artist: track.artist,
                album: track.album,
                duration: track.duration,
                coverUrl: track.coverUrl,
              },
            },
          });

          songIdMap[item.index] = res.songId;
          if (res.isNew) newlySynced++;

          setTrackStatusMap((prev) => ({ ...prev, [item.index]: "synced" }));
          setSyncStats((prev) => ({ ...prev, synced: newlySynced }));
        } catch (err: any) {
          console.error(`Failed to sync "${track.title}":`, err);
          failedCount++;
          setTrackStatusMap((prev) => ({ ...prev, [item.index]: "failed" }));
          setSyncStats((prev) => ({ ...prev, failed: failedCount }));
        }
      }
    }

    setSyncProgress(100);
    setSyncPhase("saving");

    // Collect all final song IDs in order
    const orderedSongIds: string[] = [];
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
          songIds: orderedSongIds,
        },
      });

      qc.invalidateQueries({ queryKey: ["playlists"] });
      qc.invalidateQueries({ queryKey: ["songs"] });

      setSyncResult(result);
      setSyncPhase("complete");
      toast.success(`Created "${result.name}" with ${result.totalTracks} tracks.`);
    } catch (saveErr: any) {
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

  const filteredItems = useMemo(() => {
    if (!filterQuery.trim()) return matchedList;
    const q = filterQuery.toLowerCase();
    return matchedList.filter(
      (it) =>
        it.spotifyTrack.title.toLowerCase().includes(q) ||
        it.spotifyTrack.artist.toLowerCase().includes(q)
    );
  }, [matchedList, filterQuery]);

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-indigo-900/40 border border-violet-500/20 overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/30 text-[#1ED760] text-xs font-semibold uppercase tracking-wider">
              <SpotifyIcon className="h-4 w-4" />
              <span>Spotify Playlist Importer</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              Import from Spotify
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paste any public Spotify playlist URL to synchronize all its tracks to your personal library and streaming storage.
            </p>
          </div>
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-card/70 border border-border/80 rounded-2xl p-4 sm:p-6 shadow-md backdrop-blur space-y-3">
        <label className="text-sm font-semibold text-foreground">
          Spotify Playlist URL
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <SpotifyIcon className="h-5 w-5 text-[#1ED760]" />
            </div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://open.spotify.com/playlist/3TF3chMJ4Ecu4zqCvcO10d..."
              className="pl-11 h-12 bg-background/80 border-border text-sm rounded-xl focus-visible:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFetch();
              }}
            />
          </div>

          <Button
            onClick={() => handleFetch()}
            disabled={fetching || !url.trim()}
            className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shrink-0 shadow-sm cursor-pointer"
          >
            {fetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Fetching…</span>
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                <span>Fetch Playlist</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Playlist Preview & Import Actions */}
      {spotifyData && (
        <div className="space-y-6 animate-fade-in">
          {/* Playlist Info Card */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Cover Art */}
              <div className="relative h-44 w-44 rounded-2xl overflow-hidden bg-muted shadow-lg shrink-0 border border-border/80">
                {spotifyData.coverArt ? (
                  <img
                    src={spotifyData.coverArt}
                    alt={spotifyData.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-violet-950/40 text-violet-400">
                    <Music className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-0.5 rounded-md text-[10px] font-semibold text-white">
                  Spotify
                </div>
              </div>

              {/* Metadata & Edit Fields */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Playlist Title
                  </label>
                  <Input
                    value={playlistTitle}
                    onChange={(e) => setPlaylistTitle(e.target.value)}
                    className="h-10 text-base font-bold bg-background/80 rounded-lg"
                    placeholder="Playlist Title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <Textarea
                    value={playlistDesc}
                    onChange={(e) => setPlaylistDesc(e.target.value)}
                    rows={2}
                    className="text-xs bg-background/80 rounded-lg resize-none"
                    placeholder="Add an optional description"
                  />
                </div>

                {/* Summary Badges & Action */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/30">
                      {spotifyData.tracks.length} tracks
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      {matchedCount} / {spotifyData.tracks.length} ready in library
                    </span>
                    {spotifyData.tracks.length > matchedCount && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center gap-1">
                        <CloudDownload className="h-3 w-3" />
                        <span>
                          {spotifyData.tracks.length - matchedCount} will auto-sync to R2
                        </span>
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleStartSync}
                    disabled={importing || spotifyData.tracks.length === 0}
                    className="h-11 px-6 rounded-xl font-bold bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white gap-2 shadow-lg hover:shadow-purple-500/25 cursor-pointer transition-all"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Recreating & Syncing…</span>
                      </>
                    ) : (
                      <>
                        <ListPlus className="h-4 w-4" />
                        <span>
                          {matchedCount === spotifyData.tracks.length
                            ? `Create Playlist & Add ${spotifyData.tracks.length} Songs`
                            : `Create Playlist & Sync ${spotifyData.tracks.length} Songs`}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tracklist Preview Table */}
          <div className="bg-card/80 border border-border rounded-2xl p-5 sm:p-6 shadow-md backdrop-blur space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-foreground">
                Tracks in Spotify Playlist ({spotifyData.tracks.length})
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter tracks..."
                  className="pl-9 h-9 text-xs bg-background/70 rounded-lg"
                />
              </div>
            </div>

            {/* Table / List */}
            <div className="border border-border/70 rounded-xl overflow-hidden divide-y divide-border/60 max-h-[460px] overflow-y-auto">
              {filteredItems.map((item) => {
                const liveStatus = trackStatusMap[item.index];
                return (
                  <div
                    key={item.index}
                    className="flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-sm"
                  >
                    <span className="w-8 text-center text-xs font-mono text-muted-foreground shrink-0">
                      {item.index}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {cleanSongTitle(item.spotifyTrack.title)}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.spotifyTrack.artist}
                      </div>
                    </div>

                    <div className="text-xs font-mono text-muted-foreground shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(item.spotifyTrack.duration)}</span>
                    </div>

                    <div className="shrink-0 pl-2">
                      {liveStatus === "syncing" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-semibold animate-pulse">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          <span>Syncing audio...</span>
                        </span>
                      ) : liveStatus === "synced" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Uploaded to R2</span>
                        </span>
                      ) : liveStatus === "failed" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-semibold">
                          <span>Skipped</span>
                        </span>
                      ) : item.matchedSong ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Ready in library</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30 text-xs font-medium">
                          <CloudDownload className="h-3.5 w-3.5" />
                          <span>Auto-syncs to R2</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No tracks matched your search filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* IN-APP SYNCHRONIZATION & CONFIRMATION POPUP (Zero localhost alerts, pure shadcn UI) */}
      <Dialog open={modalOpen} onOpenChange={(open) => {
        // Prevent closing during active sync unless explicitly cancelled
        if (!open && (syncPhase === "syncing" || syncPhase === "saving")) {
          return;
        }
        setModalOpen(open);
      }}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-2xl p-6">
          {/* Phase 1: Active Syncing */}
          {(syncPhase === "syncing" || syncPhase === "saving") && (
            <div className="space-y-5 animate-fade-in">
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-fuchsia-500/20 shrink-0">
                    <CloudDownload className="h-5 w-5 animate-bounce" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg font-bold text-foreground">
                      {syncPhase === "saving" ? "Finalizing Playlist" : "Synchronizing Spotify Playlist"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                      {syncPhase === "saving"
                        ? "Saving track relationships and playlist metadata..."
                        : "Downloading high-resolution audio and streaming to R2"}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Progress Bar & Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">
                    {syncPhase === "saving"
                      ? "Complete"
                      : `Track ${syncStats.current} of ${syncStats.total}`}
                  </span>
                  <span className="text-primary font-bold tabular-nums">
                    {syncProgress}%
                  </span>
                </div>
                <div className="relative w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 transition-all duration-300 rounded-full shadow-xs"
                    style={{ width: `${syncProgress}%` }}
                  />
                </div>
              </div>

              {/* Current Track Card */}
              {syncPhase === "syncing" && syncStats.currentTrackTitle && (
                <div className="bg-background/80 border border-border/60 rounded-xl p-3 space-y-1">
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Currently processing
                  </div>
                  <div className="text-sm font-bold text-foreground truncate">
                    {cleanSongTitle(syncStats.currentTrackTitle)}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {syncStats.currentTrackArtist}
                  </div>
                </div>
              )}

              {/* Stats Chips */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs font-bold text-foreground tabular-nums">
                    {syncStats.matched}
                  </div>
                  <div className="text-[10px] text-muted-foreground">In Library</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs font-bold text-emerald-500 tabular-nums">
                    {syncStats.synced}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Synced to R2</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <div className="text-xs font-bold text-primary tabular-nums">
                    {Math.max(0, syncStats.total - syncStats.current)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">Remaining</div>
                </div>
              </div>

              {/* Notice */}
              <p className="text-[11px] text-muted-foreground/80 leading-relaxed text-center">
                Audio is encoded and delivered to your personal R2 streaming storage. Please keep this window open while synchronization finishes.
              </p>

              <DialogFooter>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSync}
                  className="w-full text-xs font-semibold cursor-pointer"
                >
                  Cancel Synchronization
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Phase 2: Completion Success */}
          {syncPhase === "complete" && syncResult && (
            <div className="space-y-5 animate-fade-in">
              <DialogHeader className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-extrabold text-foreground">
                  Playlist Imported Successfully
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  All tracks have been processed and saved to your Sonara library.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-background/80 border border-border/60 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Playlist Name</span>
                  <span className="font-bold text-foreground truncate max-w-[200px]">
                    {syncResult.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Tracks</span>
                  <span className="font-bold text-foreground">
                    {syncResult.totalTracks} songs
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Storage Destination</span>
                  <span className="font-semibold text-primary">Cloudflare R2 Master FLAC/M4A</span>
                </div>
              </div>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 text-xs font-semibold cursor-pointer"
                >
                  Done
                </Button>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    nav({ to: "/playlist/$id", params: { id: syncResult.playlistId } });
                  }}
                  className="flex-1 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Open Playlist</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Phase 3: Error */}
          {syncPhase === "error" && (
            <div className="space-y-5 animate-fade-in">
              <DialogHeader className="text-center space-y-2">
                <div className="mx-auto h-12 w-12 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <DialogTitle className="text-xl font-extrabold text-foreground">
                  Synchronization Issue
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {syncErrorMessage || "An error occurred while synchronizing the playlist."}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 text-xs font-semibold cursor-pointer"
                >
                  Close
                </Button>
                <Button
                  onClick={handleStartSync}
                  className="flex-1 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer shadow-sm"
                >
                  Try Again
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
