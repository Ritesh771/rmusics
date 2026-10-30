-- File: supabase/migrations/20260524170251_30f4be37-15ad-4553-9a9d-605106c42da7.sql
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


-- File: supabase/migrations/20260528020148_51c2e039-f744-4bce-81b0-5aae580aac2e.sql
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


-- File: supabase/migrations/20260529024109_3ed14edb-2857-4be7-9e52-0971a993bf62.sql
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;


-- File: supabase/migrations/20260601022746_2994f5ae-bf9d-4d8f-b253-3aca91458aa1.sql
-- 1. Roles infrastructure
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_roles_select_own ON public.user_roles;
CREATE POLICY user_roles_select_own ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Profiles: hide emails from anonymous viewers
DROP POLICY IF EXISTS profiles_select_all ON public.profiles;
CREATE POLICY profiles_select_authenticated ON public.profiles
  FOR SELECT TO authenticated USING (true);

-- 3. Songs: admin-only writes
DROP POLICY IF EXISTS songs_insert_auth ON public.songs;
DROP POLICY IF EXISTS songs_update_auth ON public.songs;
DROP POLICY IF EXISTS songs_delete_auth ON public.songs;

CREATE POLICY songs_insert_admin ON public.songs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY songs_update_admin ON public.songs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY songs_delete_admin ON public.songs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Realtime: remove private tables from the broadcast publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.liked_songs;
EXCEPTION WHEN undefined_object THEN null; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.recently_played;
EXCEPTION WHEN undefined_object THEN null; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.user_queue;
EXCEPTION WHEN undefined_object THEN null; END $$;


-- File: supabase/migrations/20260602035100_4860c001-7002-4c19-a605-191d5aec16bb.sql
-- Lock down SECURITY DEFINER function execution to least privilege
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;


-- File: supabase/migrations/20260603024902_3c13b6ba-e687-4c3a-8a6d-1a9e2e0fb60c.sql
-- Add featured flag to playlists so we can highlight system-curated lists
ALTER TABLE public.playlists ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS playlists_is_featured_idx ON public.playlists (is_featured) WHERE is_featured = true;

-- Seed the "Rmusics" featured playlist exactly once, snapshotting every song
-- that exists right now. Future admin uploads will NOT auto-populate it.
DO $$
DECLARE
  owner_id uuid;
  pl_id uuid;
BEGIN
  -- Skip if it already exists
  IF EXISTS (SELECT 1 FROM public.playlists WHERE is_featured = true AND name = 'Rmusics') THEN
    RETURN;
  END IF;

  -- Pick any existing profile as nominal owner (RLS lets it show to everyone via is_public=true)
  SELECT id INTO owner_id FROM public.profiles ORDER BY created_at ASC LIMIT 1;
  IF owner_id IS NULL THEN
    RAISE NOTICE 'No profiles found, skipping Rmusics playlist seed';
    RETURN;
  END IF;

  INSERT INTO public.playlists (user_id, name, description, is_public, is_featured)
  VALUES (owner_id, 'Rmusics', 'The original Rmusics collection — every song that started it all.', true, true)
  RETURNING id INTO pl_id;

  INSERT INTO public.playlist_songs (playlist_id, song_id, position)
  SELECT pl_id, s.id, (row_number() OVER (ORDER BY s.created_at ASC))::int - 1
  FROM public.songs s;
END $$;


-- File: supabase/migrations/20260714113246_71721364-88f7-463e-8db9-85deeb51166c.sql
-- Assign admin role if user exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users WHERE id = '419bd92d-e37a-4408-af9f-be95ddde0c08'
ON CONFLICT (user_id, role) DO NOTHING;

-- Automatically make the first registered user an admin
CREATE OR REPLACE FUNCTION public.handle_first_user_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.user_roles WHERE role = 'admin') = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_admin ON auth.users;
CREATE TRIGGER on_auth_user_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_first_user_admin();





make the login page like spotify like left side it shoudl have some content and animations related to musics and and right side login page and remove this Sign in via Browser Redirect
https://dribbble.com/shots/22689352-Fashion-Login-Page-UI-Design see this and make the same ui but in the spotify theme corrcetly and music related image 
