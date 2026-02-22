/*
  # Fix generated_images SELECT RLS policy

  1. Security Changes
    - Drop the existing SELECT policy on `generated_images` which allowed access when `user_id IS NULL`
    - Replace with a strict policy that only allows authenticated users to view their own images
    - This closes a vulnerability where unauthenticated requests could read images with null user_id

  2. Important Notes
    - INSERT and DELETE policies are already correct (require auth.uid() = user_id)
    - Only the SELECT policy needed tightening
*/

DROP POLICY IF EXISTS "Users can view their own images" ON generated_images;

CREATE POLICY "Users can view their own images"
  ON generated_images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
