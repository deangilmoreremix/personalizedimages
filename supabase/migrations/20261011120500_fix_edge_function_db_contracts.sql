/*
  # Fix Edge Function DB Contracts (service-role runtime compatibility)

  1. Background
     - Edge functions in supabase/functions/_shared/cors.ts talk to Postgres
       through the service-role key (SUPABASE_SERVICE_ROLE_KEY).
     - The deployed schema (created by earlier migrations) does not match what
       the edge-function runtime expects:
       a. `rate_limits` was created by 20251219164908 with `endpoint TEXT NOT NULL`
          and no `is_authenticated` / `updated_at` columns. The later
          20260222134334 CREATE TABLE IF NOT EXISTS was a no-op, so every
          `checkRateLimit()` call from cors.ts fails (unknown column + NOT
          NULL violation) and fails closed with HTTP 429.
       b. `check_and_deduct_credit(p_user_id, p_reason)` (20260223214134) now
          validates `auth.uid() = p_user_id`. When the edge function calls it
          with the service-role key, `auth.uid()` IS NULL, so it always returns
          `{"allowed": false}` — every credit-gated function is denied.
       c. `credit_transactions.type` CHECK does not include 'deduction' and
          `balance_after` is NOT NULL without default, while the atomic credit
          functions INSERT 'deduction' rows without `balance_after` — the RPC
          raises and callers see a failure (both frontend and edge).
       d. `generated_videos` lacks `status`, `progress`, `error_message`,
          `updated_at`, `format`, `metadata` columns that the `video-status`
          and `video-result` edge functions select.

  2. Changes (all idempotent, safe to re-run)
     - Align `rate_limits` with the edge-function contract (add missing
       columns, de-duplicate rows, add (identifier, is_authenticated) unique
       index for PostgREST `Prefer: resolution=merge-duplicates` upserts).
     - Add `check_and_deduct_credit_service(p_user_id, p_reason)` —
       SECURITY DEFINER, executable ONLY by service_role (revoked from PUBLIC),
       performing the same atomic deduction without the auth.uid() caller
       check (the edge function has already authenticated the user via
       /auth/v1/user before calling).
     - Relax `credit_transactions` type CHECK to include 'deduction' and give
       `balance_after` a default so legacy RPC inserts succeed.
     - Add missing `generated_videos` columns + index.
     - Ensure the `landing-page-images` storage bucket exists (created at
       runtime by src/services/landingPageContentService.ts today).

  3. Security Notes
     - The new service function must NOT be callable by `authenticated` users;
       grants are explicit and reverted from PUBLIC.
     - The original caller-validation migration 20260223214134 stays in force
       for direct frontend RPC calls (anon/user JWT path).
*/

-- ============================================================
-- 1. rate_limits: match edge-function (service-role) contract
-- ============================================================

ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS is_authenticated boolean NOT NULL DEFAULT false;
ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DO $$
BEGIN
  -- Only relax `endpoint` if the column exists and is NOT NULL (shape from
  -- 20251219164908). If the table was created by 20260222134334 there is no
  -- endpoint column and this is a no-op.
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rate_limits' AND column_name = 'endpoint'
  ) THEN
    ALTER TABLE rate_limits ALTER COLUMN endpoint DROP NOT NULL;
  END IF;
END $$;

-- De-duplicate rows per (identifier, is_authenticated) keeping the newest
-- (highest ctid) so the unique index below can be created on legacy data.
DELETE FROM rate_limits a
USING rate_limits b
WHERE a.identifier = b.identifier
  AND a.is_authenticated = b.is_authenticated
  AND a.ctid < b.ctid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_auth
  ON rate_limits (identifier, is_authenticated);

-- Service role needs full access for the edge-function upsert pattern.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'rate_limits'
      AND policyname = 'Service role can manage rate limits'
  ) THEN
    CREATE POLICY "Service role can manage rate limits"
      ON rate_limits FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- 2. Service-role-callable atomic credit deduction
-- ============================================================

CREATE OR REPLACE FUNCTION check_and_deduct_credit_service(
  p_user_id uuid,
  p_reason text DEFAULT 'edge_function_generation'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
  v_balance_after integer;
BEGIN
  SELECT balance INTO v_balance
  FROM user_credits
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, balance, total_used, created_at, updated_at)
    VALUES (p_user_id, 0, 0, now(), now());
    RETURN jsonb_build_object('allowed', false, 'balance', 0, 'error', 'no_credits');
  END IF;

  IF v_balance <= 0 THEN
    RETURN jsonb_build_object('allowed', false, 'balance', v_balance, 'error', 'insufficient_credits');
  END IF;

  UPDATE user_credits
  SET
    balance = balance - 1,
    total_used = total_used + 1,
    updated_at = now()
  WHERE user_id = p_user_id
    AND balance > 0
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'balance', 0, 'error', 'race_condition_prevented');
  END IF;

  v_balance_after := v_new_balance;

  INSERT INTO credit_transactions (user_id, type, amount, balance_after, description, created_at)
  VALUES (p_user_id, 'deduction', -1, v_balance_after, p_reason, now());

  RETURN jsonb_build_object('allowed', true, 'balance', v_new_balance, 'deducted', true);
END;
$$;

-- Only the service role may execute this function.
REVOKE ALL ON FUNCTION check_and_deduct_credit_service(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION check_and_deduct_credit_service(uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION check_and_deduct_credit_service(uuid, text) TO service_role;

-- ============================================================
-- 3. credit_transactions: accept 'deduction' rows written by RPCs
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'credit_transactions' AND column_name = 'balance_after'
  ) THEN
    ALTER TABLE credit_transactions ALTER COLUMN balance_after SET DEFAULT 0;
  END IF;
END $$;

DO $$
DECLARE
  v_conname text;
  v_def text;
BEGIN
  SELECT con.conname, pg_get_constraintdef(con.oid)
  INTO v_conname, v_def
  FROM pg_constraint con
  JOIN pg_class rel ON rel.oid = con.conrelid
  JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE nsp.nspname = 'public'
    AND rel.relname = 'credit_transactions'
    AND con.contype = 'c'
    AND pg_get_constraintdef(con.oid) ILIKE '%purchase%'
    AND pg_get_constraintdef(con.oid) ILIKE '%type%'
  LIMIT 1;

  IF v_conname IS NOT NULL AND v_def NOT ILIKE '%deduction%' THEN
    EXECUTE format('ALTER TABLE credit_transactions DROP CONSTRAINT %I', v_conname);
    ALTER TABLE credit_transactions
      ADD CONSTRAINT credit_transactions_type_check
      CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'deduction'));
  ELSIF v_conname IS NULL THEN
    ALTER TABLE credit_transactions
      ADD CONSTRAINT credit_transactions_type_check
      CHECK (type IN ('purchase', 'usage', 'refund', 'bonus', 'deduction'));
  END IF;
END $$;

-- ============================================================
-- 4. generated_videos: columns required by video-status / video-result
-- ============================================================

ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS progress integer NOT NULL DEFAULT 0;
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS error_message text;
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS format text NOT NULL DEFAULT 'mp4';
ALTER TABLE generated_videos ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_generated_videos_user_created
  ON generated_videos (user_id, created_at DESC);

-- ============================================================
-- 5. Storage bucket for landing page images (idempotent)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('landing-page-images', 'landing-page-images', true)
ON CONFLICT (id) DO NOTHING;
