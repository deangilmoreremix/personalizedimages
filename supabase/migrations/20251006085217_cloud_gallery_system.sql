/*
  # Cloud Gallery & Enhancement System

  1. New Tables
    - `user_images` - Stores generated images with metadata
    - `folders` - Hierarchical folder organization
    - `image_tags` - Tag system for images
    - `prompt_history` - Saved prompts with analytics
    - `prompt_favorites` - User-favorited prompts
    - `generation_queue` - Background generation queue
    - `token_profiles` - Saved token configurations
    - `analytics_events` - Usage analytics tracking

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure users can only access their own data

  3. Indexes
    - Performance indexes on frequently queried columns
    - Full-text search indexes on prompts
*/

-- User Images Table
CREATE TABLE IF NOT EXISTS user_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  tokens JSONB DEFAULT '{}'::jsonb,
  model TEXT NOT NULL,
  style TEXT,
  aspect_ratio TEXT,
  quality TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  folder_id UUID,
  generation_time_ms INTEGER,
  cost_estimate DECIMAL(10, 4),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Folders Table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  color TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_archived BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT no_circular_reference CHECK (parent_id != id)
);

-- Add foreign key for folder_id after folders table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'user_images_folder_id_fkey'
  ) THEN
    ALTER TABLE user_images
    ADD CONSTRAINT user_images_folder_id_fkey
    FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Image Tags Table (many-to-many)
CREATE TABLE IF NOT EXISTS image_tags (
  image_id UUID REFERENCES user_images(id) ON DELETE CASCADE NOT NULL,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (image_id, tag)
);

-- Prompt History Table
CREATE TABLE IF NOT EXISTS prompt_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  enhanced_prompt TEXT,
  tokens JSONB DEFAULT '{}'::jsonb,
  model TEXT NOT NULL,
  style TEXT,
  category TEXT,
  success_rate DECIMAL(5, 2) DEFAULT 0,
  avg_rating DECIMAL(3, 2),
  use_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Prompt Favorites Table
CREATE TABLE IF NOT EXISTS prompt_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt_id UUID REFERENCES prompt_history(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Generation Queue Table
CREATE TABLE IF NOT EXISTS generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  tokens JSONB DEFAULT '{}'::jsonb,
  model TEXT NOT NULL,
  style TEXT,
  options JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  priority INTEGER DEFAULT 0,
  result_image_id UUID REFERENCES user_images(id) ON DELETE SET NULL,
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Token Profiles Table
CREATE TABLE IF NOT EXISTS token_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tokens JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  category TEXT,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}'::jsonb,
  model TEXT,
  success BOOLEAN,
  duration_ms INTEGER,
  cost_estimate DECIMAL(10, 4),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_folder_id ON user_images(folder_id);
CREATE INDEX IF NOT EXISTS idx_user_images_created_at ON user_images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_images_is_favorite ON user_images(is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_user_images_tags ON user_images USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_user_images_tokens ON user_images USING GIN(tokens);

CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id);

CREATE INDEX IF NOT EXISTS idx_image_tags_tag ON image_tags(tag);

CREATE INDEX IF NOT EXISTS idx_prompt_history_user_id ON prompt_history(user_id);
CREATE INDEX IF NOT EXISTS idx_prompt_history_last_used ON prompt_history(last_used_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompt_history_use_count ON prompt_history(use_count DESC);

CREATE INDEX IF NOT EXISTS idx_generation_queue_user_id ON generation_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_generation_queue_status ON generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_generation_queue_priority ON generation_queue(priority DESC, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_token_profiles_user_id ON token_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_token_profiles_is_default ON token_profiles(is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Full-text search index for prompts
CREATE INDEX IF NOT EXISTS idx_prompt_history_prompt_fts ON prompt_history USING GIN(to_tsvector('english', prompt));
CREATE INDEX IF NOT EXISTS idx_user_images_prompt_fts ON user_images USING GIN(to_tsvector('english', prompt));

-- Enable Row Level Security
ALTER TABLE user_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_images
CREATE POLICY "Users can view own images"
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

-- RLS Policies for folders
CREATE POLICY "Users can view own folders"
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

-- RLS Policies for image_tags
CREATE POLICY "Users can view tags for own images"
  ON image_tags FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_images
    WHERE user_images.id = image_tags.image_id
    AND user_images.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert tags for own images"
  ON image_tags FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_images
    WHERE user_images.id = image_tags.image_id
    AND user_images.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tags from own images"
  ON image_tags FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM user_images
    WHERE user_images.id = image_tags.image_id
    AND user_images.user_id = auth.uid()
  ));

-- RLS Policies for prompt_history
CREATE POLICY "Users can view own prompt history"
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

-- RLS Policies for prompt_favorites
CREATE POLICY "Users can view own favorites"
  ON prompt_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON prompt_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON prompt_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for generation_queue
CREATE POLICY "Users can view own queue items"
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

-- RLS Policies for token_profiles
CREATE POLICY "Users can view own token profiles"
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

-- RLS Policies for analytics_events
CREATE POLICY "Users can view own analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_user_images_updated_at ON user_images;
CREATE TRIGGER update_user_images_updated_at
  BEFORE UPDATE ON user_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_token_profiles_updated_at ON token_profiles;
CREATE TRIGGER update_token_profiles_updated_at
  BEFORE UPDATE ON token_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function to get folder path
CREATE OR REPLACE FUNCTION get_folder_path(folder_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  path TEXT := '';
  current_folder RECORD;
  parent_uuid UUID;
BEGIN
  parent_uuid := folder_uuid;

  WHILE parent_uuid IS NOT NULL LOOP
    SELECT name, parent_id INTO current_folder
    FROM folders
    WHERE id = parent_uuid;

    IF current_folder.name IS NOT NULL THEN
      IF path = '' THEN
        path := current_folder.name;
      ELSE
        path := current_folder.name || ' / ' || path;
      END IF;
    END IF;

    parent_uuid := current_folder.parent_id;
  END LOOP;

  RETURN COALESCE(path, '');
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old analytics (optional, run periodically)
CREATE OR REPLACE FUNCTION cleanup_old_analytics(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events
  WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
