import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';
import MediaCard from './MediaCard';

interface Media {
  id: string;
  media_type: string;
  url: string;
  caption?: string;
  category?: string;
  uploaded_at: string;
}

interface MediaGalleryProps {
  media: Media[];
  loading: boolean;
  onDelete?: (mediaId: string) => void;
}

function MediaGallery({ media, loading, onDelete }: MediaGalleryProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No media yet</h3>
        <p className="text-white">
          Upload photos and videos to showcase your business
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {media.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <MediaCard media={item} onDelete={onDelete} />
        </motion.div>
      ))}
    </div>
  );
}

export default MediaGallery;
