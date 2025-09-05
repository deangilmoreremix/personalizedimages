/*
  # Video System and Payment Integration

  1. New Tables
    - `user_videos` - Stores user-generated videos with metadata
    - `user_payments` - Stores payment information for video purchases
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own content
*/

-- Create user videos table if it doesn't exist yet
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

-- Create policies for users to manage their own videos (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'Users can view their own videos' 
        AND c.relname = 'user_videos'
    ) THEN
        CREATE POLICY "Users can view their own videos"
          ON user_videos
          FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'Users can insert their own videos' 
        AND c.relname = 'user_videos'
    ) THEN
        CREATE POLICY "Users can insert their own videos"
          ON user_videos
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'Users can update their own videos' 
        AND c.relname = 'user_videos'
    ) THEN
        CREATE POLICY "Users can update their own videos"
          ON user_videos
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'Users can delete their own videos' 
        AND c.relname = 'user_videos'
    ) THEN
        CREATE POLICY "Users can delete their own videos"
          ON user_videos
          FOR DELETE
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Create user payments table for video purchases
CREATE TABLE IF NOT EXISTS user_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_intent_id text NOT NULL,
  video_id text NOT NULL,
  amount integer NOT NULL,
  status text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS user_payments_user_id_idx ON user_payments (user_id);
CREATE INDEX IF NOT EXISTS user_payments_video_id_idx ON user_payments (video_id);

-- Enable Row Level Security
ALTER TABLE user_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for users to manage their own payments (with existence checks)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'Users can view their own payments' 
        AND c.relname = 'user_payments'
    ) THEN
        CREATE POLICY "Users can view their own payments"
          ON user_payments
          FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_policy p
        JOIN pg_catalog.pg_class c ON p.polrelid = c.oid
        WHERE p.polname = 'Users can insert their own payments' 
        AND c.relname = 'user_payments'
    ) THEN
        CREATE POLICY "Users can insert their own payments"
          ON user_payments
          FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;