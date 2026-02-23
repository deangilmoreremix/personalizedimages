/*
  # Fix Credit Functions - Add Caller Validation

  1. Security Changes
    - `deduct_credit(p_user_id, p_reason)` now validates that `auth.uid() = p_user_id`
      before proceeding, preventing any authenticated user from deducting credits
      from a different user's account.
    - `check_and_deduct_credit(p_user_id, p_reason)` now validates that
      `auth.uid() = p_user_id` before proceeding, preventing cross-user
      credit theft.

  2. Important Notes
    - Both functions are SECURITY DEFINER (run as DB owner) to enable
      atomic UPDATE + INSERT. The caller validation is critical because
      RLS is bypassed inside SECURITY DEFINER functions.
    - Previously, any authenticated user could call these functions with
      any user_id, draining another user's credits.
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
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: caller does not match target user';
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
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('allowed', false, 'balance', 0, 'error', 'unauthorized');
  END IF;

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
