import { supabase } from '../lib/supabase';

export const GoogleAuthService = {
  async connectGoogleAccount() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No active session. Please log in first.');
      }

      const accessToken = session.access_token;

      // Call Edge Function with Authorization header to avoid 401
      const { data, error } = await supabase.functions.invoke('create-auth-url', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: {
          // تمرير مسار نجاح اختياري ليس ضرورياً إن كانت الدالة تستخدم أسرار FRONTEND_REDIRECT_*
          successRedirect: `${window.location.origin}/settings/integrations#autosync=true`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create auth URL');
      }

      let authUrl = (data as any)?.authUrl
        || (data as any)?.url
        || (data as any)?.authorization_url
        || (data as any)?.authorizationUrl
        || (typeof data === 'string' ? data : undefined);

      if (!authUrl && data && typeof data === 'object') {
        for (const v of Object.values(data as any)) {
          if (typeof v === 'string' && /^https?:\/\//.test(v)) {
            authUrl = v;
            break;
          }
        }
      }

      if (!authUrl) {
        throw new Error('Auth URL not returned from function');
      }

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