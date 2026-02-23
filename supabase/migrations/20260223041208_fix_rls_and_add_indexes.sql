/*
  # Fix RLS Policies and Add Missing Indexes

  1. Security Changes
    - Fix `landing_page_images` SELECT policy to allow public (unauthenticated) access
      for active images, since these are displayed on the public landing page
    - Tighten `credit_transactions` INSERT policy to require authenticated user matching user_id
    - Tighten `usage_logs` INSERT policy to require authenticated user matching user_id

  2. Performance Indexes
    - Add index on `landing_page_images(section, is_active)` for section-based lookups
    - Add index on `content_revisions(landing_page_image_id)` for foreign key joins
    - Add index on `generated_images(user_id, created_at)` for analytics dashboard queries
    - Add index on `credit_transactions(user_id, created_at)` for transaction history
    - Add index on `usage_logs(user_id, created_at)` for usage reporting

  3. Important Notes
    - Uses IF NOT EXISTS to prevent errors on re-run
    - Does not drop any existing data or columns
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'landing_page_images'
    AND policyname = 'Anyone can read active landing page images'
  ) THEN
    DROP POLICY "Anyone can read active landing page images" ON landing_page_images;
  END IF;
END $$;

CREATE POLICY "Public can read active landing page images"
  ON landing_page_images FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'credit_transactions'
    AND policyname = 'System can insert transactions'
  ) THEN
    DROP POLICY "System can insert transactions" ON credit_transactions;
  END IF;
END $$;

CREATE POLICY "Authenticated users insert own transactions"
  ON credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'usage_logs'
    AND policyname = 'System can insert usage logs'
  ) THEN
    DROP POLICY "System can insert usage logs" ON usage_logs;
  END IF;
END $$;

CREATE POLICY "Authenticated users insert own usage logs"
  ON usage_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_landing_page_images_section_active
  ON landing_page_images(section, is_active);

CREATE INDEX IF NOT EXISTS idx_content_revisions_image_id
  ON content_revisions(landing_page_image_id);

CREATE INDEX IF NOT EXISTS idx_generated_images_user_created
  ON generated_images(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created
  ON credit_transactions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_created
  ON usage_logs(user_id, created_at DESC);
