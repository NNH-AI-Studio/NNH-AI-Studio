import { supabase } from '../lib/supabase';

export const GoogleAuthService = {
  async connectGoogleAccount() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session. Please log in first.');
      }

      const accessToken = session.access_token;
      // First try normal invoke with Authorization header
      let { data, error } = await supabase.functions.invoke('create-auth-url', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      let authUrl = (data as any)?.authUrl || (data as any)?.url;

      if (error || !authUrl) {
        // Fallback: direct fetch with token query param (function supports it)
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
        const res = await fetch(`${supabaseUrl}/functions/v1/create-auth-url?token=${encodeURIComponent(accessToken)}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = (body && (body.message || body.error)) || error?.message || 'Failed to create auth URL';
          throw new Error(msg);
        }
        authUrl = body?.authUrl || body?.url;
      }

      if (!authUrl) throw new Error('Auth URL not returned from function');
      window.location.assign(authUrl as string);

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