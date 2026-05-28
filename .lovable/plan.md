# Plan: Google Auth + Per-User Data + Queue Panel

## 1. Authentication (Google + Supabase)
- Enable Google provider via `supabase--configure_social_auth`.
- Create `/login` route with "Continue with Google" button using `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`.
- Add `useAuth` hook (subscribe to `onAuthStateChange` + `getUser`).
- Wrap app: redirect unauthenticated users to `/login` (except `/login`).
- Add **profile dropdown** in Sidebar header showing avatar (from `user.user_metadata.avatar_url`), name, email, and Logout button.
- Add `onAuthStateChange` at root to invalidate queries on sign-in/out.

## 2. Database migration (per-user, RLS)
Drop public-permissive policies. New schema:

- `profiles` (id=auth.uid, email, display_name, avatar_url) — auto-created via trigger on `auth.users` insert.
- `playlists` — add `user_id uuid` (auth.uid), `is_public bool default false`. Replace `owner_key`.
- `liked_songs` — add `user_id`, drop `owner_key`.
- `recently_played` (new) — `user_id`, `song_id`, `played_at`.
- `user_queue` (new) — `user_id` (PK), `queue jsonb`, `current_index int`, `shuffle bool`, `repeat text`, `progress numeric`, `sleep_until timestamptz`, `updated_at`.
- `songs` — keep public read; restrict writes to admin (keep current for now since admin password gated).
- `playlist_songs` — RLS via playlist ownership (or public read if playlist.is_public).

All policies scoped to `auth.uid() = user_id`. Public read for `is_public = true` playlists.

## 3. Server functions (createServerFn + requireSupabaseAuth)
- `getMyPlaylists`, `createPlaylist`, `updatePlaylist`, `deletePlaylist`, `addSongToPlaylist`, `removeSongFromPlaylist`.
- `getLikedSongs`, `toggleLike`.
- `getRecentlyPlayed`, `recordPlay`.
- `saveQueueState`, `loadQueueState`.
- Wire `attachSupabaseAuth` in `src/start.ts`.

## 4. Client refactor
- Replace all `getOwnerKey()` usage with auth user id / server fns.
- `player-store.ts`: on song change → call `recordPlay`; debounced save of queue/shuffle/repeat/index/progress; on app boot → `loadQueueState` and hydrate.
- `SongMenu`, `NowPlaying`, `liked.tsx`, `library.tsx`, `playlist.$id.tsx`, `admin.tsx` — update to use auth-gated data.

## 5. New routes
- `/login` — Google sign-in screen, Spotify-style.
- `/history` — recently played list.
- Profile dropdown links to `/library` + `/history` + Logout.

## 6. Queue icon in Player (mini-player)
- Add list icon button in `Player.tsx` (desktop right side) that opens an inline queue panel (slide-up sheet on mobile, side panel on desktop) showing **Now Playing + Next Up** with:
  - Drag handle (dnd-kit) for reordering.
  - Remove button per item.
  - Click to jump.
- Reuse logic from NowPlaying queue panel; extract into shared `<QueueList>` component with reorder support.
- Add `reorderQueue(from, to)` and `removeFromQueue(index)` to player store.

## 7. UI polish
- Spotify-green primary, premium dark gradient already present.
- Profile dropdown: shadcn DropdownMenu with avatar (shadcn Avatar).
- Mobile responsive verified.

## Technical notes
- Use `lovable.auth.signInWithOAuth` (managed Google) — DO NOT call supabase directly for Google.
- Install `@dnd-kit/core @dnd-kit/sortable` for drag reorder.
- Migration must include GRANTs for `authenticated` role on every new/changed table.
- Existing `owner_key` data: migration drops the columns (acceptable — anonymous data wasn't durable).
- Keep admin upload route gated by hardcoded password (existing behavior); admin operations use `supabaseAdmin` via server fn for writes to `songs`.

## Files
- New: `src/routes/login.tsx`, `src/routes/_authenticated.tsx`, `src/routes/_authenticated/history.tsx`, `src/components/ProfileMenu.tsx`, `src/components/QueueList.tsx`, `src/lib/auth-hook.ts`, `src/lib/playlists.functions.ts`, `src/lib/liked.functions.ts`, `src/lib/recently-played.functions.ts`, `src/lib/queue-state.functions.ts`.
- Edit: `src/start.ts`, `src/routes/__root.tsx`, `src/components/Sidebar.tsx`, `src/components/Player.tsx`, `src/components/NowPlaying.tsx`, `src/components/SongMenu.tsx`, `src/lib/player-store.ts`, `src/routes/index.tsx`, `src/routes/library.tsx`, `src/routes/liked.tsx`, `src/routes/playlist.$id.tsx`, `src/routes/search.tsx`, `src/routes/admin.tsx`.
- Migration: full schema overhaul as described in §2.