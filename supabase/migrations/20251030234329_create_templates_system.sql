/*
  # Templates System for AI Image Generation

  1. New Tables
    - `action_figure_templates`
      - `id` (uuid, primary key)
      - `template_id` (text, unique) - Internal reference ID
      - `name` (text) - Display name
      - `description` (text) - Template description
      - `prompt` (text) - AI generation prompt with tokens
      - `packaging` (text) - Packaging type
      - `accessories` (jsonb) - Array of accessories
      - `style` (text) - Visual style
      - `preview` (text) - Preview image URL
      - `category` (text) - Template category (general, wrestling, music, retro, tv)
      - `is_active` (boolean) - Whether template is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `meme_templates`
      - `id` (uuid, primary key)
      - `template_id` (text, unique)
      - `name` (text)
      - `url` (text) - Meme image URL
      - `category` (text)
      - `description` (text)
      - `default_top_text` (text, nullable)
      - `default_bottom_text` (text, nullable)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `cartoon_themes`
      - `id` (uuid, primary key)
      - `theme_id` (text, unique)
      - `name` (text)
      - `description` (text)
      - `style_keywords` (text) - Keywords for AI generation
      - `preview` (text) - Preview image URL
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `user_generated_images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable) - Reference to auth.users
      - `image_url` (text) - Generated image URL
      - `prompt` (text) - Prompt used
      - `template_type` (text) - Type of template used
      - `template_id` (text, nullable) - Reference to template
      - `provider` (text) - AI provider used
      - `metadata` (jsonb) - Additional metadata
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Templates are publicly readable
    - Only authenticated users can create user_generated_images
    - Users can only view their own generated images
*/

-- Create action_figure_templates table
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

-- Create meme_templates table
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

-- Create cartoon_themes table
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

-- Create user_generated_images table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_action_figure_category ON action_figure_templates(category);
CREATE INDEX IF NOT EXISTS idx_action_figure_active ON action_figure_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_meme_category ON meme_templates(category);
CREATE INDEX IF NOT EXISTS idx_meme_active ON meme_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_cartoon_active ON cartoon_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_user_images_user_id ON user_generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_user_images_created ON user_generated_images(created_at DESC);

-- Enable RLS
ALTER TABLE action_figure_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE cartoon_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_generated_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for action_figure_templates (public read, no write)
CREATE POLICY "Anyone can view active action figure templates"
  ON action_figure_templates FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for meme_templates (public read, no write)
CREATE POLICY "Anyone can view active meme templates"
  ON meme_templates FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for cartoon_themes (public read, no write)
CREATE POLICY "Anyone can view active cartoon themes"
  ON cartoon_themes FOR SELECT
  TO public
  USING (is_active = true);

-- RLS Policies for user_generated_images
CREATE POLICY "Users can insert their own generated images"
  ON user_generated_images FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own generated images"
  ON user_generated_images FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anonymous users can insert images"
  ON user_generated_images FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_action_figure_templates_updated_at
  BEFORE UPDATE ON action_figure_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meme_templates_updated_at
  BEFORE UPDATE ON meme_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cartoon_themes_updated_at
  BEFORE UPDATE ON cartoon_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();