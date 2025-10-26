/*
  # Add OAuth fields to GMB accounts table

  1. Changes
    - Add `google_account_id` column to store Google account ID
    - Add `email` column to store account email
    - Add `access_token` column for OAuth tokens
    - Add `refresh_token` column for token refresh
    - Add `token_expires_at` column to track token expiration
    - Add `status` column to track account connection status
    - Add `last_sync` column to track last sync time
    - Rename/update existing columns for consistency

  2. Notes
    - Uses IF NOT EXISTS pattern for safe execution
    - Maintains backward compatibility
*/

-- Add new columns if they don't exist
DO $$ 
BEGIN
  -- Add google_account_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'google_account_id'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN google_account_id text;
  END IF;

  -- Add email (separate from account_email)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'email'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN email text;
  END IF;

  -- Add access_token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'access_token'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN access_token text;
  END IF;

  -- Add refresh_token
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'refresh_token'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN refresh_token text;
  END IF;

  -- Add token_expires_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'token_expires_at'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN token_expires_at timestamptz;
  END IF;

  -- Add status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'status'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN status text DEFAULT 'active';
  END IF;

  -- Add last_sync
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'last_sync'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN last_sync timestamptz;
  END IF;

  -- Add last_login
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gmb_accounts' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE gmb_accounts ADD COLUMN last_login timestamptz;
  END IF;
END $$;

-- Create index on google_account_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_gmb_accounts_google_account_id 
ON gmb_accounts(google_account_id);

-- Create index on user_id and status for faster queries
CREATE INDEX IF NOT EXISTS idx_gmb_accounts_user_status 
ON gmb_accounts(user_id, status);