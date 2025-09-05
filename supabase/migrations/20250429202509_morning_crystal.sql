/*
  # Fix Authentication and User Profile Schema

  1. Updates
    - Properly set up RLS policies on public.users and public.profiles tables
    - Ensure the handle_new_user trigger function correctly creates user records
    - Add missing indexes and constraints for better performance and data integrity

  2. Security
    - Fix RLS policies to ensure proper access control
    - Ensure users can only access their own data
*/

-- First, make sure the update_timestamp function exists
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fix the handle_new_user trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user record in public.users table
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;

  -- Create profile record
  INSERT INTO public.profiles (id, avatar_url, username, full_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'avatar_url', 
    COALESCE(
      new.raw_user_meta_data->>'username', 
      new.raw_user_meta_data->>'preferred_username', 
      'user_' || substr(new.id::text, 1, 8)
    ),
    new.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default preferences if user_preferences table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  -- Create default AI settings if ai_settings table exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_settings') THEN
    INSERT INTO public.ai_settings (user_id)
    VALUES (new.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Make sure the profiles table has the correct schema
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) THEN
    -- Create profiles table if it doesn't exist
    CREATE TABLE profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      avatar_url text,
      username text UNIQUE,
      full_name text,
      website text,
      updated_at timestamptz DEFAULT now(),
      bio text,
      location text,
      phone text,
      profile_image text,
      cover_image text,
      social_links jsonb DEFAULT '{}'::jsonb,
      is_verified boolean DEFAULT false,
      account_type text DEFAULT 'free',
      date_format text DEFAULT 'MM/DD/YYYY',
      timezone text DEFAULT 'UTC',
      language text DEFAULT 'en',
      theme text DEFAULT 'light'
    );

    -- Create username index
    CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON profiles(username);
  END IF;
END $$;

-- Make sure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Fix policies on profiles - remove and recreate
DROP POLICY IF EXISTS "Public can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;

-- Create proper policies
CREATE POLICY "Public can view profiles"
  ON profiles
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Users can manage their own profiles"
  ON profiles
  FOR ALL
  TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fix policies on users table - remove and recreate
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;

-- Create a single, clear policy for users table
CREATE POLICY "Users can manage their own user data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Make sure we have triggers for updated_at timestamps
-- Create the profile update function if it doesn't exist
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure we have the proper trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Add proper trigger for users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Create audit logging for profiles if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profile_audit'
  ) THEN
    CREATE TABLE profile_audit (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      action text NOT NULL,
      old_values jsonb,
      new_values jsonb,
      changed_by uuid REFERENCES auth.users(id),
      changed_at timestamptz DEFAULT now()
    );

    -- Enable RLS on profile audit
    ALTER TABLE profile_audit ENABLE ROW LEVEL SECURITY;

    -- Create policy for accessing profile audit logs
    CREATE POLICY "Users can view their own profile audit logs"
      ON profile_audit
      FOR SELECT
      TO authenticated
      USING (profile_id = auth.uid());
  END IF;
END $$;

-- Create log function for profile changes if it doesn't exist
CREATE OR REPLACE FUNCTION log_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profile_audit(profile_id, action, old_values, new_values, changed_by)
  VALUES (
    NEW.id,
    TG_OP,
    CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END,
    to_jsonb(NEW),
    auth.uid()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile audit if it doesn't exist
DROP TRIGGER IF EXISTS trigger_profile_audit ON profiles;
CREATE TRIGGER trigger_profile_audit
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_changes();