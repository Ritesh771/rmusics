import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { G as usePlayer, z as useAuth, B as Button, u as formatDuration } from "./router-SYh-4Vc5.mjs";
import { c as cleanSongTitle } from "./song-utils-CWgDAApr.mjs";
import { s as supabase } from "./client-CVcNEZ48.mjs";
import { b as useQueryClient, a as useQuery, u as useMutation } from "../_libs/tanstack__react-query.mjs";
import { S as SongMenu } from "./SongMenu-BuwJO59f.mjs";
import { I as Pause, K as Play, H as Heart } from "../_libs/lucide-react.mjs";
const SongRow = reactExports.memo(function SongRow2({ song, index, queue, showAlbum = true, inPlaylistId }) {
  const isCurrent = usePlayer((s) => s.queue[s.currentIndex]?.id === song.id);
  const isPlayingThis = usePlayer((s) => s.isPlaying && s.queue[s.currentIndex]?.id === song.id);
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: liked = [] } = useQuery({
    queryKey: ["liked", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("liked_songs").select("song_id");
      return data?.map((r) => r.song_id) ?? [];
    },
    enabled: !!user,
    staleTime: 1e3 * 60 * 10
  });
  const isLiked = liked.includes(song.id);
  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (isLiked) {
        await supabase.from("liked_songs").delete().eq("song_id", song.id).eq("user_id", user.id);
      } else {
        await supabase.from("liked_songs").insert({ song_id: song.id, user_id: user.id });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["liked"] })
  });
  const handlePlay = () => {
    const p = usePlayer.getState();
    if (p.queue[p.currentIndex]?.id === song.id) p.togglePlay();
    else p.playQueue(queue, index);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onClick: handlePlay,
      role: "button",
      tabIndex: 0,
      onKeyDown: (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handlePlay();
        }
      },
      className: "group grid grid-cols-[16px_4fr_3fr_minmax(0,1fr)_60px] items-center gap-4 px-4 py-2 rounded-md hover:bg-accent/50 cursor-pointer active:bg-accent/70 transition-colors select-none",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "group-hover:hidden", children: isPlayingThis ? "♪" : index + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
            e.stopPropagation();
            handlePlay();
          }, className: "hidden group-hover:inline", children: isPlayingThis ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-3.5 w-3.5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded bg-muted shrink-0 overflow-hidden", children: song.thumbnail_url && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: song.thumbnail_url, alt: "", className: "h-full w-full object-cover" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium truncate " + (isCurrent ? "text-primary" : ""), children: cleanSongTitle(song.title) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground truncate", children: song.artist })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-muted-foreground truncate", children: showAlbum ? song.album : song.genre }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "opacity-0 group-hover:opacity-100", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { size: "icon", variant: "ghost", className: "h-8 w-8", onClick: (e) => {
          e.stopPropagation();
          toggleLike.mutate();
        }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: isLiked ? "h-4 w-4 fill-primary text-primary" : "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-muted-foreground justify-end", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDuration(song.duration) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            SongMenu,
            {
              song,
              inPlaylistId,
              className: "opacity-0 group-hover:opacity-100 md:opacity-0 [@media(hover:none)]:opacity-100"
            }
          )
        ] })
      ]
    }
  );
});
export {
  SongRow as S
};
