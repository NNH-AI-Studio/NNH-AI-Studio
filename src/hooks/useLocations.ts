import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface GmbLocation {
  id: string;
  gmb_account_id: string;
  location_name: string;
  location_id: string;
  address: string | null;
  phone: string | null;
  category: string | null;
  website: string | null;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  rating?: number;
  reviews?: number;
  status?: string;
}

export function useLocations() {
  const { user } = useAuth();
  const [locations, setLocations] = useState<GmbLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data: accountsData } = await supabase
        .from('gmb_accounts')
        .select('id')
        .eq('user_id', user.id);

      if (!accountsData || accountsData.length === 0) {
        setLocations([]);
        setLoading(false);
        return;
      }

      const accountIds = accountsData.map((acc) => acc.id);

      const { data, error: fetchError } = await supabase
        .from('gmb_locations')
        .select('*')
        .in('gmb_account_id', accountIds)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const locationsWithStats = await Promise.all(
        (data || []).map(async (location) => {
          const { data: reviewsData } = await supabase
            .from('gmb_reviews')
            .select('rating')
            .eq('location_id', location.id);

          const reviewCount = reviewsData?.length || 0;
          const avgRating = reviewCount > 0
            ? reviewsData!.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            : 0;

          return {
            ...location,
            rating: Math.round(avgRating * 10) / 10,
            reviews: reviewCount,
            status: location.is_active ? 'verified' : 'pending',
          };
        })
      );

      setLocations(locationsWithStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
      console.error('Error fetching locations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [user]);

  const createLocation = async (locationData: {
    gmb_account_id: string;
    location_name: string;
    location_id: string;
    address?: string;
    phone?: string;
    category?: string;
    website?: string;
  }) => {
    const { data, error } = await supabase
      .from('gmb_locations')
      .insert(locationData)
      .select()
      .single();

    if (error) throw error;

    await fetchLocations();
    return data;
  };

  const updateLocation = async (
    locationId: string,
    updates: Partial<GmbLocation>
  ) => {
    const { error } = await supabase
      .from('gmb_locations')
      .update(updates)
      .eq('id', locationId);

    if (error) throw error;

    await fetchLocations();
  };

  const deleteLocation = async (locationId: string) => {
    const { error } = await supabase
      .from('gmb_locations')
      .delete()
      .eq('id', locationId);

    if (error) throw error;

    await fetchLocations();
  };

  return {
    locations,
    loading,
    error,
    refetch: fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}
