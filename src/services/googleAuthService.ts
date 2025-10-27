import { supabase } from '../lib/supabase';

export const GoogleAuthService = {
  async connectGoogleAccount() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session. Please log in first.');
      }

      const accessToken = session.access_token;
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Missing VITE_SUPABASE_URL');
      }
      // The Edge Function expects token as a query param and responds with 302 redirect.
      const fnUrl = `${supabaseUrl}/functions/v1/create-auth-url?token=${encodeURIComponent(accessToken)}`;
      window.location.href = fnUrl;

    } catch (error) {
      console.error("[GoogleAuthService] Failed to connect Google account:", error);
      alert((error as Error)?.message || 'Failed to start Google authorization');
      throw error;
    }
  },

  isTokenExpired(expiresAt?: string | null): boolean {
    if (!expiresAt) return true;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    return expiryDate <= now;
  },
};