import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, MessageSquare, Filter, Star, Sparkles, TrendingUp, MessageCircleReply, Clock } from 'lucide-react';
import ReviewCard from '../components/cards/ReviewCard';
import { useReviews, GmbReview } from '../hooks/useReviews';
import { useToast } from '../contexts/ToastContext';
import AIDrawer from '../components/shared/AIDrawer';
import { aiSuggestReply } from '../lib/ai';

function Reviews() {
  const { reviews, loading, replyToReview } = useReviews();
  const toast = useToast();
  const [selectedReview, setSelectedReview] = useState<GmbReview | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterReplied, setFilterReplied] = useState<string>('all');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState<'friendly'|'professional'|'short'>('friendly');
  const [aiLang, setAiLang] = useState<'English'|'Arabic'>('English');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  const getSentiment = (rating: number) => {
    if (rating >= 4) return { label: 'Positive', color: 'text-orange-500', bg: 'bg-green-500/10' };
    if (rating === 3) return { label: 'Neutral', color: 'text-orange-500', bg: 'bg-yellow-500/10' };
    return { label: 'Negative', color: 'text-orange-500', bg: 'bg-red-500/10' };
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      if (filterRating && review.rating !== filterRating) return false;
      if (filterReplied === 'replied' && !review.reply_text) return false;
      if (filterReplied === 'pending' && review.reply_text) return false;
      return true;
    });
  }, [reviews, filterRating, filterReplied]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const avgRating = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : '0.0';
    const replied = reviews.filter(r => r.reply_text).length;
    const pending = total - replied;
    const positive = reviews.filter(r => r.rating >= 4).length;
    const neutral = reviews.filter(r => r.rating === 3).length;
    const negative = reviews.filter(r => r.rating < 3).length;
    return { total, avgRating, replied, pending, positive, neutral, negative };
  }, [reviews]);

  const handleReply = (review: GmbReview) => {
    setSelectedReview(review);
    setReplyText('');
  };

  const handleSendReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    try {
      setSubmitting(true);
      await replyToReview(selectedReview.id, replyText);
      toast.success('Reply sent successfully!');
      setSelectedReview(null);
      setReplyText('');
    } catch (error) {
      console.error('Error sending reply:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reply';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedReviewData = selectedReview;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Reviews</h1>
          <p className="text-white/70 mt-2">View and respond to customer feedback</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setAiOpen(true)}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-medium"
        >
          Ask AI
        </motion.button>
      </div>

      {/* Stats Summary */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-white">Total</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-white">Avg Rating</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.avgRating}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MessageCircleReply className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-white">Replied</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.replied}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-xs text-white">Pending</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-white">Positive</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{stats.positive}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-white">Neutral</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{stats.neutral}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <X className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-white">Negative</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{stats.negative}</div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      {reviews.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-white" />
            <h3 className="font-semibold text-white">Filters</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/80">Rating:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterRating === null
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilterRating(rating)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors flex items-center gap-1 ${
                      filterRating === rating
                        ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                        : 'bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {rating}
                    <Star className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white/80">Status:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterReplied('all')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterReplied === 'all'
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterReplied('replied')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterReplied === 'replied'
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Replied
                </button>
                <button
                  onClick={() => setFilterReplied('pending')}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filterReplied === 'pending'
                      ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                      : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {filteredReviews.length === 0 && reviews.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-xl border border-white/10"
        >
          <Filter className="w-16 h-16 text-white mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Reviews Match Filters</h3>
          <p className="text-white/80 text-center max-w-md">
            Try adjusting your filters to see more reviews
          </p>
        </motion.div>
      ) : reviews.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-96 bg-white/5 rounded-xl border border-white/10"
        >
          <MessageSquare className="w-16 h-16 text-white mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Reviews Yet</h3>
          <p className="text-white/80 text-center max-w-md">
            Reviews from your customers will appear here. Start promoting your business to get feedback!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReviews.map((review, index) => {
            const sentiment = getSentiment(review.rating);
            return (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-medium border z-10 ${sentiment.bg} ${sentiment.color} border-current`}>
                  {sentiment.label}
                </div>
                <ReviewCard review={{...review, author: review.author_name, text: review.review_text || '', date: new Date(review.review_date).toLocaleDateString(), location: review.location?.location_name || 'Unknown Location'}} onReply={() => handleReply(review)} />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {selectedReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50"
            onClick={() => setSelectedReview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white/5 rounded-xl p-6 w-full max-w-2xl border border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  Reply to {selectedReviewData?.author_name}
                </h3>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="p-2 hover:bg-black rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-white">{selectedReviewData?.review_text}</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-end mb-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      try {
                        setGeneratingAI(true);
                        const suggestions = await aiSuggestReply({
                          prompt: selectedReviewData?.review_text || '',
                          tone: aiTone,
                          language: aiLang,
                          customerName: selectedReviewData?.author_name,
                          rating: selectedReviewData?.rating,
                        });
                        setReplyText(suggestions[0] || '');
                      } finally {
                        setGeneratingAI(false);
                      }
                    }}
                    disabled={generatingAI}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    {generatingAI ? 'Generating...' : 'Generate AI Reply'}
                  </motion.button>
                </div>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply or use AI to generate one..."
                  className="w-full h-32 bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-white/60 focus:border-white/20 focus:outline-none resize-none"
                />
                
                <div className="flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedReview(null)}
                    className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || submitting}
                    className="px-6 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending...' : 'Send Reply'}</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Drawer */}
      <AIDrawer isOpen={aiOpen} onClose={() => setAiOpen(false)} title="AI Assistant">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">What do you need?</label>
            <input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40"
              placeholder="e.g. reply to positive review about service"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/80 mb-1">Tone</label>
              <select value={aiTone} onChange={(e) => setAiTone(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Language</label>
              <select value={aiLang} onChange={(e) => setAiLang(e.target.value as any)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white">
                <option>English</option>
                <option>Arabic</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={aiLoading}
              onClick={async () => {
                try {
                  setAiLoading(true);
                  const suggestions = await aiSuggestReply({ prompt: aiPrompt, tone: aiTone, language: aiLang });
                  setAiSuggestions(suggestions);
                } finally {
                  setAiLoading(false);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {aiLoading ? 'Generating…' : 'Generate Suggestions'}
            </motion.button>
          </div>
          <div className="space-y-2">
            {aiSuggestions.map((s, idx) => (
              <div key={idx} className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-sm text-white mb-2">{s}</p>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1 text-xs bg-white/10 border border-white/20 text-white rounded"
                    onClick={async () => {
                      try { await navigator.clipboard.writeText(s); toast.success('Copied to clipboard'); } catch {}
                    }}
                  >
                    Copy
                  </button>
                  {selectedReview && (
                    <button
                      className="px-3 py-1 text-xs bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded"
                      onClick={() => {
                        setReplyText(s);
                        setAiOpen(false);
                      }}
                    >
                      Use in reply
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </AIDrawer>
    </motion.div>
  );
}

export default Reviews;