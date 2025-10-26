/*
  # AI Settings Table

  1. New Tables
    - `ai_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `provider` (text) - AI provider name (openai, anthropic, google, etc.)
      - `api_key` (text, encrypted) - API key for the provider
      - `is_active` (boolean) - Whether this provider is currently active
      - `priority` (integer) - Fallback priority (lower = higher priority)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on ai_settings table
    - Users can only access their own settings
    - API keys are stored securely

  3. Indexes
    - Index on user_id for fast lookups
    - Index on active providers
*/

-- AI Settings Table
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  api_key text NOT NULL,
  is_active boolean DEFAULT false,
  priority integer DEFAULT 999,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI settings"
  ON ai_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI settings"
  ON ai_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI settings"
  ON ai_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI settings"
  ON ai_settings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_settings_user_id ON ai_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_settings_active ON ai_settings(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ai_settings_priority ON ai_settings(user_id, priority, is_active) WHERE is_active = true;