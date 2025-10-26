/*
  # Add RLS Policy for OAuth States Table
  
  1. Security Policy
    - Allow anonymous and authenticated users to INSERT new oauth_states
    - This is needed for Frontend to store state before OAuth redirect
    - Backend Edge Function uses SERVICE_ROLE_KEY which bypasses RLS
    
  2. Notes
    - Only INSERT is allowed for users
    - Backend handles SELECT/UPDATE/DELETE with SERVICE_ROLE_KEY
    - State cleanup is handled by scheduled Edge Function
*/

CREATE POLICY "Allow users to create OAuth states"
  ON oauth_states
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);
