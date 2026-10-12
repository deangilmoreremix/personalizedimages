-- ============================================================================
-- PersonalizedImages — minimal additive schema for the two missing tables
-- ============================================================================
--
-- Context
--   The shared VideoRemix project (bzxohkrxcwodllketcpz) hosts many
--   applications. Live read-only inspection confirmed:
--     * generated_videos  -- DOES NOT EXIST
--     * user_images       -- DOES NOT EXIST
--     * generated_images  -- EXISTS (id, url, prompt, user_id, model, ...)
--     * rate_limits       -- EXISTS (id, scope, key, window_start, count, ...)
--     * generated-images  -- storage bucket EXISTS (public, image/*)
--
--   This migration creates ONLY the two tables PersonalizedImages needs, with
--   the `pi_` prefix used by this repository for app-owned objects so the
--   names cannot collide with any existing application object (verified: no
--   `pi_generated_videos`, `pi_user_images`, index, policy or constraint with
--   these names exists).
--
-- Safety properties (verified against the live schema before writing)
--   * Additive only: two CREATE TABLE IF NOT EXISTS statements. Nothing is
--     dropped, altered, truncated or deleted; no existing table, policy,
--     function, trigger or bucket is touched.
--   * The shared rate_limits, user_credits, credit_transactions,
--     subscriptions, billing_cycles and stripe_entitlements tables are NOT
--     referenced or modified (PersonalizedImages is 100% BYOK and has no
--     credits, Stripe or subscription flows).
--   * RLS is enabled with explicit owner-scoped policies; the service role
--     used by the edge functions bypasses RLS by design.
--   * Indexes are new and uniquely named; they cannot collide with the 55+
--     existing indexes in the public schema.
--
-- Rollback: see the "ROLLBACK" section at the bottom of this file.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. pi_generated_videos — MuAPI video job tracking
--    Written and read by the image-to-video / video-status / video-result edge
--    functions with the service role; users never read it directly (the
--    policies below are defence in depth).
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pi_generated_videos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  image_id      uuid REFERENCES public.generated_images (id) ON DELETE SET NULL,
  video_url     text        NOT NULL DEFAULT '',
  thumbnail_url text,
  duration      integer     NOT NULL DEFAULT 5,
  prompt        text,
  provider      text        NOT NULL DEFAULT 'kling-master',
  format        text        NOT NULL DEFAULT 'mp4',
  status        text        NOT NULL DEFAULT 'processing',
  progress      integer     NOT NULL DEFAULT 0,
  error_message text,
  metadata      jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Fast "my videos, newest first" listing used by the gallery.
CREATE INDEX IF NOT EXISTS pi_generated_videos_user_created_idx
  ON public.pi_generated_videos (user_id, created_at DESC);

-- Partial index for the status-polling workers (only in-flight jobs matter).
CREATE INDEX IF NOT EXISTS pi_generated_videos_status_idx
  ON public.pi_generated_videos (status)
  WHERE status IN ('pending', 'processing');

ALTER TABLE public.pi_generated_videos ENABLE ROW LEVEL SECURITY;

-- Least-privilege policies: a user may only ever see and change their own rows.
DROP POLICY IF EXISTS pi_generated_videos_select_own ON public.pi_generated_videos;
CREATE POLICY pi_generated_videos_select_own
  ON public.pi_generated_videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS pi_generated_videos_insert_own ON public.pi_generated_videos;
CREATE POLICY pi_generated_videos_insert_own
  ON public.pi_generated_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS pi_generated_videos_update_own ON public.pi_generated_videos;
CREATE POLICY pi_generated_videos_update_own
  ON public.pi_generated_videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 2. pi_user_images — Cloud Gallery storage for PersonalizedImages
--    Read and written by the browser with the user's own JWT, so RLS policies
--    are the primary access control here.
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.pi_user_images (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  image_url          text        NOT NULL,
  thumbnail_url      text,
  prompt             text,
  enhanced_prompt    text,
  tokens             jsonb       NOT NULL DEFAULT '{}'::jsonb,
  model              text,
  style              text,
  aspect_ratio       text,
  quality            text,
  tags               text[]     NOT NULL DEFAULT '{}'::text[],
  is_favorite        boolean     NOT NULL DEFAULT false,
  -- No FK to a folders table: the gallery's folder feature uses a separate
  -- table that is not part of this minimal migration (see the release notes).
  folder_id          uuid,
  generation_time_ms integer,
  cost_estimate      numeric(12, 4),
  rating             integer,
  notes              text,
  metadata           jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pi_user_images_user_created_idx
  ON public.pi_user_images (user_id, created_at DESC);

-- Supports the gallery's tag filter (.contains('tags', ...)).
CREATE INDEX IF NOT EXISTS pi_user_images_tags_idx
  ON public.pi_user_images USING gin (tags);

CREATE INDEX IF NOT EXISTS pi_user_images_favorite_idx
  ON public.pi_user_images (user_id, is_favorite)
  WHERE is_favorite = true;

ALTER TABLE public.pi_user_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pi_user_images_select_own ON public.pi_user_images;
CREATE POLICY pi_user_images_select_own
  ON public.pi_user_images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS pi_user_images_insert_own ON public.pi_user_images;
CREATE POLICY pi_user_images_insert_own
  ON public.pi_user_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS pi_user_images_update_own ON public.pi_user_images;
CREATE POLICY pi_user_images_update_own
  ON public.pi_user_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS pi_user_images_delete_own ON public.pi_user_images;
CREATE POLICY pi_user_images_delete_own
  ON public.pi_user_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- ROLLBACK
-- ============================================================================
-- Both tables are new and owned exclusively by PersonalizedImages, so rollback
-- is a clean drop with no effect on any other application:
--
--   DROP TABLE IF EXISTS public.pi_user_images;
--   DROP TABLE IF EXISTS public.pi_generated_videos;
--
-- Dropping pi_generated_videos cascades only its own rows and indexes.
-- pi_user_images rows are user-owned gallery entries; export them first if the
-- data must be preserved. No shared table, policy, function or bucket is
-- affected in either direction (apply or rollback).
--
-- FORWARD RECOVERY
--   The whole migration is idempotent (IF NOT EXISTS + DROP POLICY IF EXISTS),
--   so it can be re-run safely after a partial failure. If a deploy is
--   interrupted mid-way, re-applying produces the same end state.
-- ============================================================================
