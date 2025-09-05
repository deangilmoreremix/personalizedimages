/*
  # Enhanced User Profile Schema

  1. Updates
    - Extended profile table with additional user information
    - Added preferences table for user UI settings
    - Added social connections table
    - Added profile verification status

  2. Security
    - Updated RLS policies
    - Added audit trail for profile changes
*/

-- Update profiles table with additional fields if they don't exist
DO $$
BEGIN
  -- Add bio if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN bio text;
  END IF;

  -- Add location if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'location'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN location text;
  END IF;

  -- Add phone if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN phone text;
  END IF;

  -- Add profile_image if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'profile_image'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN profile_image text;
  END IF;

  -- Add cover_image if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'cover_image'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN cover_image text;
  END IF;

  -- Add social_links if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN social_links jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add is_verified if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_verified'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN is_verified boolean DEFAULT false;
  END IF;

  -- Add account_type if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'account_type'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN account_type text DEFAULT 'free';
  END IF;

  -- Add date_format if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'date_format'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN date_format text DEFAULT 'MM/DD/YYYY';
  END IF;
  
  -- Add timezone if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'timezone'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN timezone text DEFAULT 'UTC';
  END IF;

  -- Add language if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'language'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN language text DEFAULT 'en';
  END IF;

  -- Add theme if it doesn't exist
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'theme'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN theme text DEFAULT 'light';
  END IF;
END $$;

-- Create or update function to handle profile updates
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Create profile_audit table if it doesn't exist
CREATE TABLE IF NOT EXISTS profile_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  old_values jsonb,
  new_values jsonb,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on profile_audit
ALTER TABLE profile_audit ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing profile audit logs
CREATE POLICY "Users can view their own profile audit logs"
  ON profile_audit
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

-- Create function to log profile changes
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

-- Create trigger for profile audit
DROP TRIGGER IF EXISTS trigger_profile_audit ON public.profiles;
CREATE TRIGGER trigger_profile_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION log_profile_changes();

-- Create social_connections table if it doesn't exist
CREATE TABLE IF NOT EXISTS social_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_user_id text NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(provider, provider_user_id)
);

-- Enable Row Level Security on social_connections
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing social connections
CREATE POLICY "Users can manage their own social connections"
  ON social_connections
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_social_connections_updated_at ON social_connections;
CREATE TRIGGER update_social_connections_updated_at
  BEFORE UPDATE ON social_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Update user account settings table
CREATE TABLE IF NOT EXISTS account_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  marketing_emails boolean DEFAULT true,
  two_factor_enabled boolean DEFAULT false,
  default_visibility text DEFAULT 'private',
  allow_mentions boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on account_settings
ALTER TABLE account_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for accessing account settings
CREATE POLICY "Users can manage their own account settings"
  ON account_settings
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create trigger for updating timestamps
DROP TRIGGER IF EXISTS update_account_settings_updated_at ON account_settings;
CREATE TRIGGER update_account_settings_updated_at
  BEFORE UPDATE ON account_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- Update handle_new_user function to include new tables
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.profiles (id, avatar_url, username, full_name)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'avatar_url', 
    new.raw_user_meta_data->>'username' OR new.raw_user_meta_data->>'preferred_username',
    new.raw_user_meta_data->>'full_name'
  );
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  INSERT INTO public.ai_settings (user_id)
  VALUES (new.id);
  
  INSERT INTO public.account_settings (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;