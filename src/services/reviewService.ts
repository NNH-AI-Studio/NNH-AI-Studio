import { supabase } from '../lib/supabase';

async function getUserAccessToken(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  const { data } = await supabase.auth.refreshSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('No user session. Please sign in.');
  return token;
}

export async function replyToReview(
  reviewId: string,
  replyText: string,
  accountId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const accessToken = await getUserAccessToken();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/review-reply`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reviewId,
          replyText,
          accountId,
        }),
      }
    );

    if (!response.ok) {
      // قد يعود النص وليس JSON في بعض الحالات
      const errorText = await response.text().catch(() => '');
      let errorMsg = 'Failed to reply to review';
      try {
        const errorData = JSON.parse(errorText || '{}');
        if (errorData?.error) errorMsg = errorData.error;
      } catch {
        if (errorText) errorMsg = errorText;
      }
      return { success: false, error: errorMsg };
    }

    return { success: true };
  } catch (error) {
    console.error('Review reply error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}