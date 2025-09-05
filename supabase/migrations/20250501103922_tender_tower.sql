/*
  # Create personalization_tokens table

  1. New Tables
    - `personalization_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, the token name)
      - `image_url` (text, URL to the generated image)
      - `description` (text, description used for generation)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `personalization_tokens` table
    - Add policies for authenticated users to read, create, update, and delete their own data
*/

CREATE TABLE IF NOT EXISTS personalization_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE personalization_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own tokens
CREATE POLICY "Users can insert their own personalization tokens"
  ON personalization_tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to select their own tokens
CREATE POLICY "Users can view their own personalization tokens"
  ON personalization_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow users to update their own tokens
CREATE POLICY "Users can update their own personalization tokens"
  ON personalization_tokens
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own tokens
CREATE POLICY "Users can delete their own personalization tokens"
  ON personalization_tokens
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);