/*
  # Templates System for AI Image Generation

  1. New Tables
    - `action_figure_templates` - Templates for action figure generation
    - `meme_templates` - Templates for meme generation
    - `cartoon_themes` - Themes for cartoon style generation
    - `user_generated_images` - User-generated image records with template references

  2. Security
    - Templates are publicly readable when active
    - User generated images are private to the user
*/

-- Action Figure Templates
CREATE TABLE IF NOT EXISTS action_figure_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  prompt text NOT NULL,
  packaging text NOT NULL,
  accessories jsonb DEFAULT '[]'::jsonb,
  style text NOT NULL,
  preview text,
  category text DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Meme Templates
CREATE TABLE IF NOT EXISTS meme_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id text UNIQUE NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  default_top_text text,
  default_bottom_text text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cartoon Themes
CREATE TABLE IF NOT EXISTS cartoon_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  style_keywords text NOT NULL,
  preview text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Generated Images (with template references)
CREATE TABLE IF NOT EXISTS user_generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  prompt text NOT NULL,
  template_type text NOT NULL,
  template_id text,
  provider text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_action_figure_category ON action_figure_templates(category);
CREATE INDEX IF NOT EXISTS idx_action_figure_active ON action_figure_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_meme_category ON meme_templates(category);
CREATE INDEX IF NOT EXISTS idx_meme_active ON meme_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_cartoon_active ON cartoon_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_user_gen_images_user_id ON user_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gen_images_created ON user_generated_images(created_at DESC);

-- Enable RLS
ALTER TABLE action_figure_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoon_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generated_images ENABLE ROW LEVEL SECURITY;

-- Public read policies for templates
CREATE POLICY "Anyone can view active action figure templates"
  ON action_figure_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active meme templates"
  ON meme_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active cartoon themes"
  ON cartoon_themes FOR SELECT
  USING (is_active = true);

-- User generated images policies
CREATE POLICY "Users can view their own generated images"
  ON user_generated_images FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their generated images"
  ON user_generated_images FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their generated images"
  ON user_generated_images FOR DELETE TO authenticated
  USING (auth.uid() = user_id);