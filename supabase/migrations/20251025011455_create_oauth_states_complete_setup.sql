/*
  # OAuth States Table - Complete Setup
  
  1. Table Structure
    - Creates oauth_states table if not exists
    - Ensures all required columns exist with correct types
    - Sets up proper defaults and constraints
  
  2. Triggers
    - Auto-expiry trigger: Sets expires_at to 15 minutes if NULL
  
  3. Indexes
    - Unique index on state for fast lookups
    - Index on expires_at for cleanup queries
    - Index on created_at for safety net cleanup
  
  4. Security
    - Table has NOT NULL constraints where needed
    - Boolean used flag defaults to false
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create oauth_states table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='oauth_states') THEN
    CREATE TABLE public.oauth_states (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      state text UNIQUE NOT NULL,
      user_id uuid NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      expires_at timestamptz NULL,
      used boolean NOT NULL DEFAULT false
    );
  END IF;
END $$;

-- Add used column if needed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='oauth_states' AND column_name='used'
  ) THEN
    ALTER TABLE public.oauth_states ADD COLUMN used boolean DEFAULT false;
    ALTER TABLE public.oauth_states ALTER COLUMN used SET NOT NULL;
  END IF;
END $$;

-- Ensure created_at is NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='oauth_states' AND column_name='created_at'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.oauth_states ALTER COLUMN created_at SET NOT NULL;
    ALTER TABLE public.oauth_states ALTER COLUMN created_at SET DEFAULT now();
  END IF;
END $$;

-- Ensure used is NOT NULL with default
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='oauth_states' AND column_name='used'
    AND is_nullable = 'YES'
  ) THEN
    UPDATE public.oauth_states SET used = false WHERE used IS NULL;
    ALTER TABLE public.oauth_states ALTER COLUMN used SET NOT NULL;
    ALTER TABLE public.oauth_states ALTER COLUMN used SET DEFAULT false;
  END IF;
END $$;

-- Trigger function to set expires_at to 15 minutes if NULL
CREATE OR REPLACE FUNCTION public.oauth_states_set_expiry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.expires_at IS NULL THEN
    NEW.expires_at := now() + interval '15 minutes';
  END IF;
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to ensure it's up to date
DROP TRIGGER IF EXISTS trg_oauth_states_set_expiry ON public.oauth_states;
CREATE TRIGGER trg_oauth_states_set_expiry
BEFORE INSERT ON public.oauth_states
FOR EACH ROW
EXECUTE FUNCTION public.oauth_states_set_expiry();

-- Indexes for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_oauth_states_state'
  ) THEN
    CREATE UNIQUE INDEX idx_oauth_states_state ON public.oauth_states(state);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_oauth_states_expires_at'
  ) THEN
    CREATE INDEX idx_oauth_states_expires_at ON public.oauth_states(expires_at);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_oauth_states_created_at'
  ) THEN
    CREATE INDEX idx_oauth_states_created_at ON public.oauth_states(created_at);
  END IF;
END $$;
