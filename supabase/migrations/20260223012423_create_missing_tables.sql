/*
  # Create Missing Tables

  This migration adds 10 tables that are referenced in the application code
  but were missing from the database schema.

  1. New Tables
    - `admin_roles` - Stores admin role assignments per user
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users, unique)
      - `role` (text, constrained to admin/editor/viewer)
      - `permissions` (jsonb)
      - `created_at`, `updated_at` (timestamptz)

    - `user_payments` - Tracks Stripe payment records
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `payment_intent_id` (text)
      - `video_id` (text)
      - `amount` (integer, cents)
      - `status` (text)
      - `created_at` (timestamptz)

    - `analytics_events` - Application analytics events
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable FK to auth.users)
      - `event_type` (text)
      - `event_data` (jsonb)
      - `created_at` (timestamptz)

    - `token_profiles` - Saved personalization token profiles
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `name` (text)
      - `description` (text)
      - `tokens` (jsonb)
      - `is_default` (boolean)
      - `category` (text)
      - `use_count` (integer)
      - `last_used_at`, `created_at`, `updated_at` (timestamptz)

    - `prompt_history` - User prompt history with deduplication
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `prompt` (text)
      - `enhanced_prompt` (text)
      - `tokens` (jsonb)
      - `model`, `style`, `category` (text)
      - `success_rate`, `avg_rating` (numeric)
      - `use_count` (integer)
      - `last_used_at`, `created_at` (timestamptz)
      - `metadata` (jsonb)
      - Unique constraint on (user_id, prompt, model)

    - `folders` - Image folder organization (self-referencing)
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `name` (text)
      - `description` (text)
      - `parent_id` (uuid, self-referencing FK)
      - `color`, `icon` (text)
      - `sort_order` (integer)
      - `is_archived` (boolean)
      - `metadata` (jsonb)
      - `created_at`, `updated_at` (timestamptz)

    - `user_images` - User generated image gallery
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `image_url` (text)
      - `thumbnail_url` (text)
      - `prompt`, `enhanced_prompt` (text)
      - `tokens` (jsonb)
      - `model`, `style`, `aspect_ratio`, `quality` (text)
      - `tags` (text[])
      - `is_favorite` (boolean)
      - `folder_id` (uuid, FK to folders)
      - `generation_time_ms` (integer)
      - `cost_estimate` (numeric)
      - `rating` (integer)
      - `notes` (text)
      - `metadata` (jsonb)
      - `created_at`, `updated_at` (timestamptz)

    - `generation_queue` - Async image generation queue
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `prompt` (text)
      - `tokens` (jsonb)
      - `model`, `style` (text)
      - `options` (jsonb)
      - `status` (text, constrained)
      - `priority` (integer)
      - `result_image_id` (uuid, FK to user_images)
      - `error_message` (text)
      - `attempts`, `max_attempts` (integer)
      - `scheduled_at`, `started_at`, `completed_at`, `created_at` (timestamptz)
      - `metadata` (jsonb)

    - `landing_page_images` - CMS landing page image slots
      - `id` (uuid, primary key)
      - `section`, `slot` (text)
      - `image_url`, `alt_text`, `title` (text)
      - `is_active` (boolean)
      - `metadata` (jsonb)
      - `uploaded_by` (uuid, FK to auth.users)
      - `created_at`, `updated_at` (timestamptz)
      - Unique constraint on (section, slot)

    - `content_revisions` - Revision history for landing page content
      - `id` (uuid, primary key)
      - `landing_page_image_id` (uuid, FK to landing_page_images)
      - `previous_image_url`, `new_image_url` (text)
      - `changed_by` (uuid, FK to auth.users)
      - `change_reason` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated users to manage their own data
    - Admin-only write policies for landing_page_images and content_revisions
    - Analytics events allow authenticated inserts

  3. Indexes
    - Full-text search indexes on user_images.prompt and prompt_history.prompt
    - Index on generation_queue.status for queue processing
    - Index on analytics_events.event_type and created_at for reporting
*/

-- ============================================================
-- 1. admin_roles
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_roles_user_id_unique UNIQUE (user_id)
);

ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own admin role"
  ON admin_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert admin roles"
  ON admin_roles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
    )
  );

CREATE POLICY "Admins can update admin roles"
  ON admin_roles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete admin roles"
  ON admin_roles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
    )
  );

-- ============================================================
-- 2. user_payments
-- ============================================================
CREATE TABLE IF NOT EXISTS user_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id text NOT NULL,
  video_id text NOT NULL,
  amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON user_payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON user_payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. analytics_events
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  event_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own analytics events"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert analytics events"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created
  ON analytics_events (event_type, created_at);

-- ============================================================
-- 4. token_profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS token_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean NOT NULL DEFAULT false,
  category text,
  use_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE token_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own token profiles"
  ON token_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own token profiles"
  ON token_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own token profiles"
  ON token_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own token profiles"
  ON token_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. prompt_history
-- ============================================================
CREATE TABLE IF NOT EXISTS prompt_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  enhanced_prompt text,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text NOT NULL,
  style text,
  category text,
  success_rate numeric NOT NULL DEFAULT 0,
  avg_rating numeric,
  use_count integer NOT NULL DEFAULT 1,
  last_used_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT prompt_history_user_prompt_model_unique UNIQUE (user_id, prompt, model)
);

ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own prompt history"
  ON prompt_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompt history"
  ON prompt_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompt history"
  ON prompt_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompt history"
  ON prompt_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_prompt_history_fts
  ON prompt_history USING gin(to_tsvector('english', prompt));

-- ============================================================
-- 6. folders (self-referencing)
-- ============================================================
CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  parent_id uuid REFERENCES folders(id) ON DELETE CASCADE,
  color text,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_archived boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own folders"
  ON folders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own folders"
  ON folders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================
-- 7. user_images (depends on folders)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  thumbnail_url text,
  prompt text NOT NULL,
  enhanced_prompt text,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text NOT NULL,
  style text,
  aspect_ratio text,
  quality text,
  tags text[] NOT NULL DEFAULT '{}'::text[],
  is_favorite boolean NOT NULL DEFAULT false,
  folder_id uuid REFERENCES folders(id) ON DELETE SET NULL,
  generation_time_ms integer,
  cost_estimate numeric,
  rating integer,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own images"
  ON user_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own images"
  ON user_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
  ON user_images FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON user_images FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_images_fts
  ON user_images USING gin(to_tsvector('english', prompt));

CREATE INDEX IF NOT EXISTS idx_user_images_tags
  ON user_images USING gin(tags);

-- ============================================================
-- 8. generation_queue (depends on user_images)
-- ============================================================
CREATE TABLE IF NOT EXISTS generation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  tokens jsonb NOT NULL DEFAULT '{}'::jsonb,
  model text NOT NULL,
  style text,
  options jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority integer NOT NULL DEFAULT 0,
  result_image_id uuid REFERENCES user_images(id) ON DELETE SET NULL,
  error_message text,
  attempts integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own queue items"
  ON generation_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue items"
  ON generation_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue items"
  ON generation_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own queue items"
  ON generation_queue FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_generation_queue_status
  ON generation_queue (status, priority DESC, created_at);

-- ============================================================
-- 9. landing_page_images
-- ============================================================
CREATE TABLE IF NOT EXISTS landing_page_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL,
  slot text NOT NULL,
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  title text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT landing_page_images_section_slot_unique UNIQUE (section, slot)
);

ALTER TABLE landing_page_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active landing page images"
  ON landing_page_images FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can insert landing page images"
  ON landing_page_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can update landing page images"
  ON landing_page_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can delete landing page images"
  ON landing_page_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role = 'admin'
    )
  );

-- ============================================================
-- 10. content_revisions (depends on landing_page_images)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landing_page_image_id uuid NOT NULL REFERENCES landing_page_images(id) ON DELETE CASCADE,
  previous_image_url text NOT NULL,
  new_image_url text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  change_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read content revisions"
  ON content_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins can insert content revisions"
  ON content_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_roles ar
      WHERE ar.user_id = auth.uid() AND ar.role IN ('admin', 'editor')
    )
  );
