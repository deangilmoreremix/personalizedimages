/*
  # Create image_generations table

  1. New Tables
    - `image_generations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `prompt` (text)
      - `model` (text)
      - `size` (text)
      - `quality` (text)
      - `style` (text)
      - `num_images` (integer)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `image_generations` table
    - Add policies for authenticated users to read and create their own data
*/

CREATE TABLE IF NOT EXISTS image_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  size TEXT NOT NULL,
  quality TEXT NOT NULL,
  style TEXT NOT NULL,
  num_images INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own data
CREATE POLICY "Users can insert their own image generations"
  ON image_generations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own data
CREATE POLICY "Users can view their own image generations"
  ON image_generations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);