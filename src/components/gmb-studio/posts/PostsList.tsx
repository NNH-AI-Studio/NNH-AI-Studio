import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';
import PostCard from './PostCard';

interface Post {
  id: string;
  post_type: string;
  caption: string;
  image_url?: string | null;
  scheduled_at?: string | null;
  published_at?: string | null;
  status: string;
  created_at: string;
}

interface PostsListProps {
  posts: Post[];
  loading: boolean;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

function PostsList({ posts, loading, onEdit, onDelete }: PostsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
        <p className="text-white">
          Create your first post to engage with your customers
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <PostCard post={post} onEdit={onEdit} onDelete={onDelete} />
        </motion.div>
      ))}
    </div>
  );
}

export default PostsList;
