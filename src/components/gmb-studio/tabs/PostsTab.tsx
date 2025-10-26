import { useState, useMemo, useEffect } from 'react';
import { Plus, FileText, Calendar, CheckCircle, Clock } from 'lucide-react';
import { usePosts } from '../../../hooks/usePosts';
import { supabase } from '../../../lib/supabase';
import CreatePostModal from '../posts/CreatePostModal';
import PostsList from '../posts/PostsList';

interface PostsTabProps {
  selectedLocation: string;
}

function PostsTab({ selectedLocation }: PostsTabProps) {
  const { posts, loading, refetch } = usePosts(selectedLocation);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [businessName, setBusinessName] = useState('Your Business');

  useEffect(() => {
    if (selectedLocation) {
      fetchBusinessName();
    }
  }, [selectedLocation]);

  const fetchBusinessName = async () => {
    const { data } = await supabase
      .from('gmb_locations')
      .select('location_name')
      .eq('id', selectedLocation)
      .maybeSingle();

    if (data) {
      setBusinessName(data.location_name);
    }
  };

  const filteredPosts = useMemo(() => {
    if (statusFilter === 'all') return posts;
    return posts.filter((post) => post.status === statusFilter);
  }, [posts, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter((p) => p.status === 'published').length,
      scheduled: posts.filter((p) => p.status === 'scheduled').length,
      drafts: posts.filter((p) => p.status === 'draft').length
    };
  }, [posts]);

  const handleCreatePost = async (postData: {
    post_type: string;
    content: string;
    media_urls?: string[];
    scheduled_date?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const status = postData.scheduled_date ? 'scheduled' : 'published';
    const publishedDate = !postData.scheduled_date ? new Date().toISOString() : null;

    const { error } = await supabase.from('gmb_posts').insert({
      user_id: user.id,
      location_id: selectedLocation || null,
      post_type: postData.post_type,
      caption: postData.content,
      status,
      scheduled_at: postData.scheduled_date || null,
      published_at: publishedDate
    });

    if (!error) {
      refetch();
    } else {
      throw error;
    }
  };

  const handleDeletePost = async (postId: string) => {
    const confirmed = confirm('Are you sure you want to delete this post?');
    if (!confirmed) return;

    const { error } = await supabase
      .from('gmb_posts')
      .delete()
      .eq('id', postId);

    if (!error) {
      refetch();
    }
  };

  const statusFilters = [
    { value: 'all', label: 'All Posts', icon: FileText },
    { value: 'published', label: 'Published', icon: CheckCircle },
    { value: 'scheduled', label: 'Scheduled', icon: Calendar },
    { value: 'draft', label: 'Drafts', icon: Clock }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Posts Management</h2>
          <p className="text-white mt-1">
            Create, schedule, and manage your Google My Business posts
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 shadow-lg shadow-orange-500/20 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-white">Total Posts</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.published}</div>
          <div className="text-sm text-white">Published</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.scheduled}</div>
          <div className="text-sm text-white">Scheduled</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.drafts}</div>
          <div className="text-sm text-white">Drafts</div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {statusFilters.map((filter) => {
          const Icon = filter.icon;
          return (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                statusFilter === filter.value
                  ? 'bg-orange-500 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {filter.label}
            </button>
          );
        })}
      </div>

      <PostsList
        posts={filteredPosts}
        loading={loading}
        onDelete={handleDeletePost}
      />

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
        businessName={businessName}
      />
    </div>
  );
}

export default PostsTab;
