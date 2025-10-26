import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Citation {
  id: string;
  location_id: string;
  directory_name: string;
  directory_url: string;
  citation_url?: string;
  business_name?: string;
  address?: string;
  phone?: string;
  website?: string;
  status: string;
  last_checked?: string;
  created_at: string;
}

export function useCitations(locationId?: string) {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCitations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('gmb_citations')
        .select('*')
        .order('created_at', { ascending: false });

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCitations(data || []);
    } catch (error) {
      console.error('Error fetching citations:', error);
      setCitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitations();
  }, [locationId]);

  return { citations, loading, refetch: fetchCitations };
}
