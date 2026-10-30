import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-hook";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ListPlus,
  Loader2,
  CheckCircle2,
  Search,
  Clock,
  CloudDownload,
  Music,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchSpotifyPlaylist,
  importAndSyncSpotifyPlaylist,
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
  const syncAndImportFn = useServerFn(importAndSyncSpotifyPlaylist);

  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [importing, setImporting] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyPlaylistData | null>(null);

  // Form edit states
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistDesc, setPlaylistDesc] = useState("");
  const [filterQuery, setFilterQuery] = useState("");

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
      toast.error("Please enter a Spotify playlist link.");
      return;
    }

    setFetching(true);
    try {
      const data = await getPlaylistFn({ data: { url: rawUrl } });
      setSpotifyData(data);
      setPlaylistTitle(data.name || "Imported Playlist");
      setPlaylistDesc(data.description || `Imported from Spotify playlist (${data.name})`);
      toast.success(`Found "${data.name}" with ${data.tracks.length} songs!`);
    } catch (err: any) {
      console.error("Fetch Spotify playlist error:", err);
      toast.error(err.message || "Failed to fetch Spotify playlist. Make sure the link is public.");
    } finally {
      setFetching(false);
    }
  };

  const handleCreatePlaylist = async () => {
    if (!user) {
      toast.error("Please log in to save playlists.");
      return;
    }
    if (!spotifyData || spotifyData.tracks.length === 0) return;

    setImporting(true);
    try {
      const result = await syncAndImportFn({
        data: {
          playlistName: playlistTitle.trim() || spotifyData.name,
          playlistDescription: playlistDesc.trim() || `Imported from Spotify (${spotifyData.name})`,
          coverArt: spotifyData.coverArt,
          userId: user.id,
          tracks: spotifyData.tracks.map((t) => ({
            title: t.title,
            artist: t.artist,
            album: t.album,
            duration: t.duration,
            coverUrl: t.coverUrl,
          })),
        },
      });

      qc.invalidateQueries({ queryKey: ["playlists"] });
      qc.invalidateQueries({ queryKey: ["songs"] });

      if (result.newlyDownloaded > 0) {
        toast.success(
          `🎉 Created "${result.name}" with ${result.totalTracks} songs (${result.newlyDownloaded} uploaded to R2)!`
        );
      } else {
        toast.success(`🎉 Created "${result.name}" with all ${result.totalTracks} songs!`);
      }

      nav({ to: "/playlist/$id", params: { id: result.playlistId } });
    } catch (err: any) {
      console.error("Create playlist error:", err);
      toast.error(err.message || "Failed to create playlist.");
    } finally {
      setImporting(false);
    }
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
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950/80 via-purple-900/60 to-zinc-900/90 border border-violet-800/40 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1ED760]/15 border border-[#1ED760]/30 text-[#1ED760] text-xs font-semibold uppercase tracking-wider">
                <SpotifyIcon className="h-4 w-4" />
                <span>Spotify Playlist Importer</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Import from Spotify
              </h1>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Paste any public Spotify playlist URL to instantly recreate it in Sonara and sync its songs into your library.
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
                placeholder="https://open.spotify.com/playlist/7DoHEKk2kBXpnZjpERHYR4..."
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
                      onClick={handleCreatePlaylist}
                      disabled={importing || spotifyData.tracks.length === 0}
                      className="h-11 px-6 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white gap-2 shadow-lg hover:shadow-violet-500/25 cursor-pointer"
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
                {filteredItems.map((item) => (
                  <div
                    key={item.index}
                    className="flex items-center gap-3 p-3 hover:bg-accent/40 transition-colors text-sm"
                  >
                    <span className="w-8 text-center text-xs font-mono text-muted-foreground shrink-0">
                      {item.index}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">
                        {item.spotifyTrack.title}
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
                      {item.matchedSong ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Ready</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30 text-xs font-medium">
                          <CloudDownload className="h-3.5 w-3.5" />
                          <span>Auto-syncs to R2</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {filteredItems.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No tracks matched your search filter.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
