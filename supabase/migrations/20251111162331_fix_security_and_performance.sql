/*
  # Security and Performance Optimization Migration

  This migration addresses critical security and performance issues:

  1. Missing Foreign Key Indexes - Add 3 indexes
  2. RLS Policy Optimization - Optimize 32+ policies  
  3. Function Search Path Security - Fix mutable search path
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_generation_queue_result_image_id ON generation_queue(result_image_id);
CREATE INDEX IF NOT EXISTS idx_prompt_favorites_prompt_id ON prompt_favorites(prompt_id);
CREATE INDEX IF NOT EXISTS idx_user_images_user_id_fkey ON user_images(user_id);

-- Optimize user_generated_images RLS policies
DROP POLICY IF EXISTS "Users can insert their own generated images" ON user_generated_images;
DROP POLICY IF EXISTS "Users can view their own generated images" ON user_generated_images;

CREATE POLICY "Users can insert their own generated images" ON user_generated_images FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can view their own generated images" ON user_generated_images FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Optimize user_images RLS policies
DROP POLICY IF EXISTS "Users can view own images" ON user_images;
DROP POLICY IF EXISTS "Users can insert own images" ON user_images;
DROP POLICY IF EXISTS "Users can update own images" ON user_images;
DROP POLICY IF EXISTS "Users can delete own images" ON user_images;

CREATE POLICY "Users can view own images" ON user_images FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own images" ON user_images FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own images" ON user_images FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own images" ON user_images FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Optimize folders RLS policies
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can insert own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

CREATE POLICY "Users can view own folders" ON folders FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own folders" ON folders FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own folders" ON folders FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own folders" ON folders FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Optimize image_tags RLS policies
DROP POLICY IF EXISTS "Users can view tags for own images" ON image_tags;
DROP POLICY IF EXISTS "Users can insert tags for own images" ON image_tags;
DROP POLICY IF EXISTS "Users can delete tags from own images" ON image_tags;

CREATE POLICY "Users can view tags for own images" ON image_tags FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM user_images WHERE user_images.id = image_tags.image_id AND user_images.user_id = (SELECT auth.uid())));
CREATE POLICY "Users can insert tags for own images" ON image_tags FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM user_images WHERE user_images.id = image_tags.image_id AND user_images.user_id = (SELECT auth.uid())));
CREATE POLICY "Users can delete tags from own images" ON image_tags FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM user_images WHERE user_images.id = image_tags.image_id AND user_images.user_id = (SELECT auth.uid())));

-- Optimize prompt_history RLS policies
DROP POLICY IF EXISTS "Users can view own prompt history" ON prompt_history;
DROP POLICY IF EXISTS "Users can insert own prompt history" ON prompt_history;
DROP POLICY IF EXISTS "Users can update own prompt history" ON prompt_history;
DROP POLICY IF EXISTS "Users can delete own prompt history" ON prompt_history;

CREATE POLICY "Users can view own prompt history" ON prompt_history FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own prompt history" ON prompt_history FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own prompt history" ON prompt_history FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own prompt history" ON prompt_history FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Optimize prompt_favorites RLS policies
DROP POLICY IF EXISTS "Users can view own favorites" ON prompt_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON prompt_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON prompt_favorites;

CREATE POLICY "Users can view own favorites" ON prompt_favorites FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own favorites" ON prompt_favorites FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own favorites" ON prompt_favorites FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Optimize generation_queue RLS policies
DROP POLICY IF EXISTS "Users can view own queue items" ON generation_queue;
DROP POLICY IF EXISTS "Users can insert own queue items" ON generation_queue;
DROP POLICY IF EXISTS "Users can update own queue items" ON generation_queue;
DROP POLICY IF EXISTS "Users can delete own queue items" ON generation_queue;

CREATE POLICY "Users can view own queue items" ON generation_queue FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own queue items" ON generation_queue FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own queue items" ON generation_queue FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own queue items" ON generation_queue FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Optimize token_profiles RLS policies
DROP POLICY IF EXISTS "Users can view own token profiles" ON token_profiles;
DROP POLICY IF EXISTS "Users can insert own token profiles" ON token_profiles;
DROP POLICY IF EXISTS "Users can update own token profiles" ON token_profiles;
DROP POLICY IF EXISTS "Users can delete own token profiles" ON token_profiles;

CREATE POLICY "Users can view own token profiles" ON token_profiles FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own token profiles" ON token_profiles FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update own token profiles" ON token_profiles FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can delete own token profiles" ON token_profiles FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- Optimize analytics_events RLS policies
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert own analytics" ON analytics_events;

CREATE POLICY "Users can view own analytics" ON analytics_events FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can insert own analytics" ON analytics_events FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

-- Fix function search path mutability
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate triggers
DROP TRIGGER IF EXISTS update_user_images_updated_at ON user_images;
CREATE TRIGGER update_user_images_updated_at BEFORE UPDATE ON user_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_folders_updated_at ON folders;
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompt_history_updated_at ON prompt_history;
CREATE TRIGGER update_prompt_history_updated_at BEFORE UPDATE ON prompt_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_token_profiles_updated_at ON token_profiles;
CREATE TRIGGER update_token_profiles_updated_at BEFORE UPDATE ON token_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
