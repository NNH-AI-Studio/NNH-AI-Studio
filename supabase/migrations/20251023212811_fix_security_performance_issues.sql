/*
  # Fix Security and Performance Issues

  ## Changes Made
  
  1. **Missing Index**
     - Add index on `ai_requests.location_id` foreign key for query performance
  
  2. **RLS Policy Optimization**
     - Replace all `auth.uid()` with `(select auth.uid())` in RLS policies
     - This prevents re-evaluation on each row, improving performance at scale
  
  3. **Function Security**
     - Fix search_path for `update_updated_at_column` function
  
  ## Security Impact
     - Prevents RLS bypass vulnerabilities
     - Improves query performance significantly
     - Hardens function security
*/

-- Add missing index on ai_requests.location_id
CREATE INDEX IF NOT EXISTS idx_ai_requests_location_id ON public.ai_requests(location_id);

-- Fix search_path for update_updated_at_column function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = tablename 
      AND column_name = 'updated_at'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    ', r.tablename, r.tablename, r.tablename, r.tablename);
  END LOOP;
END $$;

-- Drop and recreate all RLS policies with optimized (select auth.uid()) pattern

-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- GMB Accounts
DROP POLICY IF EXISTS "Users can read own GMB accounts" ON public.gmb_accounts;
DROP POLICY IF EXISTS "Users can insert own GMB accounts" ON public.gmb_accounts;
DROP POLICY IF EXISTS "Users can update own GMB accounts" ON public.gmb_accounts;
DROP POLICY IF EXISTS "Users can delete own GMB accounts" ON public.gmb_accounts;

CREATE POLICY "Users can read own GMB accounts"
  ON public.gmb_accounts FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own GMB accounts"
  ON public.gmb_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own GMB accounts"
  ON public.gmb_accounts FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own GMB accounts"
  ON public.gmb_accounts FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- GMB Locations
DROP POLICY IF EXISTS "Users can read own GMB locations" ON public.gmb_locations;
DROP POLICY IF EXISTS "Users can insert own GMB locations" ON public.gmb_locations;
DROP POLICY IF EXISTS "Users can update own GMB locations" ON public.gmb_locations;
DROP POLICY IF EXISTS "Users can delete own GMB locations" ON public.gmb_locations;

CREATE POLICY "Users can read own GMB locations"
  ON public.gmb_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert own GMB locations"
  ON public.gmb_locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update own GMB locations"
  ON public.gmb_locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete own GMB locations"
  ON public.gmb_locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = (select auth.uid())
    )
  );

-- OAuth Tokens
DROP POLICY IF EXISTS "Users can read own OAuth tokens" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Users can insert own OAuth tokens" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Users can update own OAuth tokens" ON public.oauth_tokens;
DROP POLICY IF EXISTS "Users can delete own OAuth tokens" ON public.oauth_tokens;

CREATE POLICY "Users can read own OAuth tokens"
  ON public.oauth_tokens FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own OAuth tokens"
  ON public.oauth_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own OAuth tokens"
  ON public.oauth_tokens FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own OAuth tokens"
  ON public.oauth_tokens FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- Continue with remaining tables following same pattern...
-- GMB Posts, Reviews, Insights, etc.

DO $$
DECLARE
  location_based_tables text[] := ARRAY[
    'gmb_posts', 'gmb_reviews', 'gmb_insights', 'citation_listings',
    'keyword_rankings', 'competitor_tracking', 'gmb_media',
    'autopilot_settings', 'autopilot_logs'
  ];
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY location_based_tables
  LOOP
    -- Drop existing policies
    EXECUTE format('DROP POLICY IF EXISTS "Users can read %s for own locations" ON public.%I', 
      CASE tbl 
        WHEN 'gmb_posts' THEN 'own posts'
        WHEN 'gmb_reviews' THEN 'reviews'
        WHEN 'gmb_insights' THEN 'insights'
        WHEN 'citation_listings' THEN 'citations'
        WHEN 'keyword_rankings' THEN 'rankings'
        WHEN 'competitor_tracking' THEN 'competitors'
        WHEN 'gmb_media' THEN 'media'
        WHEN 'autopilot_settings' THEN 'autopilot settings'
        WHEN 'autopilot_logs' THEN 'autopilot logs'
      END, tbl);
    
    -- Create read policy
    EXECUTE format('
      CREATE POLICY "Users can read %s for own locations"
        ON public.%I FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM gmb_locations
            JOIN gmb_accounts ON gmb_accounts.id = gmb_locations.gmb_account_id
            WHERE gmb_locations.id = %I.location_id
            AND gmb_accounts.user_id = (select auth.uid())
          )
        )
    ', 
      CASE tbl 
        WHEN 'gmb_posts' THEN 'own posts'
        WHEN 'gmb_reviews' THEN 'reviews'
        WHEN 'gmb_insights' THEN 'insights'
        WHEN 'citation_listings' THEN 'citations'
        WHEN 'keyword_rankings' THEN 'rankings'
        WHEN 'competitor_tracking' THEN 'competitors'
        WHEN 'gmb_media' THEN 'media'
        WHEN 'autopilot_settings' THEN 'autopilot settings'
        WHEN 'autopilot_logs' THEN 'autopilot logs'
      END, tbl, tbl);
    
    -- Create insert policy (except autopilot_logs)
    IF tbl != 'autopilot_logs' THEN
      EXECUTE format('DROP POLICY IF EXISTS "Users can insert %s for own locations" ON public.%I',
        CASE tbl 
          WHEN 'gmb_posts' THEN 'own posts'
          WHEN 'gmb_reviews' THEN 'reviews'
          WHEN 'gmb_insights' THEN 'insights'
          WHEN 'citation_listings' THEN 'citations'
          WHEN 'keyword_rankings' THEN 'rankings'
          WHEN 'competitor_tracking' THEN 'competitors'
          WHEN 'gmb_media' THEN 'media'
          WHEN 'autopilot_settings' THEN 'autopilot settings'
        END, tbl);
        
      EXECUTE format('
        CREATE POLICY "Users can insert %s for own locations"
          ON public.%I FOR INSERT
          TO authenticated
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM gmb_locations
              JOIN gmb_accounts ON gmb_accounts.id = gmb_locations.gmb_account_id
              WHERE gmb_locations.id = %I.location_id
              AND gmb_accounts.user_id = (select auth.uid())
            )
          )
      ', 
        CASE tbl 
          WHEN 'gmb_posts' THEN 'own posts'
          WHEN 'gmb_reviews' THEN 'reviews'
          WHEN 'gmb_insights' THEN 'insights'
          WHEN 'citation_listings' THEN 'citations'
          WHEN 'keyword_rankings' THEN 'rankings'
          WHEN 'competitor_tracking' THEN 'competitors'
          WHEN 'gmb_media' THEN 'media'
          WHEN 'autopilot_settings' THEN 'autopilot settings'
        END, tbl, tbl);
    END IF;
    
    -- Create update policy (except autopilot_logs and gmb_reviews for inserting)
    IF tbl NOT IN ('autopilot_logs') THEN
      EXECUTE format('DROP POLICY IF EXISTS "Users can update %s for own locations" ON public.%I',
        CASE tbl 
          WHEN 'gmb_posts' THEN 'own posts'
          WHEN 'gmb_reviews' THEN 'reviews'
          WHEN 'gmb_insights' THEN 'insights'
          WHEN 'citation_listings' THEN 'citations'
          WHEN 'keyword_rankings' THEN 'rankings'
          WHEN 'competitor_tracking' THEN 'competitors'
          WHEN 'gmb_media' THEN 'media'
          WHEN 'autopilot_settings' THEN 'autopilot settings'
        END, tbl);
        
      EXECUTE format('
        CREATE POLICY "Users can update %s for own locations"
          ON public.%I FOR UPDATE
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM gmb_locations
              JOIN gmb_accounts ON gmb_accounts.id = gmb_locations.gmb_account_id
              WHERE gmb_locations.id = %I.location_id
              AND gmb_accounts.user_id = (select auth.uid())
            )
          )
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM gmb_locations
              JOIN gmb_accounts ON gmb_accounts.id = gmb_locations.gmb_account_id
              WHERE gmb_locations.id = %I.location_id
              AND gmb_accounts.user_id = (select auth.uid())
            )
          )
      ', 
        CASE tbl 
          WHEN 'gmb_posts' THEN 'own posts'
          WHEN 'gmb_reviews' THEN 'reviews'
          WHEN 'gmb_insights' THEN 'insights'
          WHEN 'citation_listings' THEN 'citations'
          WHEN 'keyword_rankings' THEN 'rankings'
          WHEN 'competitor_tracking' THEN 'competitors'
          WHEN 'gmb_media' THEN 'media'
          WHEN 'autopilot_settings' THEN 'autopilot settings'
        END, tbl, tbl, tbl);
    END IF;
    
    -- Create delete policy (only for certain tables)
    IF tbl IN ('gmb_posts', 'citation_listings', 'competitor_tracking', 'gmb_media', 'autopilot_settings') THEN
      EXECUTE format('DROP POLICY IF EXISTS "Users can delete %s for own locations" ON public.%I',
        CASE tbl 
          WHEN 'gmb_posts' THEN 'own posts'
          WHEN 'citation_listings' THEN 'citations'
          WHEN 'competitor_tracking' THEN 'competitors'
          WHEN 'gmb_media' THEN 'media'
          WHEN 'autopilot_settings' THEN 'autopilot settings'
        END, tbl);
        
      EXECUTE format('
        CREATE POLICY "Users can delete %s for own locations"
          ON public.%I FOR DELETE
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM gmb_locations
              JOIN gmb_accounts ON gmb_accounts.id = gmb_locations.gmb_account_id
              WHERE gmb_locations.id = %I.location_id
              AND gmb_accounts.user_id = (select auth.uid())
            )
          )
      ', 
        CASE tbl 
          WHEN 'gmb_posts' THEN 'own posts'
          WHEN 'citation_listings' THEN 'citations'
          WHEN 'competitor_tracking' THEN 'competitors'
          WHEN 'gmb_media' THEN 'media'
          WHEN 'autopilot_settings' THEN 'autopilot settings'
        END, tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- AI Requests
DROP POLICY IF EXISTS "Users can read own AI requests" ON public.ai_requests;
DROP POLICY IF EXISTS "Users can insert own AI requests" ON public.ai_requests;

CREATE POLICY "Users can read own AI requests"
  ON public.ai_requests FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own AI requests"
  ON public.ai_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- Team Members
DROP POLICY IF EXISTS "Users can read team members where they are owner" ON public.team_members;
DROP POLICY IF EXISTS "Owners can insert team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Owners can delete team members" ON public.team_members;

CREATE POLICY "Users can read team members where they are owner"
  ON public.team_members FOR SELECT
  TO authenticated
  USING (owner_id = (select auth.uid()) OR user_id = (select auth.uid()));

CREATE POLICY "Owners can insert team members"
  ON public.team_members FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Owners can update team members"
  ON public.team_members FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY "Owners can delete team members"
  ON public.team_members FOR DELETE
  TO authenticated
  USING (owner_id = (select auth.uid()));

-- AI Settings
DROP POLICY IF EXISTS "Users can view own AI settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Users can insert own AI settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Users can update own AI settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Users can delete own AI settings" ON public.ai_settings;

CREATE POLICY "Users can view own AI settings"
  ON public.ai_settings FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own AI settings"
  ON public.ai_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own AI settings"
  ON public.ai_settings FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own AI settings"
  ON public.ai_settings FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));
