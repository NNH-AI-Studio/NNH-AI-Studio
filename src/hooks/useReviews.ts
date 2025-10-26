import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface GmbReview {
  id: string;
  location_id: string;
  external_review_id: string | null;
  author_name: string;
  rating: number;
  review_text: string | null;
  review_date: string;
  reply_text: string | null;
  reply_date: string | null;
  has_reply: boolean;
  created_at: string;
  updated_at: string;
  location?: {
    location_name: string;
  };
}

export function useReviews(locationId?: string) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GmbReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // (منطق جلب البيانات المتسلسل يظل كما هو، ويوصى بتحسينه باستخدام RPC لاحقًا)
      const { data: accountsData } = await supabase
        .from('gmb_accounts')
        .select('id')
        .eq('user_id', user.id);

      if (!accountsData || accountsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const accountIds = accountsData.map((acc) => acc.id);

      const { data: locationsData } = await supabase
        .from('gmb_locations')
        .select('id')
        .in('gmb_account_id', accountIds);

      if (!locationsData || locationsData.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const locationIds = locationsData.map((loc) => loc.id);

      let query = supabase
        .from('gmb_reviews')
        .select(`
          *,
          location:gmb_locations(location_name)
        `);

      if (locationId) {
        query = query.eq('location_id', locationId);
      } else {
        query = query.in('location_id', locationIds);
      }

      const { data, error: fetchError } = await query.order('review_date', { ascending: false });

      if (fetchError) throw fetchError;

      setReviews(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user, locationId]);

  const replyToReview = async (reviewId: string, replyText: string) => {
    try {
      if (!replyText.trim()) {
        throw new Error('Reply text cannot be empty');
      }

      // جلب رمز المصادقة (JWT) لإرساله إلى Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      if (!token) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('review-reply', {
        body: { reviewId, replyText },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) {
        throw new Error(error.message || 'Failed to publish reply via API.');
      }

      // إعادة جلب المراجعات لعرض الرد الجديد
      await fetchReviews(); 

    } catch (err) {
      console.error('Error replying to review:', err);
      throw err;
    }
  };

  const createReview = async (reviewData: {
    location_id: string;
    author_name: string;
    rating: number;
    review_text?: string;
    review_date: string;
    external_review_id?: string;
  }) => {
    try {
      if (!reviewData.location_id || !reviewData.author_name) {
        throw new Error('Location ID and author name are required');
      }

      if (reviewData.rating < 1 || reviewData.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const { data, error } = await supabase
        .from('gmb_reviews')
        .insert(reviewData)
        .select()
        .single();

      if (error) throw error;

      await fetchReviews();
      return data;
    } catch (err) {
      console.error('Error creating review:', err);
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews,
    replyToReview,
    createReview,
  };
}