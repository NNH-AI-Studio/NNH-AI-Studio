import { motion } from 'framer-motion';
import { Image as ImageIcon, Video, MoreVertical, Download, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface Media {
  id: string;
  media_type: string;
  url: string;
  caption?: string;
  category?: string;
  uploaded_at: string;
}

interface MediaCardProps {
  media: Media;
  onDelete?: (mediaId: string) => void;
}

function MediaCard({ media, onDelete }: MediaCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isVideo = media.media_type === 'video';

  const handleDownload = () => {
    window.open(media.url, '_blank');
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      interior: 'bg-blue-400/20 text-orange-500',
      exterior: 'bg-green-400/20 text-orange-500',
      team: 'bg-purple-400/20 text-orange-500',
      products: 'bg-orange-400/20 text-orange-400',
      other: 'bg-gray-700 text-white'
    };
    return colors[category || 'other'] || colors.other;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative bg-black border border-neon-orange rounded-xl overflow-hidden hover:border-orange-500 transition-all"
    >
      <div className="aspect-square relative">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            {isVideo ? (
              <Video className="w-12 h-12 text-white" />
            ) : (
              <ImageIcon className="w-12 h-12 text-white" />
            )}
          </div>
        ) : isVideo ? (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <img
            src={media.url}
            alt={media.caption || 'Media'}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {media.caption && (
              <p className="text-white text-sm line-clamp-2 mb-2">{media.caption}</p>
            )}
            {media.category && (
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(media.category)}`}>
                {media.category}
              </span>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 bg-black/80 hover:bg-black rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-white" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-black border border-orange-500 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    handleDownload();
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center gap-2 rounded-t-lg"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <a
                  href={media.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowMenu(false)}
                  className="w-full px-4 py-2 text-left text-white hover:bg-gray-800 flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Size
                </a>
                <button
                  onClick={() => {
                    onDelete?.(media.id);
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

        {isVideo && (
          <div className="absolute top-2 left-2">
            <div className="p-2 bg-black/80 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default MediaCard;
