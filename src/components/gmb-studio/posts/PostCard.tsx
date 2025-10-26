import { motion } from 'framer-motion';
import { Calendar, Eye, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

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

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (postId: string) => void;
}

function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getPostTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      photo: '📸',
      event: '📅',
      offer: '🎁',
      update: '📢'
    };
    return emojis[type] || '📝';
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: 'bg-green-500/20 text-orange-500 border-green-500/30',
      scheduled: 'bg-blue-500/20 text-orange-500 border-blue-500/30',
      draft: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-neon-orange rounded-xl p-6 hover:border-orange-500 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl">{getPostTypeEmoji(post.post_type)}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-white capitalize">
                {post.post_type} Post
              </span>
              {getStatusBadge(post.status)}
            </div>
            <div className="flex items-center gap-3 text-sm text-white">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {post.status === 'scheduled' && post.scheduled_at
                  ? `Scheduled for ${formatDate(post.scheduled_at)}`
                  : post.published_at
                  ? `Published ${formatDate(post.published_at)}`
                  : `Created ${formatDate(post.created_at)}`}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-black border border-orange-500 rounded-lg shadow-xl z-10">
              <button
                onClick={() => {
                  onEdit?.(post);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center gap-2 rounded-t-lg"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete?.(post.id);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-orange-500 hover:bg-gray-800 flex items-center gap-2 rounded-b-lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-white/80 leading-relaxed whitespace-pre-wrap">
        {post.caption}
      </p>

      {post.image_url && (
        <div className="mt-4">
          <img
            src={post.image_url}
            alt="Post media"
            className="w-full h-48 object-cover rounded-lg"
          />
        </div>
      )}
    </motion.div>
  );
}

export default PostCard;
