/*
  # Create rate_limits table for persistent rate limiting

  1. New Tables
    - `rate_limits`
      - `id` (uuid, primary key)
      - `identifier` (text, the rate limit key e.g. user_id or IP hash)
      - `request_count` (integer, number of requests in current window)
      - `window_start` (timestamptz, when the current rate limit window began)
      - `is_authenticated` (boolean, whether this is an authenticated user)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Indexes
    - Unique index on (identifier, is_authenticated) for fast lookups
    - Index on window_start for cleanup queries

  3. Security
    - Enable RLS on `rate_limits` table
    - No user-facing policies (only accessed by edge functions via service role)

  4. Maintenance
    - Function to clean up expired rate limit windows (older than 2 hours)
*/

CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  request_count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  is_authenticated boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_auth
  ON rate_limits (identifier, is_authenticated);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON rate_limits (window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start < now() - interval '2 hours';
END;
$$;
