import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';
import ReviewCard from './ReviewCard';

interface Review {
  id: string;
  author_name: string;
  rating: number;
  review_text: string | null;
  review_date: string;
  reply_text?: string | null;
  reply_date?: string | null;
  external_review_id?: string | null;
}

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
  onReplySubmit: (reviewId: string, reply: string) => Promise<void>;
  businessName: string;
}

function ReviewsList({ reviews, loading, onReplySubmit, businessName }: ReviewsListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="w-16 h-16 text-white/20 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No reviews yet</h3>
        <p className="text-white">
          Reviews from your customers will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <ReviewCard
            review={review}
            onReplySubmit={onReplySubmit}
            businessName={businessName}
          />
        </motion.div>
      ))}
    </div>
  );
}

export default ReviewsList;
