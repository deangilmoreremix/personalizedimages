/*
  # Authentication and User Profile Setup

  1. New Tables
    - Create trigger function to handle new user profile creation
  
  2. Security
    - Set up RLS policies for profile access
*/

-- Create trigger function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');

  -- Create default user preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  -- Create default AI settings
  INSERT INTO public.ai_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update the update_timestamp function if it doesn't exist
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column to users if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add updated_at column handler
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to users if it doesn't exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Make sure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Ensure users have the right security policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
  ON public.users 
  FOR SELECT 
  TO authenticated 
  USING (id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
  ON public.users 
  FOR UPDATE 
  TO authenticated 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Ensure we have an email uniqueness constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_email_key,
ADD CONSTRAINT users_email_key UNIQUE (email);