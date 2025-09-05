/*
  # Add payment tables for video downloads

  1. New Tables
    - `user_payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `payment_intent_id` (text)
      - `video_id` (text)
      - `amount` (integer, in cents)
      - `status` (text)
      - `created_at` (timestamp with time zone)
    - `user_videos`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `video_url` (text)
      - `image_url` (text)
      - `prompt` (text)
      - `duration` (integer, in seconds)
      - `created_at` (timestamp with time zone)
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create user payments table
CREATE TABLE IF NOT EXISTS user_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_intent_id text NOT NULL,
  video_id text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_payments_user_id_idx ON user_payments (user_id);

-- Create index on video_id for faster queries
CREATE INDEX IF NOT EXISTS user_payments_video_id_idx ON user_payments (video_id);

-- Enable Row Level Security
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own payments
CREATE POLICY "Users can view their own payments"
  ON user_payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own payments
CREATE POLICY "Users can insert their own payments"
  ON user_payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create user videos table
CREATE TABLE IF NOT EXISTS user_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  image_url text NOT NULL,
  prompt text,
  duration integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS user_videos_user_id_idx ON user_videos (user_id);

-- Enable Row Level Security
ALTER TABLE user_videos ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own videos
CREATE POLICY "Users can view their own videos"
  ON user_videos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own videos
CREATE POLICY "Users can insert their own videos"
  ON user_videos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own videos
CREATE POLICY "Users can update their own videos"
  ON user_videos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own videos
CREATE POLICY "Users can delete their own videos"
  ON user_videos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);