
DROP POLICY IF EXISTS "public read liked" ON public.liked_songs;
DROP POLICY IF EXISTS "public write liked" ON public.liked_songs;
DROP POLICY IF EXISTS "public delete liked" ON public.liked_songs;
DROP POLICY IF EXISTS "public read playlists" ON public.playlists;
DROP POLICY IF EXISTS "public write playlists" ON public.playlists;
DROP POLICY IF EXISTS "public update playlists" ON public.playlists;
DROP POLICY IF EXISTS "public delete playlists" ON public.playlists;
DROP POLICY IF EXISTS "public read playlist_songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "public write playlist_songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "public update playlist_songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "public delete playlist_songs" ON public.playlist_songs;
DROP POLICY IF EXISTS "public read songs" ON public.songs;
DROP POLICY IF EXISTS "public write songs" ON public.songs;
DROP POLICY IF EXISTS "public update songs" ON public.songs;
DROP POLICY IF EXISTS "public delete songs" ON public.songs;

TRUNCATE public.liked_songs, public.playlist_songs, public.playlists CASCADE;

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, public.profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "songs_select_all" ON public.songs FOR SELECT USING (true);
CREATE POLICY "songs_insert_auth" ON public.songs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "songs_update_auth" ON public.songs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "songs_delete_auth" ON public.songs FOR DELETE TO authenticated USING (true);
GRANT SELECT ON public.songs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.songs TO authenticated;

ALTER TABLE public.playlists DROP COLUMN IF EXISTS owner_key;
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_playlists_user ON public.playlists(user_id);
CREATE POLICY "playlists_select_own_or_public" ON public.playlists FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "playlists_insert_own" ON public.playlists FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "playlists_update_own" ON public.playlists FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "playlists_delete_own" ON public.playlists FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT ON public.playlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlists TO authenticated;

ALTER TABLE public.liked_songs DROP COLUMN IF EXISTS owner_key;
ALTER TABLE public.liked_songs ADD COLUMN IF NOT EXISTS user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS idx_liked_user_song ON public.liked_songs(user_id, song_id);
CREATE POLICY "liked_select_own" ON public.liked_songs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "liked_insert_own" ON public.liked_songs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "liked_delete_own" ON public.liked_songs FOR DELETE TO authenticated USING (auth.uid() = user_id);
GRANT SELECT, INSERT, DELETE ON public.liked_songs TO authenticated;

CREATE POLICY "ps_select_visible" ON public.playlist_songs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND (p.is_public = true OR p.user_id = auth.uid())));
CREATE POLICY "ps_insert_own" ON public.playlist_songs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid()));
CREATE POLICY "ps_update_own" ON public.playlist_songs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid()));
CREATE POLICY "ps_delete_own" ON public.playlist_songs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid()));
GRANT SELECT ON public.playlist_songs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.playlist_songs TO authenticated;

CREATE TABLE public.recently_played (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id uuid NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  played_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rp_user_time ON public.recently_played(user_id, played_at DESC);
GRANT SELECT, INSERT, DELETE ON public.recently_played TO authenticated;
GRANT ALL ON public.recently_played TO service_role;
ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rp_select_own" ON public.recently_played FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rp_insert_own" ON public.recently_played FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rp_delete_own" ON public.recently_played FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.user_queue (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  queue jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_index integer NOT NULL DEFAULT -1,
  progress numeric NOT NULL DEFAULT 0,
  shuffle boolean NOT NULL DEFAULT false,
  repeat text NOT NULL DEFAULT 'off',
  sleep_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_queue TO authenticated;
GRANT ALL ON public.user_queue TO service_role;
ALTER TABLE public.user_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "uq_select_own" ON public.user_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "uq_insert_own" ON public.user_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "uq_update_own" ON public.user_queue FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "uq_delete_own" ON public.user_queue FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.recently_played;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_queue;
