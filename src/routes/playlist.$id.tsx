import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { SongRow } from "@/components/SongRow";
import { Music, Play, Pencil, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlayer, type Song } from "@/lib/player-store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/playlist/$id")({
  component: PlaylistPage,
});

function PlaylistPage() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const playQueue = usePlayer((s) => s.playQueue);

  const { data: playlist } = useQuery({
    queryKey: ["playlist", id, "meta"],
    queryFn: async () => {
      const { data, error } = await supabase.from("playlists").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: songs = [] } = useQuery({
    queryKey: ["playlist", id, "songs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("playlist_songs")
        .select("position, added_at, songs(*)")
        .eq("playlist_id", id)
        .order("added_at", { ascending: true });
      return (data ?? []).map((r: any) => r.songs as Song).filter(Boolean);
    },
  });

  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cover, setCover] = useState("");

  const openEdit = () => {
    setName(playlist?.name ?? "");
    setDesc(playlist?.description ?? "");
    setCover(playlist?.cover_url ?? "");
    setEditOpen(true);
  };

  const save = useMutation({
    mutationFn: async () => {
      await supabase.from("playlists").update({
        name, description: desc || null, cover_url: cover || null, updated_at: new Date().toISOString(),
      }).eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist", id] });
      qc.invalidateQueries({ queryKey: ["playlists"] });
      setEditOpen(false);
      toast.success("Playlist updated");
    },
  });

  const del = useMutation({
    mutationFn: async () => {
      await supabase.from("playlists").delete().eq("id", id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlists"] });
      toast.success("Playlist deleted");
      nav({ to: "/library" });
    },
  });

  if (!playlist) return <Layout><div className="p-6">Loading…</div></Layout>;

  return (
    <Layout>
      <div className="bg-gradient-to-b from-primary/30 to-transparent p-6 pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <div className="h-44 w-44 bg-muted rounded shadow-2xl overflow-hidden flex items-center justify-center">
            {playlist.cover_url ? (
              <img src={playlist.cover_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Music className="h-20 w-20 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase">Playlist</div>
            <h1 className="text-5xl font-extrabold mt-2">{playlist.name}</h1>
            {playlist.description && <p className="text-muted-foreground mt-2">{playlist.description}</p>}
            <div className="text-sm text-muted-foreground mt-2">{songs.length} songs</div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:scale-105 transition"
            onClick={() => playQueue(songs)}
            disabled={!songs.length}
          >
            <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={openEdit}><Pencil className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied");
          }}><Share2 className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" onClick={() => {
            if (confirm("Delete this playlist?")) del.mutate();
          }}><Trash2 className="h-5 w-5" /></Button>
        </div>
        <div className="space-y-1">
          {songs.map((s, i) => (
            <SongRow key={s.id} song={s} index={i} queue={songs} inPlaylistId={id} />
          ))}
          {!songs.length && <div className="text-muted-foreground">No songs yet. Add some from your library.</div>}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit playlist</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Input placeholder="Cover image URL" value={cover} onChange={(e) => setCover(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => save.mutate()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
