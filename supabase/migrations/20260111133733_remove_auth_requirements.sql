/*
  # Remove Authentication Requirements

  1. Changes
    - Drop foreign key constraint on wins.user_id
    - Make user_id nullable
    - Disable RLS on wins table (no longer needed without auth)
  
  2. Security
    - RLS disabled as app is now public without authentication
*/

ALTER TABLE wins DROP CONSTRAINT IF EXISTS wins_user_id_fkey;

ALTER TABLE wins ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE wins DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only see their own wins" ON wins;
DROP POLICY IF EXISTS "Users can create their own wins" ON wins;
DROP POLICY IF EXISTS "Users can update their own wins" ON wins;
DROP POLICY IF EXISTS "Users can delete their own wins" ON wins;