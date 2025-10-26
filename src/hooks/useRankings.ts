import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Ranking {
  id: string;
  location_id: string;
  keyword: string;
  current_position?: number;
  previous_position?: number;
  best_position?: number;
  search_volume?: number;
  difficulty?: string;
  last_checked?: string;
  created_at: string;
}

export function useRankings(locationId?: string) {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('gmb_rankings')
        .select('*')
        .order('keyword', { ascending: true });

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRankings(data || []);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [locationId]);

  return { rankings, loading, refetch: fetchRankings };
}
