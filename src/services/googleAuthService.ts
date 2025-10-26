import { supabase } from '../lib/supabase';

export const GoogleAuthService = {
  async connectGoogleAccount() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session. Please log in first.');
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const accessToken = session.access_token;

      window.location.href = `${supabaseUrl}/functions/v1/create-auth-url?token=${accessToken}`;

    } catch (error) {
      console.error("[GoogleAuthService] Failed to connect Google account:", error);
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