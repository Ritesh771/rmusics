
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  thumbnail_url TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER NOT NULL DEFAULT 0,
  genre TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  owner_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.playlist_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

CREATE TABLE public.liked_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  owner_key TEXT NOT NULL,
  liked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(song_id, owner_key)
);

CREATE INDEX idx_playlist_songs_playlist ON public.playlist_songs(playlist_id);
CREATE INDEX idx_liked_songs_owner ON public.liked_songs(owner_key);
CREATE INDEX idx_playlists_owner ON public.playlists(owner_key);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

-- Open policies (no auth app). Admin actions gated client-side.
CREATE POLICY "public read songs" ON public.songs FOR SELECT USING (true);
CREATE POLICY "public write songs" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "public update songs" ON public.songs FOR UPDATE USING (true);
CREATE POLICY "public delete songs" ON public.songs FOR DELETE USING (true);

CREATE POLICY "public read playlists" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "public write playlists" ON public.playlists FOR INSERT WITH CHECK (true);
CREATE POLICY "public update playlists" ON public.playlists FOR UPDATE USING (true);
CREATE POLICY "public delete playlists" ON public.playlists FOR DELETE USING (true);

CREATE POLICY "public read playlist_songs" ON public.playlist_songs FOR SELECT USING (true);
CREATE POLICY "public write playlist_songs" ON public.playlist_songs FOR INSERT WITH CHECK (true);
CREATE POLICY "public update playlist_songs" ON public.playlist_songs FOR UPDATE USING (true);
CREATE POLICY "public delete playlist_songs" ON public.playlist_songs FOR DELETE USING (true);

CREATE POLICY "public read liked" ON public.liked_songs FOR SELECT USING (true);
CREATE POLICY "public write liked" ON public.liked_songs FOR INSERT WITH CHECK (true);
CREATE POLICY "public delete liked" ON public.liked_songs FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.songs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlists;
ALTER PUBLICATION supabase_realtime ADD TABLE public.playlist_songs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.liked_songs;
