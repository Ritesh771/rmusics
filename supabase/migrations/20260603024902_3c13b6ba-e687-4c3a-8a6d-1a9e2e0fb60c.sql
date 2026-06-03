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