/*
  # Create Core Tables for AI Studio Platform

  ## Overview
  This migration sets up the foundational database schema for the GMB & YouTube AI Studio platform.
  
  ## New Tables
  
  ### 1. profiles
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User full name
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. gmb_accounts
  - `id` (uuid, primary key) - Unique account identifier
  - `user_id` (uuid, foreign key) - Owner of the account
  - `account_name` (text) - Display name for the GMB account
  - `account_email` (text) - Google account email
  - `account_id` (text) - GMB account ID from Google
  - `is_active` (boolean) - Whether account is currently connected
  - `created_at` (timestamptz) - When account was connected
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 3. gmb_locations
  - `id` (uuid, primary key) - Unique location identifier
  - `gmb_account_id` (uuid, foreign key) - Parent GMB account
  - `location_name` (text) - Business location name
  - `location_id` (text) - GMB location ID from Google
  - `address` (text) - Full business address
  - `phone` (text) - Business phone number
  - `category` (text) - Business category
  - `website` (text) - Business website URL
  - `is_active` (boolean) - Whether location is active
  - `metadata` (jsonb) - Additional location data (hours, attributes, etc.)
  - `created_at` (timestamptz) - When location was added
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. oauth_tokens
  - `id` (uuid, primary key) - Unique token identifier
  - `user_id` (uuid, foreign key) - Token owner
  - `account_id` (uuid, foreign key) - Related account (gmb_accounts)
  - `provider` (text) - OAuth provider (google_gmb, google_youtube)
  - `access_token` (text) - Encrypted access token
  - `refresh_token` (text) - Encrypted refresh token
  - `expires_at` (timestamptz) - Token expiration time
  - `scope` (text) - OAuth scopes granted
  - `created_at` (timestamptz) - When token was created
  - `updated_at` (timestamptz) - Last token refresh
  
  ## Security
  - Enable RLS on all tables
  - Users can only access their own data
  - Profiles are readable by authenticated users but only updatable by owner
  - GMB accounts, locations, and tokens are fully restricted to owners only
  
  ## Important Notes
  - All timestamps default to now()
  - Boolean fields default to true for is_active
  - JSONB used for flexible metadata storage
  - Cascading deletes ensure data integrity
*/

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create gmb_accounts table
CREATE TABLE IF NOT EXISTS gmb_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_name text NOT NULL,
  account_email text NOT NULL,
  account_id text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gmb_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own GMB accounts"
  ON gmb_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own GMB accounts"
  ON gmb_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own GMB accounts"
  ON gmb_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own GMB accounts"
  ON gmb_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create gmb_locations table
CREATE TABLE IF NOT EXISTS gmb_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gmb_account_id uuid NOT NULL REFERENCES gmb_accounts(id) ON DELETE CASCADE,
  location_name text NOT NULL,
  location_id text NOT NULL,
  address text,
  phone text,
  category text,
  website text,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gmb_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own GMB locations"
  ON gmb_locations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own GMB locations"
  ON gmb_locations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own GMB locations"
  ON gmb_locations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own GMB locations"
  ON gmb_locations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM gmb_accounts
      WHERE gmb_accounts.id = gmb_locations.gmb_account_id
      AND gmb_accounts.user_id = auth.uid()
    )
  );

-- Create oauth_tokens table
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id uuid REFERENCES gmb_accounts(id) ON DELETE CASCADE,
  provider text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own OAuth tokens"
  ON oauth_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own OAuth tokens"
  ON oauth_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own OAuth tokens"
  ON oauth_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own OAuth tokens"
  ON oauth_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gmb_accounts_user_id ON gmb_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_gmb_locations_account_id ON gmb_locations(gmb_account_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_user_id ON oauth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_tokens_account_id ON oauth_tokens(account_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmb_accounts_updated_at
  BEFORE UPDATE ON gmb_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gmb_locations_updated_at
  BEFORE UPDATE ON gmb_locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_tokens_updated_at
  BEFORE UPDATE ON oauth_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();