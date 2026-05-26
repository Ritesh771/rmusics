import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, Music, Loader2, FileAudio } from "lucide-react";
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

type Draft = {
  file: File | null;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  thumbDataUrl: string | null; // preview
  thumbBlob: Blob | null;      // upload
};

const emptyDraft: Draft = {
  file: null, title: "", artist: "", album: "", genre: "",
  duration: 0, thumbDataUrl: null, thumbBlob: null,
};

function AdminPanel() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleFile = async (file: File) => {
    setDraft({ ...emptyDraft, file });
    setParsing(true);
    try {
      const meta = await parseBlob(file);
      const c = meta.common;
      let thumbDataUrl: string | null = null;
      let thumbBlob: Blob | null = null;
      if (c.picture && c.picture[0]) {
        const pic = c.picture[0];
        thumbBlob = new Blob([new Uint8Array(pic.data)], { type: pic.format || "image/jpeg" });
        thumbDataUrl = URL.createObjectURL(thumbBlob);
      }
      setDraft({
        file,
        title: c.title || file.name.replace(/\.[^.]+$/, ""),
        artist: c.artist || c.albumartist || "Unknown Artist",
        album: c.album || "",
        genre: (c.genre && c.genre[0]) || "",
        duration: Math.round(meta.format.duration || 0),
        thumbDataUrl,
        thumbBlob,
      });
    } catch (err) {
      console.error("Metadata parse failed:", err);
      // fallback: probe duration via audio element
      const dur = await new Promise<number>((resolve) => {
        const a = document.createElement("audio");
        a.src = URL.createObjectURL(file);
        a.addEventListener("loadedmetadata", () => resolve(Math.round(a.duration || 0)));
        a.addEventListener("error", () => resolve(0));
      });
      setDraft({
        ...emptyDraft, file, duration: dur,
        title: file.name.replace(/\.[^.]+$/, ""),
        artist: "Unknown Artist",
      });
      toast.warning("Couldn't read tags — fill in manually");
    } finally {
      setParsing(false);
    }
  };

  const uploadToR2 = async (blob: Blob, filename: string, contentType: string): Promise<string> => {
    const { uploadUrl, publicUrl } = await getUploadUrl({
      data: { filename, contentType },
    });
    // Use XHR for progress
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () =>
        xhr.status >= 200 && xhr.status < 300
          ? resolve()
          : reject(new Error(`Upload failed: ${xhr.status} ${xhr.responseText}`));
      xhr.onerror = () => reject(new Error("Network error during upload (check R2 bucket CORS)"));
      xhr.send(blob);
    });
    return publicUrl;
  };

  const submit = async () => {
    if (!draft.file) return toast.error("Pick an audio file");
    if (!draft.title || !draft.artist) return toast.error("Title and artist required");
    setUploading(true);
    setProgress(0);
    try {
      const audioUrl = await uploadToR2(
        draft.file,
        draft.file.name,
        draft.file.type || "audio/mpeg"
      );
      let thumbUrl: string | null = null;
      if (draft.thumbBlob) {
        setProgress(0);
        thumbUrl = await uploadToR2(
          draft.thumbBlob,
          `cover-${Date.now()}.${(draft.thumbBlob.type.split("/")[1] || "jpg")}`,
          draft.thumbBlob.type || "image/jpeg"
        );
      }
      // Server-side metadata extraction as a fallback so duration (and other
      // tags) is always correct, even if client-side parsing failed.
      let serverMeta: Awaited<ReturnType<typeof extractMeta>> | null = null;
      try {
        serverMeta = await extractMeta({ data: { url: audioUrl } });
      } catch (e) {
        console.warn("Server metadata fallback failed", e);
      }
      const duration =
        draft.duration > 0
          ? draft.duration
          : serverMeta?.duration && serverMeta.duration > 0
            ? serverMeta.duration
            : 0;
      const { error } = await supabase.from("songs").insert({
        title: draft.title || serverMeta?.title || draft.file.name.replace(/\.[^.]+$/, ""),
        artist: draft.artist || serverMeta?.artist || "Unknown Artist",
        album: draft.album || serverMeta?.album || null,
        genre: draft.genre || serverMeta?.genre || null,
        duration,
        audio_url: audioUrl,
        thumbnail_url: thumbUrl,
      });
      if (error) throw error;
      toast.success("Song uploaded");
      qc.invalidateQueries({ queryKey: ["songs"] });
      setDraft(emptyDraft);
      if (fileRef.current) fileRef.current.value = "";
    } catch (e: any) {
      toast.error(e.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const del = useMutation({
    mutationFn: async (s: any) => {
      // Delete from R2 (best-effort) if URL matches our R2 public base
      const r2Pub = (s.audio_url as string).match(/\/songs\/.+$/)?.[0];
      if (r2Pub) {
        try { await deleteObj({ data: { key: r2Pub.replace(/^\//, "") } }); } catch {}
      }
      await supabase.from("songs").delete().eq("id", s.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-1">Upload song</h1>
        <p className="text-sm text-muted-foreground mb-4">
          Audio uploads go directly to your R2 bucket. Metadata is auto-extracted.
        </p>

        <div className="bg-card p-6 rounded-lg space-y-4">
          {/* File picker / dropzone */}
          <label
            htmlFor="audio-file"
            className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary/50 transition"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
          >
            <FileAudio className="h-10 w-10 text-muted-foreground" />
            <div className="text-sm">
              {draft.file ? (
                <span className="font-medium">{draft.file.name}</span>
              ) : (
                <>Drop audio file or <span className="text-primary underline">browse</span></>
              )}
            </div>
            <div className="text-xs text-muted-foreground">MP3, M4A, WAV, FLAC, OGG…</div>
            <input
              id="audio-file"
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>

          {parsing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Extracting metadata…
            </div>
          )}

          {draft.file && !parsing && (
            <div className="flex gap-4">
              <div className="h-32 w-32 rounded bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {draft.thumbDataUrl ? (
                  <img src={draft.thumbDataUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Music className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <Field label="Title"><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></Field>
                <Field label="Artist"><Input value={draft.artist} onChange={(e) => setDraft({ ...draft, artist: e.target.value })} /></Field>
                <Field label="Album"><Input value={draft.album} onChange={(e) => setDraft({ ...draft, album: e.target.value })} /></Field>
                <Field label="Genre"><Input value={draft.genre} onChange={(e) => setDraft({ ...draft, genre: e.target.value })} /></Field>
                <Field label={`Duration (${formatDuration(draft.duration)})`}>
                  <Input type="number" value={draft.duration} onChange={(e) => setDraft({ ...draft, duration: Number(e.target.value) })} />
                </Field>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-xs text-muted-foreground">Uploading to R2… {progress}%</div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={submit} disabled={!draft.file || uploading || parsing}>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              {uploading ? "Uploading…" : "Upload to R2 & save"}
            </Button>
            {draft.file && !uploading && (
              <Button variant="ghost" onClick={() => { setDraft(emptyDraft); if (fileRef.current) fileRef.current.value = ""; }}>
                Clear
              </Button>
            )}
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
            <p className="mt-2">Cloudflare Dashboard → R2 → your bucket → Settings → CORS Policy. Paste the JSON above. For production, replace <code>*</code> with your domain.</p>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
