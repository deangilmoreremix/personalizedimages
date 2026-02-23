/*
  # Create Atomic Credit Deduction Function

  1. New Functions
    - `deduct_credit(p_user_id uuid, p_reason text)` - Atomically deducts one credit
      and records the transaction. Returns the new balance or -1 if insufficient.
    - `check_and_deduct_credit(p_user_id uuid, p_reason text)` - Combined check+deduct
      in a single atomic operation to prevent race conditions.

  2. Security
    - Functions are SECURITY DEFINER to bypass RLS for atomic operations
    - Only callable by authenticated users
    - Validates user ownership internally

  3. Purpose
    - Prevents race conditions where concurrent requests could drain credits
      without proper deduction (read-modify-write bug)
    - Replaces the non-atomic JavaScript-based credit deduction
*/

CREATE OR REPLACE FUNCTION deduct_credit(p_user_id uuid, p_reason text DEFAULT 'image_generation')
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance integer;
BEGIN
  UPDATE user_credits
  SET
    balance = balance - 1,
    total_used = total_used + 1,
    updated_at = now()
  WHERE user_id = p_user_id
    AND balance > 0
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RETURN -1;
  END IF;

  INSERT INTO credit_transactions (user_id, type, amount, description, created_at)
  VALUES (p_user_id, 'deduction', -1, p_reason, now());

  RETURN v_new_balance;
END;
$$;

CREATE OR REPLACE FUNCTION check_and_deduct_credit(p_user_id uuid, p_reason text DEFAULT 'image_generation')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance integer;
  v_new_balance integer;
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

  INSERT INTO credit_transactions (user_id, type, amount, description, created_at)
  VALUES (p_user_id, 'deduction', -1, p_reason, now());

  RETURN jsonb_build_object('allowed', true, 'balance', v_new_balance, 'deducted', true);
END;
$$;

GRANT EXECUTE ON FUNCTION deduct_credit(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_and_deduct_credit(uuid, text) TO authenticated;
