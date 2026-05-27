import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Music, Loader2, FileAudio, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatDuration } from "@/lib/owner";
import { getR2UploadUrl, deleteR2Object, extractR2Metadata } from "@/lib/r2-upload.functions";
import { parseBlob } from "music-metadata";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Wavely — Admin" }] }),
  component: AdminPage,
});

const ADMIN_PASSWORD = "R771@2026";
const SESSION_KEY = "wavely_admin";

function AdminPage() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === "1");
  }, []);
  if (!authed) return <Layout><Gate onPass={() => setAuthed(true)} /></Layout>;
  return <Layout><AdminPanel /></Layout>;
}

function Gate({ onPass }: { onPass: () => void }) {
  const [pw, setPw] = useState("");
  return (
    <div className="p-6 max-w-sm mx-auto mt-20">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        if (pw === ADMIN_PASSWORD) {
          sessionStorage.setItem(SESSION_KEY, "1");
          onPass();
        } else toast.error("Wrong password");
      }} className="space-y-3">
        <Input type="password" placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <Button type="submit" className="w-full">Enter</Button>
      </form>
    </div>
  );
}

type QueueStatus = "pending" | "parsing" | "ready" | "duplicate" | "uploading" | "done" | "error";

type QueueItem = {
  id: string;
  file: File;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  thumbDataUrl: string | null;
  thumbBlob: Blob | null;
  status: QueueStatus;
  progress: number;
  error?: string;
  duplicateOf?: { id?: string; title: string; artist: string; source: "library" | "queue" };
};

function AdminPanel() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);

  const getUploadUrl = useServerFn(getR2UploadUrl);
  const deleteObj = useServerFn(deleteR2Object);
  const extractMeta = useServerFn(extractR2Metadata);

  const { data: songs = [] } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data } = await supabase.from("songs").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const updateItem = (id: string, patch: Partial<QueueItem>) =>
    setQueue((q) => q.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const normKey = (title: string, artist: string) =>
    `${title.trim().toLowerCase()}::${artist.trim().toLowerCase()}`;

  const checkDuplicate = (
    title: string,
    artist: string,
    selfId: string,
    currentQueue: QueueItem[],
    library: any[],
  ): QueueItem["duplicateOf"] | null => {
    const key = normKey(title, artist);
    if (!title || !artist) return null;
    const inLib = library.find((s) => normKey(s.title, s.artist) === key);
    if (inLib) return { id: inLib.id, title: inLib.title, artist: inLib.artist, source: "library" };
    const inQueue = currentQueue.find(
      (it) => it.id !== selfId && it.status !== "duplicate" && normKey(it.title, it.artist) === key,
    );
    if (inQueue) return { title: inQueue.title, artist: inQueue.artist, source: "queue" };
    return null;
  };

  const parseOne = async (item: QueueItem) => {
    updateItem(item.id, { status: "parsing" });
    try {
      const meta = await parseBlob(item.file);
      const c = meta.common;
      let thumbDataUrl: string | null = null;
      let thumbBlob: Blob | null = null;
      if (c.picture && c.picture[0]) {
        const pic = c.picture[0];
        thumbBlob = new Blob([new Uint8Array(pic.data)], { type: pic.format || "image/jpeg" });
        thumbDataUrl = URL.createObjectURL(thumbBlob);
      }
      const title = c.title || item.file.name.replace(/\.[^.]+$/, "");
      const artist = c.artist || c.albumartist || "Unknown Artist";
      updateItem(item.id, {
        title,
        artist,
        album: c.album || "",
        genre: (c.genre && c.genre[0]) || "",
        duration: Math.round(meta.format.duration || 0),
        thumbDataUrl,
        thumbBlob,
        status: "ready",
      });
    } catch (err) {
      console.error("Metadata parse failed:", err);
      const dur = await new Promise<number>((resolve) => {
        const a = document.createElement("audio");
        a.src = URL.createObjectURL(item.file);
        a.addEventListener("loadedmetadata", () => resolve(Math.round(a.duration || 0)));
        a.addEventListener("error", () => resolve(0));
      });
      updateItem(item.id, {
        title: item.file.name.replace(/\.[^.]+$/, ""),
        artist: "Unknown Artist",
        duration: dur,
        status: "ready",
      });
    }
  };

  const addFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith("audio/") || /\.(mp3|m4a|wav|flac|ogg|aac)$/i.test(f.name));
    if (!arr.length) return;
    const items: QueueItem[] = arr.map((file) => ({
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
      progress: 0,
    }));
    setQueue((q) => [...q, ...items]);
    // Parse all in parallel (fast, client-side)
    await Promise.all(items.map((it) => parseOne(it)));
    // Now run duplicate detection against library + queue
    setQueue((q) => {
      const next = [...q];
      for (const it of next) {
        if (it.status !== "ready") continue;
        const dup = checkDuplicate(it.title, it.artist, it.id, next, songs);
        if (dup) {
          const idx = next.findIndex((x) => x.id === it.id);
          next[idx] = { ...it, status: "duplicate", duplicateOf: dup };
        }
      }
      return next;
    });
  };

  const uploadBlob = (uploadUrl: string, blob: Blob, contentType: string, onProgress?: (p: number) => void) =>
    new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      xhr.onerror = () => reject(new Error("Network error (check R2 CORS)"));
      xhr.send(blob);
    });

  const uploadOne = async (item: QueueItem) => {
    updateItem(item.id, { status: "uploading", progress: 0, error: undefined });
    try {
      // Audio
      const audioInfo = await getUploadUrl({
        data: { filename: item.file.name, contentType: item.file.type || "audio/mpeg" },
      });
      await uploadBlob(audioInfo.uploadUrl, item.file, item.file.type || "audio/mpeg", (p) =>
        updateItem(item.id, { progress: p })
      );
      // Thumb
      let thumbUrl: string | null = null;
      if (item.thumbBlob) {
        const thumbInfo = await getUploadUrl({
          data: {
            filename: `cover-${Date.now()}.${item.thumbBlob.type.split("/")[1] || "jpg"}`,
            contentType: item.thumbBlob.type || "image/jpeg",
          },
        });
        await uploadBlob(thumbInfo.uploadUrl, item.thumbBlob, item.thumbBlob.type || "image/jpeg");
        thumbUrl = thumbInfo.publicUrl;
      }
      // Server fallback metadata
      let serverMeta: Awaited<ReturnType<typeof extractMeta>> | null = null;
      try {
        serverMeta = await extractMeta({ data: { url: audioInfo.publicUrl } });
      } catch (e) {
        console.warn("Server meta failed", e);
      }
      const duration =
        item.duration > 0 ? item.duration : serverMeta?.duration && serverMeta.duration > 0 ? serverMeta.duration : 0;
      const { error } = await supabase.from("songs").insert({
        title: item.title || serverMeta?.title || item.file.name.replace(/\.[^.]+$/, ""),
        artist: item.artist || serverMeta?.artist || "Unknown Artist",
        album: item.album || serverMeta?.album || null,
        genre: item.genre || serverMeta?.genre || null,
        duration,
        audio_url: audioInfo.publicUrl,
        thumbnail_url: thumbUrl,
      });
      if (error) throw error;
      updateItem(item.id, { status: "done", progress: 100 });
    } catch (e: any) {
      updateItem(item.id, { status: "error", error: e.message || "Upload failed" });
    }
  };

  const uploadAll = async () => {
    setBulkRunning(true);
    try {
      // Sequential to be gentle on R2 / bandwidth. Duplicates are skipped — user must explicitly override.
      const snapshot = queue.filter((it) => it.status === "ready" || it.status === "error");
      for (const it of snapshot) {
        // re-read latest from state via closure-safe lookup
        const latest = (await new Promise<QueueItem | undefined>((res) => {
          setQueue((q) => {
            res(q.find((x) => x.id === it.id));
            return q;
          });
        }));
        if (!latest) continue;
        if (!latest.title || !latest.artist) {
          updateItem(latest.id, { status: "error", error: "Title and artist required" });
          continue;
        }
        await uploadOne(latest);
      }
      qc.invalidateQueries({ queryKey: ["songs"] });
      toast.success("Bulk upload finished");
    } finally {
      setBulkRunning(false);
    }
  };

  const removeItem = (id: string) => setQueue((q) => q.filter((it) => it.id !== id));
  const clearDone = () => setQueue((q) => q.filter((it) => it.status !== "done"));

  const del = useMutation({
    mutationFn: async (s: any) => {
      const r2Pub = (s.audio_url as string).match(/\/songs\/.+$/)?.[0];
      if (r2Pub) {
        try { await deleteObj({ data: { key: r2Pub.replace(/^\//, "") } }); } catch {}
      }
      await supabase.from("songs").delete().eq("id", s.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
  });

  const readyCount = queue.filter((q) => q.status === "ready" || q.status === "error").length;
  const dupCount = queue.filter((q) => q.status === "duplicate").length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Bulk upload songs</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Drop multiple audio files. Metadata is auto-extracted; edit as needed, then upload all.
        </p>

        <div className="bg-card p-6 rounded-lg space-y-4">
          <label
            htmlFor="audio-files"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
            }}
          >
            <FileAudio className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm">
              Drop audio files or <span className="text-primary underline">browse</span> (multi-select supported)
            </div>
            <div className="text-xs text-muted-foreground">MP3, M4A, WAV, FLAC, OGG…</div>
            <input
              id="audio-files"
              ref={fileRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                if (fileRef.current) fileRef.current.value = "";
              }}
            />
          </label>

          {queue.length > 0 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {queue.length} file{queue.length === 1 ? "" : "s"} · {readyCount} ready · {queue.filter((q) => q.status === "done").length} uploaded
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={clearDone} disabled={bulkRunning}>Clear done</Button>
                <Button variant="ghost" size="sm" onClick={() => setQueue([])} disabled={bulkRunning}>Clear all</Button>
                <Button onClick={uploadAll} disabled={bulkRunning || readyCount === 0}>
                  {bulkRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  {bulkRunning ? "Uploading…" : `Upload all (${readyCount})`}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {queue.map((it) => (
              <div key={it.id} className="border border-border rounded-lg p-3 bg-background/50">
                <div className="flex gap-3">
                  <div className="h-20 w-20 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0">
                    {it.thumbDataUrl ? (
                      <img src={it.thumbDataUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Music className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="text-xs text-muted-foreground truncate">{it.file.name}</div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StatusBadge status={it.status} />
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(it.id)} disabled={it.status === "uploading"}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {it.status === "parsing" ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" /> Reading tags…
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        <Input className="h-8 text-xs" placeholder="Title" value={it.title} onChange={(e) => updateItem(it.id, { title: e.target.value })} disabled={it.status === "uploading"} />
                        <Input className="h-8 text-xs" placeholder="Artist" value={it.artist} onChange={(e) => updateItem(it.id, { artist: e.target.value })} disabled={it.status === "uploading"} />
                        <Input className="h-8 text-xs" placeholder="Album" value={it.album} onChange={(e) => updateItem(it.id, { album: e.target.value })} disabled={it.status === "uploading"} />
                        <Input className="h-8 text-xs" placeholder="Genre" value={it.genre} onChange={(e) => updateItem(it.id, { genre: e.target.value })} disabled={it.status === "uploading"} />
                        <Input className="h-8 text-xs" type="number" placeholder="Duration" value={it.duration} onChange={(e) => updateItem(it.id, { duration: Number(e.target.value) })} disabled={it.status === "uploading"} />
                      </div>
                    )}
                    {it.status === "uploading" && (
                      <div className="space-y-1">
                        <div className="h-1.5 bg-muted rounded overflow-hidden">
                          <div className="h-full bg-primary transition-all" style={{ width: `${it.progress}%` }} />
                        </div>
                        <div className="text-xs text-muted-foreground">{it.progress}%</div>
                      </div>
                    )}
                    {it.error && <div className="text-xs text-destructive">{it.error}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer">⚠️ R2 bucket needs CORS configured (one-time)</summary>
            <pre className="mt-2 p-3 bg-background rounded overflow-auto">{`[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]`}</pre>
          </details>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">All songs ({songs.length})</h2>
        <div className="bg-card rounded-lg divide-y divide-border">
          {songs.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3">
              <div className="h-10 w-10 bg-muted rounded overflow-hidden flex items-center justify-center">
                {s.thumbnail_url ? <img src={s.thumbnail_url} alt="" className="h-full w-full object-cover" /> : <Music className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground truncate">{s.artist} · {s.album || "—"} · {s.genre || "—"}</div>
              </div>
              <div className="text-xs text-muted-foreground">{formatDuration(s.duration)}</div>
              <Button size="icon" variant="ghost" onClick={() => del.mutate(s)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {!songs.length && <div className="p-6 text-muted-foreground text-center">No songs yet.</div>}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: QueueStatus }) {
  const map: Record<QueueStatus, { label: string; cls: string }> = {
    pending:   { label: "Pending",    cls: "bg-muted text-muted-foreground" },
    parsing:   { label: "Parsing",    cls: "bg-muted text-muted-foreground" },
    ready:     { label: "Ready",      cls: "bg-primary/20 text-primary" },
    duplicate: { label: "Duplicate",  cls: "bg-yellow-500/20 text-yellow-500" },
    uploading: { label: "Uploading",  cls: "bg-primary/30 text-primary" },
    done:      { label: "Uploaded",   cls: "bg-green-500/20 text-green-500" },
    error:     { label: "Error",      cls: "bg-destructive/20 text-destructive" },
  };
  const { label, cls } = map[status];
  return <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${cls}`}>{label}</span>;
}

