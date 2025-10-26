/*
  # Create Posts, Reviews, and Insights Tables

  ## Overview
  This migration adds support for GMB posts management, customer reviews tracking, and business insights/analytics data.

  ## New Tables

  ### 1. gmb_posts
  - `id` (uuid, primary key) - Unique post identifier
  - `user_id` (uuid, foreign key) - Post creator
  - `location_id` (uuid, foreign key) - Associated location
  - `post_type` (text) - Type of post: 'photo', 'event', 'offer', 'update'
  - `caption` (text) - Post content/description
  - `image_url` (text) - URL to post image in storage
  - `external_post_id` (text) - GMB post ID from Google (nullable)
  - `status` (text) - Post status: 'draft', 'published', 'scheduled', 'failed'
  - `scheduled_at` (timestamptz) - When to publish (for scheduled posts)
  - `published_at` (timestamptz) - When post was published
  - `engagement` (jsonb) - Likes, comments, shares stats
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. gmb_reviews
  - `id` (uuid, primary key) - Unique review identifier
  - `location_id` (uuid, foreign key) - Location being reviewed
  - `external_review_id` (text) - Review ID from Google
  - `author_name` (text) - Reviewer name
  - `rating` (integer) - Star rating 1-5
  - `review_text` (text) - Review content
  - `review_date` (timestamptz) - When review was posted
  - `reply_text` (text) - Business reply to review
  - `reply_date` (timestamptz) - When reply was posted
  - `has_reply` (boolean) - Whether review has been replied to
  - `created_at` (timestamptz) - When synced to our DB
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. gmb_insights
  - `id` (uuid, primary key) - Unique insight record identifier
  - `location_id` (uuid, foreign key) - Location for these metrics
  - `date` (date) - Date for these metrics
  - `metric_type` (text) - Type: 'views', 'searches', 'calls', 'messages', 'directions'
  - `metric_value` (integer) - The metric count
  - `source` (text) - Data source: 'direct', 'discovery', 'branded'
  - `created_at` (timestamptz) - When recorded
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - Enable RLS on all tables
  - Users can only access data for locations they own
  - Posts can be created/updated/deleted by location owners
  - Reviews are read-only from user perspective (synced from Google)
  - Insights are read-only analytics data

  ## Important Notes
  - Posts support scheduling for future publishing
  - Reviews include reply functionality
  - Insights track daily metrics by type and source
  - JSONB used for flexible engagement data
  - Indexes added for performance on common queries
*/

-- Create gmb_posts table
CREATE TABLE IF NOT EXISTS gmb_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  post_type text NOT NULL CHECK (post_type IN ('photo', 'event', 'offer', 'update')),
  caption text NOT NULL,
  image_url text,
  external_post_id text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled', 'failed')),
  scheduled_at timestamptz,
  published_at timestamptz,
  engagement jsonb DEFAULT '{"likes": 0, "comments": 0, "shares": 0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gmb_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own posts"
  ON gmb_posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON gmb_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON gmb_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON gmb_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create gmb_reviews table
CREATE TABLE IF NOT EXISTS gmb_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  external_review_id text UNIQUE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  review_date timestamptz NOT NULL,
  reply_text text,
  reply_date timestamptz,
  has_reply boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gmb_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read reviews for own locations"
  ON gmb_reviews FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_reviews.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reviews for own locations"
  ON gmb_reviews FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_reviews.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_reviews.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reviews for own locations"
  ON gmb_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_reviews.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create gmb_insights table
CREATE TABLE IF NOT EXISTS gmb_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES gmb_locations(id) ON DELETE CASCADE,
  date date NOT NULL,
  metric_type text NOT NULL CHECK (metric_type IN ('views', 'searches', 'calls', 'messages', 'directions', 'website_clicks')),
  metric_value integer NOT NULL DEFAULT 0,
  source text CHECK (source IN ('direct', 'discovery', 'branded', 'total')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location_id, date, metric_type, source)
);

ALTER TABLE gmb_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read insights for own locations"
  ON gmb_insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_insights.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert insights for own locations"
  ON gmb_insights FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_insights.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update insights for own locations"
  ON gmb_insights FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_insights.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_locations
      JOIN gmb_accounts ON gmb_locations.gmb_account_id = gmb_accounts.id
      WHERE gmb_locations.id = gmb_insights.location_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gmb_posts_user_id ON gmb_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_gmb_posts_location_id ON gmb_posts(location_id);
CREATE INDEX IF NOT EXISTS idx_gmb_posts_status ON gmb_posts(status);
CREATE INDEX IF NOT EXISTS idx_gmb_posts_scheduled_at ON gmb_posts(scheduled_at) WHERE status = 'scheduled';

CREATE INDEX IF NOT EXISTS idx_gmb_reviews_location_id ON gmb_reviews(location_id);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_rating ON gmb_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_gmb_reviews_has_reply ON gmb_reviews(has_reply);

CREATE INDEX IF NOT EXISTS idx_gmb_insights_location_id ON gmb_insights(location_id);
CREATE INDEX IF NOT EXISTS idx_gmb_insights_date ON gmb_insights(date);
CREATE INDEX IF NOT EXISTS idx_gmb_insights_metric_type ON gmb_insights(metric_type);

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_gmb_posts_updated_at
  BEFORE UPDATE ON gmb_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmb_reviews_updated_at
  BEFORE UPDATE ON gmb_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmb_insights_updated_at
  BEFORE UPDATE ON gmb_insights
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();