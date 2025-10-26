import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface Media {
  id: string;
  location_id: string;
  media_type: string;
  url: string;
  caption?: string;
  category?: string;
  uploaded_at: string;
}

export function useMedia(locationId?: string, category?: string) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('gmb_media')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMedia(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [locationId, category]);

  return { media, loading, refetch: fetchMedia };
}
