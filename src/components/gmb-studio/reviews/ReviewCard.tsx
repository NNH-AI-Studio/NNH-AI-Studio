import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle, Calendar, User, Sparkles, Copy, Check } from 'lucide-react';
import { useAI } from '../../../hooks/useAI';

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

interface ReviewCardProps {
  review: Review;
  onReplySubmit: (reviewId: string, reply: string) => Promise<void>;
  businessName: string;
}

function ReviewCard({ review, onReplySubmit, businessName }: ReviewCardProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { generateReviewReply, loading: aiLoading } = useAI();

  const handleGenerateAI = async () => {
    const reply = await generateReviewReply(
      review.review_text || '',
      review.rating,
      businessName,
      'professional'
    );

    if (reply) {
      setReplyText(reply);
    }
  };

  const handleSubmit = async () => {
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await onReplySubmit(review.id, replyText);
      setShowReplyBox(false);
      setReplyText('');
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black border border-neon-orange rounded-xl p-6 hover:border-orange-500 transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">{review.author_name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? 'text-orange-500 fill-yellow-400'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-white flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(review.review_date)}
                </span>
              </div>
            </div>

            {!review.reply_text && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Reply
              </button>
            )}
          </div>

          <p className="text-white/80 leading-relaxed">{review.review_text}</p>

          {review.reply_text && (
            <div className="mt-4 pl-4 border-l-2 border-orange-500">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-white">Your Reply</span>
                <span className="text-xs text-white">
                  {formatDate(review.reply_date!)}
                </span>
              </div>
              <p className="text-white text-sm">{review.reply_text}</p>
            </div>
          )}

          {showReplyBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-3"
            >
              <div className="relative">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  rows={4}
                  className="w-full p-4 bg-black border border-orange-500 rounded-lg text-white placeholder:text-white focus:outline-none focus:border-white/40 transition-colors resize-none"
                />

                {replyText && (
                  <button
                    onClick={handleCopy}
                    className="absolute top-2 right-2 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-orange-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-white" />
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="px-4 py-2 bg-orange-500 text-black rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiLoading ? 'Generating...' : 'Generate with AI'}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !replyText.trim()}
                  className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reply'}
                </button>

                <button
                  onClick={() => {
                    setShowReplyBox(false);
                    setReplyText('');
                  }}
                  className="px-4 py-2 text-white hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ReviewCard;
