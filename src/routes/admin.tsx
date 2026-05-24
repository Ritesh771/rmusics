import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Upload, Music } from "lucide-react";
import { toast } from "sonner";
import { formatDuration } from "@/lib/owner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Wavely — Admin" }] }),
  component: AdminPage,
});

const ADMIN_PASSWORD = "admin123"; // simple gate; change in code
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
        <p className="text-xs text-muted-foreground">Default password: admin123 (edit in src/routes/admin.tsx)</p>
      </form>
    </div>
  );
}

function AdminPanel() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: "", artist: "", album: "", thumbnail_url: "",
    audio_url: "", duration: 0, genre: "",
  });

  const { data: songs = [] } = useQuery({
    queryKey: ["songs"],
    queryFn: async () => {
      const { data } = await supabase.from("songs").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const probeDuration = (url: string) => new Promise<number>((resolve) => {
    const a = document.createElement("audio");
    a.src = url;
    a.addEventListener("loadedmetadata", () => resolve(Math.round(a.duration || 0)));
    a.addEventListener("error", () => resolve(0));
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!form.title || !form.artist || !form.audio_url) {
        throw new Error("Title, artist, and audio URL are required");
      }
      let dur = form.duration;
      if (!dur) dur = await probeDuration(form.audio_url);
      const { error } = await supabase.from("songs").insert({ ...form, duration: dur });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Song added");
      qc.invalidateQueries({ queryKey: ["songs"] });
      setForm({ title: "", artist: "", album: "", thumbnail_url: "", audio_url: "", duration: 0, genre: "" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("songs").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["songs"] }),
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Add song</h1>
        <div className="bg-card p-6 rounded-lg space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Title*"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Artist*"><Input value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} /></Field>
            <Field label="Album"><Input value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} /></Field>
            <Field label="Genre"><Input value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} /></Field>
            <Field label="Thumbnail URL"><Input value={form.thumbnail_url} onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })} placeholder="https://..." /></Field>
            <Field label="Audio URL (R2)*"><Input value={form.audio_url} onChange={(e) => setForm({ ...form, audio_url: e.target.value })} placeholder="https://cdn.example.com/song.mp3" /></Field>
            <Field label="Duration (sec, auto-detected if blank)">
              <Input type="number" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })} />
            </Field>
          </div>
          <Button onClick={() => create.mutate()} disabled={create.isPending}>
            <Upload className="h-4 w-4 mr-2" />{create.isPending ? "Adding…" : "Add song"}
          </Button>
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
              <Button size="icon" variant="ghost" onClick={() => del.mutate(s.id)}>
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
