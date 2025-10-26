import { motion } from 'framer-motion';
import { Star, Reply } from 'lucide-react';

interface ReviewCardProps {
  review: {
    id: string;
    author: string;
    rating: number;
    text: string;
    date: string;
    location: string;
  };
  onReply: (reviewId: string) => void;
}

function ReviewCard({ review, onReply }: ReviewCardProps) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-white fill-current' 
            : 'text-white'
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-black rounded-xl p-6 border border-neon-orange shadow-neon-orange hover:border-neon-orange shadow-neon-orange/30 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-semibold">
                {review.author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-white">{review.author}</p>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">{renderStars(review.rating)}</div>
                <span className="text-sm text-white">•</span>
                <span className="text-sm text-white">{review.date}</span>
              </div>
            </div>
          </div>
          <p className="text-white mb-2">{review.text}</p>
          <p className="text-sm text-white">{review.location}</p>
        </div>
      </div>
      
      <div className="flex justify-end">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onReply(review.id)}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-4 py-2 rounded-lg hover:bg-black transition-colors font-medium"
        >
          <Reply className="w-4 h-4" />
          <span>Reply</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ReviewCard;