import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { G as usePlayer, z as useAuth, h as DropdownMenu, o as DropdownMenuTrigger, B as Button, t as cn, i as DropdownMenuContent, j as DropdownMenuItem, k as DropdownMenuSeparator, l as DropdownMenuSub, n as DropdownMenuSubTrigger, m as DropdownMenuSubContent } from "./router-SYh-4Vc5.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { b as useQueryClient, a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { E as Ellipsis, p as ListEnd, r as ListPlus, N as Plus, H as Heart, U as Share2, $ as Trash2 } from "../_libs/lucide-react.mjs";
function SongMenu({ song, inPlaylistId, trigger, align = "end", className }) {
  const addToQueue = usePlayer((s) => s.addToQueue);
  const playNext = usePlayer((s) => s.playNext);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("playlists").select("id, name").eq("user_id", user.id);
      return data ?? [];
    },
    enabled: !!user
  });
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
      if (isLiked) await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      else await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] })
  });
  const addToPlaylist = useMutation({
    mutationFn: async (playlistId) => {
      await supabase.from("playlist_songs").insert({ playlist_id: playlistId, song_id: song.id });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist"] });
      toast.success("Added to playlist");
    },
    onError: () => toast.error("Already in playlist")
  });
  const removeFromPlaylist = useMutation({
    mutationFn: async () => {
      if (!inPlaylistId) return;
      await supabase.from("playlist_songs").delete().eq("playlist_id", inPlaylistId).eq("song_id", song.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["playlist", inPlaylistId] });
      toast.success("Removed from playlist");
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, onClick: (e) => e.stopPropagation(), children: trigger ?? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: cn("h-8 w-8", className), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "h-4 w-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align, onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => {
        playNext(song);
        toast.success("Playing next");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListEnd, { className: "h-4 w-4 mr-2" }),
        "Play next"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => {
        addToQueue(song);
        toast.success("Added to queue");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListPlus, { className: "h-4 w-4 mr-2" }),
        "Add to queue"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuSub, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuSubTrigger, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
          "Add to playlist"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuSubContent, { children: [
          playlists.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { disabled: true, children: "No playlists yet" }),
          playlists.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuItem, { onClick: () => addToPlaylist.mutate(p.id), children: p.name }, p.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => toggleLike.mutate(), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: cn("h-4 w-4 mr-2", isLiked && "fill-primary text-primary") }),
        isLiked ? "Unlike" : "Like"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/song/${song.id}`);
        toast.success("Link copied");
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4 w-4 mr-2" }),
        "Share"
      ] }),
      inPlaylistId && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => removeFromPlaylist.mutate(), className: "text-destructive", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4 mr-2" }),
          "Remove from playlist"
        ] })
      ] })
    ] })
  ] });
}
export {
  SongMenu as S
};
