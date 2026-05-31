-- ============================================================
-- MyMediaList – Supabase PostgreSQL Schema  (idempotent)
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS guards.
-- ============================================================

-- ============================================================
-- 1. PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username         TEXT         UNIQUE NOT NULL,
  display_name     TEXT,
  avatar_url       TEXT,
  bio              TEXT,
  primary_interest TEXT         CHECK (primary_interest IN ('anime', 'manga', 'series')),
  is_public        BOOLEAN      NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'preferred_username',
      'user_' || substr(NEW.id::text, 1, 8)
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. MEDIA_CACHE
-- ============================================================
-- expires_at signals "metadata stale, re-fetch and UPSERT in place."
-- Never DELETE rows that are referenced by user_lists.
CREATE TABLE IF NOT EXISTS public.media_cache (
  id              TEXT         PRIMARY KEY,
  source          TEXT         NOT NULL CHECK (source IN ('anilist', 'tmdb')),
  media_type      TEXT         NOT NULL CHECK (media_type IN ('anime', 'manga', 'movie', 'tv')),
  title_romaji    TEXT,
  title_english   TEXT,
  title_native    TEXT,
  synopsis        TEXT,
  poster_url      TEXT,
  banner_url      TEXT,
  genres          TEXT[]       NOT NULL DEFAULT '{}',
  status          TEXT,
  total_episodes  INTEGER,
  total_chapters  INTEGER,
  total_volumes   INTEGER,
  release_year    SMALLINT,
  external_ids    JSONB        NOT NULL DEFAULT '{}',
  cached_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ  NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS media_cache_source_type_idx ON public.media_cache (source, media_type);
CREATE INDEX IF NOT EXISTS media_cache_expires_idx     ON public.media_cache (expires_at);

-- ============================================================
-- 3. USER_LISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_lists (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID         NOT NULL REFERENCES auth.users(id)       ON DELETE CASCADE,
  media_id            TEXT         NOT NULL REFERENCES public.media_cache(id),
  status              TEXT         NOT NULL CHECK (status IN (
                        'watching', 'reading', 'completed',
                        'on_hold', 'dropped', 'plan_to_watch', 'plan_to_read'
                      )),
  progress_episodes   INTEGER      NOT NULL DEFAULT 0,
  progress_chapters   INTEGER      NOT NULL DEFAULT 0,
  progress_volumes    INTEGER      NOT NULL DEFAULT 0,
  score               NUMERIC(3,1) CHECK (score IS NULL OR (score >= 0 AND score <= 10)),
  start_date          DATE,
  finish_date         DATE,
  notes               TEXT,
  tags                TEXT[]       NOT NULL DEFAULT '{}',
  is_rewatching       BOOLEAN      NOT NULL DEFAULT false,
  rewatch_count       INTEGER      NOT NULL DEFAULT 0 CHECK (rewatch_count >= 0),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (user_id, media_id)
);

CREATE INDEX IF NOT EXISTS user_lists_user_status_idx ON public.user_lists (user_id, status);

-- ============================================================
-- 4. ACTIVITY_LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  media_id    TEXT         NOT NULL REFERENCES public.media_cache(id),
  action      TEXT         NOT NULL CHECK (action IN (
                'added', 'updated', 'completed', 'dropped',
                'progress_update', 'score_update', 'removed'
              )),
  old_values  JSONB,
  new_values  JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_user_created_idx ON public.activity_logs (user_id, created_at DESC);

-- ============================================================
-- updated_at TRIGGERS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

DROP TRIGGER IF EXISTS handle_updated_at_profiles   ON public.profiles;
DROP TRIGGER IF EXISTS handle_updated_at_user_lists ON public.user_lists;

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

CREATE TRIGGER handle_updated_at_user_lists
  BEFORE UPDATE ON public.user_lists
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime('updated_at');

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_cache   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- profiles
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (is_public = true OR auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- media_cache (service-role writes bypass RLS — no insert policy needed)
DROP POLICY IF EXISTS "media_cache_select" ON public.media_cache;

CREATE POLICY "media_cache_select" ON public.media_cache
  FOR SELECT USING (true);

-- user_lists
DROP POLICY IF EXISTS "user_lists_select" ON public.user_lists;
DROP POLICY IF EXISTS "user_lists_insert" ON public.user_lists;
DROP POLICY IF EXISTS "user_lists_update" ON public.user_lists;
DROP POLICY IF EXISTS "user_lists_delete" ON public.user_lists;

CREATE POLICY "user_lists_select" ON public.user_lists
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = user_lists.user_id AND p.is_public = true
    )
  );

CREATE POLICY "user_lists_insert" ON public.user_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_lists_update" ON public.user_lists
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_lists_delete" ON public.user_lists
  FOR DELETE USING (auth.uid() = user_id);

-- activity_logs
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
DROP POLICY IF EXISTS "activity_logs_insert" ON public.activity_logs;

CREATE POLICY "activity_logs_select" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
