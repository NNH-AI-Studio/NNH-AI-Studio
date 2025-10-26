/*
  # Fix Duplicate RLS Policies

  1. Changes
    - Remove duplicate policies from gmb_accounts table
    - Remove duplicate policies from profiles table
    - Keep only the authenticated user policies (more secure)
  
  2. Security
    - Maintain proper RLS security
    - Remove public role policies (less secure)
    - Keep authenticated role policies
*/

-- Drop duplicate policies from gmb_accounts
DROP POLICY IF EXISTS "Allow insert for logged in users" ON gmb_accounts;
DROP POLICY IF EXISTS "Allow read for own user" ON gmb_accounts;

-- Drop duplicate policies from profiles
DROP POLICY IF EXISTS "Allow insert profile" ON profiles;
DROP POLICY IF EXISTS "Allow read own profile" ON profiles;
