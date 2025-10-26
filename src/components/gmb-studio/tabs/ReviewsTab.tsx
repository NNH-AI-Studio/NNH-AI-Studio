import { useState, useEffect, useMemo } from 'react';
import { Star, TrendingUp, MessageCircle, Clock } from 'lucide-react';
import { useReviews } from '../../../hooks/useReviews';
import { supabase } from '../../../lib/supabase';
import ReviewFilters from '../reviews/ReviewFilters';
import ReviewsList from '../reviews/ReviewsList';

interface ReviewsTabProps {
  selectedLocation: string;
}

function ReviewsTab({ selectedLocation }: ReviewsTabProps) {
  const { reviews, loading, refetch } = useReviews(selectedLocation);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState('all');
  const [replyStatus, setReplyStatus] = useState('all');
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

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch = (review.review_text || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        review.author_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating =
        selectedRating === 'all' || review.rating === parseInt(selectedRating);

      const matchesReplyStatus =
        replyStatus === 'all' ||
        (replyStatus === 'replied' && review.reply_text) ||
        (replyStatus === 'pending' && !review.reply_text);

      return matchesSearch && matchesRating && matchesReplyStatus;
    });
  }, [reviews, searchTerm, selectedRating, replyStatus]);

  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews || 0;
    const pendingReplies = reviews.filter((r) => !r.reply_text).length;
    const recentReviews = reviews.filter(
      (r) =>
        new Date(r.review_date) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      totalReviews,
      averageRating: averageRating.toFixed(1),
      pendingReplies,
      recentReviews
    };
  }, [reviews]);

  const handleReplySubmit = async (reviewId: string, reply: string) => {
    const { error } = await supabase
      .from('gmb_reviews')
      .update({
        reply_text: reply,
        reply_date: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (!error) {
      refetch();
    } else {
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reviews Management</h2>
          <p className="text-white mt-1">
            Manage and respond to customer reviews with AI assistance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.averageRating}
          </div>
          <div className="text-sm text-white">Average Rating</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <MessageCircle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.totalReviews}
          </div>
          <div className="text-sm text-white">Total Reviews</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.pendingReplies}
          </div>
          <div className="text-sm text-white">Pending Replies</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.recentReviews}
          </div>
          <div className="text-sm text-white">This Week</div>
        </div>
      </div>

      <ReviewFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRating={selectedRating}
        onRatingChange={setSelectedRating}
        replyStatus={replyStatus}
        onReplyStatusChange={setReplyStatus}
      />

      <ReviewsList
        reviews={filteredReviews}
        loading={loading}
        onReplySubmit={handleReplySubmit}
        businessName={businessName}
      />
    </div>
  );
}

export default ReviewsTab;
