-- Create Extended Platform Tables for NNH Local Platform
--
-- Overview
-- This migration extends the platform with additional tables for Citations, Rankings, Media Management, 
-- AI Autopilot, and AI Usage Tracking.

-- Create citation_sources table
CREATE TABLE IF NOT EXISTS citation_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url_pattern text,
  domain_authority integer DEFAULT 0,
  category text CHECK (category IN ('general', 'industry_specific', 'local')),
  is_active boolean DEFAULT true,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE citation_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citation sources are readable by all authenticated users"
  ON citation_sources FOR SELECT
  TO authenticated
  USING (true);

-- Create citation_listings table
CREATE TABLE IF NOT EXISTS citation_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  source_id uuid NOT NULL REFERENCES citation_sources(id) ON DELETE CASCADE,
  listing_url text,
  business_name text NOT NULL,
  address text,
  phone text,
  status text DEFAULT 'pending' CHECK (status IN ('verified', 'pending', 'inconsistent', 'missing')),
  last_checked timestamptz DEFAULT now(),
  consistency_score integer DEFAULT 0 CHECK (consistency_score >= 0 AND consistency_score <= 100),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE citation_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read citations for own locations"
  ON citation_listings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = citation_listings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert citations for own locations"
  ON citation_listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = citation_listings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update citations for own locations"
  ON citation_listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = citation_listings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = citation_listings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete citations for own locations"
  ON citation_listings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = citation_listings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create keyword_rankings table
CREATE TABLE IF NOT EXISTS keyword_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  search_type text NOT NULL CHECK (search_type IN ('organic', 'local_pack', 'maps')),
  position integer NOT NULL DEFAULT 0,
  previous_position integer,
  url text,
  search_volume integer DEFAULT 0,
  competition text CHECK (competition IN ('low', 'medium', 'high')),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location_id, keyword, search_type, date)
);

ALTER TABLE keyword_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read rankings for own locations"
  ON keyword_rankings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = keyword_rankings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rankings for own locations"
  ON keyword_rankings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = keyword_rankings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rankings for own locations"
  ON keyword_rankings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = keyword_rankings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = keyword_rankings.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create competitor_tracking table
CREATE TABLE IF NOT EXISTS competitor_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  competitor_gmb_id text,
  distance_miles decimal(5,2),
  average_rating decimal(2,1),
  review_count integer DEFAULT 0,
  post_frequency integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE competitor_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read competitors for own locations"
  ON competitor_tracking FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = competitor_tracking.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert competitors for own locations"
  ON competitor_tracking FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = competitor_tracking.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update competitors for own locations"
  ON competitor_tracking FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = competitor_tracking.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = competitor_tracking.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete competitors for own locations"
  ON competitor_tracking FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = competitor_tracking.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create gmb_media table
CREATE TABLE IF NOT EXISTS gmb_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('photo', 'video')),
  category text DEFAULT 'other' CHECK (category IN ('cover', 'logo', 'interior', 'exterior', 'team', 'product', 'other')),
  file_url text NOT NULL,
  thumbnail_url text,
  external_media_id text,
  title text,
  description text,
  file_size bigint DEFAULT 0,
  width integer,
  height integer,
  duration integer,
  view_count integer DEFAULT 0,
  tags jsonb DEFAULT '[]'::jsonb,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gmb_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read media for own locations"
  ON gmb_media FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_media.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert media for own locations"
  ON gmb_media FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_media.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update media for own locations"
  ON gmb_media FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_media.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_media.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete media for own locations"
  ON gmb_media FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_media.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create autopilot_settings table
CREATE TABLE IF NOT EXISTS autopilot_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT false,
  auto_reply_enabled boolean DEFAULT false,
  auto_reply_min_rating integer DEFAULT 1 CHECK (auto_reply_min_rating >= 1 AND auto_reply_min_rating <= 5),
  reply_tone text DEFAULT 'professional' CHECK (reply_tone IN ('professional', 'friendly', 'casual')),
  smart_posting_enabled boolean DEFAULT false,
  post_frequency integer DEFAULT 3 CHECK (post_frequency >= 0 AND post_frequency <= 7),
  post_days jsonb DEFAULT '[]'::jsonb,
  post_times jsonb DEFAULT '[]'::jsonb,
  content_preferences jsonb DEFAULT '{}'::jsonb,
  competitor_monitoring_enabled boolean DEFAULT false,
  insights_reports_enabled boolean DEFAULT false,
  report_frequency text DEFAULT 'weekly' CHECK (report_frequency IN ('daily', 'weekly', 'monthly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location_id)
);

ALTER TABLE autopilot_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read autopilot settings for own locations"
  ON autopilot_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert autopilot settings for own locations"
  ON autopilot_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update autopilot settings for own locations"
  ON autopilot_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete autopilot settings for own locations"
  ON autopilot_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create autopilot_logs table
CREATE TABLE IF NOT EXISTS autopilot_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('auto_reply', 'auto_post', 'report_generated', 'competitor_alert')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('success', 'failed', 'pending')),
  details jsonb DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE autopilot_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read autopilot logs for own locations"
  ON autopilot_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = autopilot_logs.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert autopilot logs for own locations"
  ON autopilot_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = autopilot_logs.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create ai_requests table
CREATE TABLE IF NOT EXISTS ai_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id uuid REFERENCES gmb_locations(id) ON DELETE SET NULL,
  provider text NOT NULL,
  model text NOT NULL,
  feature text NOT NULL,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  cost_usd decimal(10,6) DEFAULT 0,
  latency_ms integer DEFAULT 0,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own AI requests"
  ON ai_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI requests"
  ON ai_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'editor', 'viewer')),
  permissions jsonb DEFAULT '{}'::jsonb,
  locations_access jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read team members where they are owner"
  ON team_members FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = user_id);

CREATE POLICY "Owners can insert team members"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update team members"
  ON team_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete team members"
  ON team_members FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_citation_listings_location_id ON citation_listings(location_id);
CREATE INDEX IF NOT EXISTS idx_citation_listings_source_id ON citation_listings(source_id);
CREATE INDEX IF NOT EXISTS idx_citation_listings_status ON citation_listings(status);

CREATE INDEX IF NOT EXISTS idx_keyword_rankings_location_id ON keyword_rankings(location_id);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_date ON keyword_rankings(date);
CREATE INDEX IF NOT EXISTS idx_keyword_rankings_keyword ON keyword_rankings(keyword);

CREATE INDEX IF NOT EXISTS idx_competitor_tracking_location_id ON competitor_tracking(location_id);

CREATE INDEX IF NOT EXISTS idx_gmb_media_location_id ON gmb_media(location_id);
CREATE INDEX IF NOT EXISTS idx_gmb_media_category ON gmb_media(category);
CREATE INDEX IF NOT EXISTS idx_gmb_media_is_published ON gmb_media(is_published);

CREATE INDEX IF NOT EXISTS idx_autopilot_settings_location_id ON autopilot_settings(location_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_settings_user_id ON autopilot_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_autopilot_logs_location_id ON autopilot_logs(location_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_logs_created_at ON autopilot_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_feature ON ai_requests(feature);

CREATE INDEX IF NOT EXISTS idx_team_members_owner_id ON team_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_citation_sources_updated_at
  BEFORE UPDATE ON citation_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_citation_listings_updated_at
  BEFORE UPDATE ON citation_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_keyword_rankings_updated_at
  BEFORE UPDATE ON keyword_rankings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_competitor_tracking_updated_at
  BEFORE UPDATE ON competitor_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmb_media_updated_at
  BEFORE UPDATE ON gmb_media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_autopilot_settings_updated_at
  BEFORE UPDATE ON autopilot_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();