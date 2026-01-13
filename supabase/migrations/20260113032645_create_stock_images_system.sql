/*
  # Stock Images System

  1. New Tables
    - `stock_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `resource_id` (text, Freepik resource ID)
      - `resource_type` (text, photo/vector/psd/icon)
      - `title` (text)
      - `thumbnail_url` (text)
      - `preview_url` (text)
      - `metadata` (jsonb, additional resource data)
      - `created_at` (timestamptz)
    
    - `stock_downloads`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `resource_id` (text)
      - `resource_type` (text)
      - `title` (text)
      - `download_format` (text, jpg/png/svg/etc)
      - `download_url` (text)
      - `used_in_module` (text, which module used this)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

    - `stock_usage_analytics`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `module_name` (text)
      - `action_type` (text, search/preview/download/use)
      - `resource_id` (text, nullable)
      - `search_query` (text, nullable)
      - `metadata` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- Stock Favorites Table
CREATE TABLE IF NOT EXISTS stock_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id text NOT NULL,
  resource_type text NOT NULL DEFAULT 'photo',
  title text,
  thumbnail_url text,
  preview_url text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

ALTER TABLE stock_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON stock_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON stock_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON stock_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stock_favorites_user_id ON stock_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_favorites_resource_id ON stock_favorites(resource_id);

-- Stock Downloads Table
CREATE TABLE IF NOT EXISTS stock_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id text NOT NULL,
  resource_type text NOT NULL DEFAULT 'photo',
  title text,
  download_format text,
  download_url text,
  used_in_module text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own downloads"
  ON stock_downloads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own downloads"
  ON stock_downloads FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stock_downloads_user_id ON stock_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_downloads_resource_id ON stock_downloads(resource_id);
CREATE INDEX IF NOT EXISTS idx_stock_downloads_module ON stock_downloads(used_in_module);

-- Stock Usage Analytics Table
CREATE TABLE IF NOT EXISTS stock_usage_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  module_name text NOT NULL,
  action_type text NOT NULL,
  resource_id text,
  search_query text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stock_usage_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
  ON stock_usage_analytics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON stock_usage_analytics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_stock_analytics_user_id ON stock_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_stock_analytics_module ON stock_usage_analytics(module_name);
CREATE INDEX IF NOT EXISTS idx_stock_analytics_created ON stock_usage_analytics(created_at);