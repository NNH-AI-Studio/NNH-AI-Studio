import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface GmbPost {
  id: string;
  user_id: string;
  location_id: string;
  post_type: 'photo' | 'event' | 'offer' | 'update';
  caption: string;
  image_url: string | null;
  external_post_id: string | null;
  status: 'draft' | 'published' | 'scheduled' | 'failed';
  scheduled_at: string | null;
  published_at: string | null;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views?: number;
    clicks?: number;
  };
  created_at: string;
  updated_at: string;
  location?: {
    location_name: string;
  };
}

export function usePosts(locationId?: string) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<GmbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('gmb_posts')
        .select(`
          *,
          location:gmb_locations(location_name)
        `)
        .eq('user_id', user.id);

      if (locationId) {
        query = query.eq('location_id', locationId);
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setPosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user, locationId]);

  const createPost = async (postData: {
    location_id: string;
    post_type: 'photo' | 'event' | 'offer' | 'update';
    caption: string;
    image_url?: string;
    status?: 'draft' | 'published' | 'scheduled';
    scheduled_at?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('gmb_posts')
      .insert({
        user_id: user.id,
        ...postData,
        published_at: postData.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    await fetchPosts();
    return data;
  };

  const updatePost = async (postId: string, updates: Partial<GmbPost>) => {
    const { error } = await supabase
      .from('gmb_posts')
      .update(updates)
      .eq('id', postId);

    if (error) throw error;

    await fetchPosts();
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from('gmb_posts').delete().eq('id', postId);

    if (error) throw error;

    await fetchPosts();
  };

  const uploadPostImage = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('post-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
    uploadPostImage,
  };
}
