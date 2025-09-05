/*
  # Add user generated GIFs storage

  1. New Tables
    - `user_generated_gifs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `gif_url` (text)
      - `thumbnail_url` (text)
      - `frames` (integer)
      - `duration` (integer, milliseconds)
      - `width` (integer)
      - `height` (integer)
      - `size` (integer, bytes)
      - `settings` (jsonb)
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
  2. Security
    - Enable RLS on `user_generated_gifs` table
    - Add policy for authenticated users to manage their own GIFs
    - Add policy for authenticated users to view their own GIFs
*/

-- Create user generated GIFs table
CREATE TABLE IF NOT EXISTS user_generated_gifs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  gif_url text NOT NULL,
  thumbnail_url text,
  frames integer NOT NULL DEFAULT 1,
  duration integer NOT NULL DEFAULT 0,
  width integer NOT NULL DEFAULT 0,
  height integer NOT NULL DEFAULT 0,
  size integer NOT NULL DEFAULT 0,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_generated_gifs_user_id_idx ON user_generated_gifs (user_id);

-- Enable Row Level Security
ALTER TABLE user_generated_gifs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own GIFs
CREATE POLICY "Users can manage their own GIFs"
  ON user_generated_gifs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating timestamp on update
CREATE TRIGGER update_user_generated_gifs_timestamp
BEFORE UPDATE ON user_generated_gifs
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Add usage statistic view for GIFs
CREATE OR REPLACE VIEW user_gif_summary AS
SELECT
  u.id AS user_id,
  u.email,
  COUNT(g.id) AS total_gifs_count,
  SUM(g.size) AS total_size_bytes,
  SUM(g.frames) AS total_frames,
  MAX(g.created_at) AS last_generated_at
FROM 
  users u
LEFT JOIN 
  user_generated_gifs g ON u.id = g.user_id
GROUP BY 
  u.id, u.email;