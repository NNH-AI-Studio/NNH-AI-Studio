import { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useInsights } from '../../../hooks/useInsights';
import { useReviews } from '../../../hooks/useReviews';
import { usePosts } from '../../../hooks/usePosts';
import MetricsCards from '../dashboard/MetricsCards';
import PerformanceChart from '../dashboard/PerformanceChart';
import RecentActivity from '../dashboard/RecentActivity';

interface DashboardTabProps {
  selectedLocation: string;
}

function DashboardTab({ selectedLocation }: DashboardTabProps) {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
  const { insights } = useInsights(selectedLocation, days);
  const { reviews } = useReviews(selectedLocation);
  const { posts } = usePosts(selectedLocation);

  const metrics = useMemo(() => {
    const currentPeriod = insights.slice(0, 7);
    const previousPeriod = insights.slice(7, 14);

    const currentViews = currentPeriod.reduce((sum, i) => sum + (i.views || 0), 0);
    const currentSearches = currentPeriod.reduce((sum, i) => sum + (i.searches || 0), 0);
    const currentCalls = currentPeriod.reduce((sum, i) => sum + (i.calls || 0), 0);
    const currentMessages = currentPeriod.reduce((sum, i) => sum + (i.messages || 0), 0);

    const prevViews = previousPeriod.reduce((sum, i) => sum + (i.views || 0), 0);
    const prevSearches = previousPeriod.reduce((sum, i) => sum + (i.searches || 0), 0);
    const prevCalls = previousPeriod.reduce((sum, i) => sum + (i.calls || 0), 0);
    const prevMessages = previousPeriod.reduce((sum, i) => sum + (i.messages || 0), 0);

    const calcChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      views: currentViews,
      searches: currentSearches,
      calls: currentCalls,
      messages: currentMessages,
      viewsChange: calcChange(currentViews, prevViews),
      searchesChange: calcChange(currentSearches, prevSearches),
      callsChange: calcChange(currentCalls, prevCalls),
      messagesChange: calcChange(currentMessages, prevMessages)
    };
  }, [insights]);

  const chartData = useMemo(() => {
    return insights.slice(0, 14).reverse().map((insight) => ({
      date: insight.name,
      views: insight.views || 0,
      searches: insight.searches || 0,
      calls: insight.calls || 0
    }));
  }, [insights]);

  const recentActivities = useMemo(() => {
    const activities: any[] = [];

    reviews.slice(0, 3).forEach((review) => {
      activities.push({
        id: `review-${review.id}`,
        type: 'review',
        title: `New ${review.rating}-star review`,
        description: (review.review_text || '').slice(0, 100) + ((review.review_text || '').length > 100 ? '...' : ''),
        timestamp: review.review_date
      });
    });

    posts.slice(0, 3).forEach((post) => {
      activities.push({
        id: `post-${post.id}`,
        type: 'post',
        title: `New ${post.post_type} post`,
        description: post.caption.slice(0, 100) + (post.caption.length > 100 ? '...' : ''),
        timestamp: post.created_at
      });
    });

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
  }, [reviews, posts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-white mt-1">
            Monitor your Google My Business performance
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                dateRange === range
                  ? 'bg-orange-500 text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <MetricsCards metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PerformanceChart data={chartData} />
        </div>

        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Reviews</h3>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {reviews.length}
          </div>
          <p className="text-sm text-white">
            {reviews.filter((r) => !r.reply_text).length} pending replies
          </p>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Posts</h3>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {posts.filter((p) => p.status === 'published').length}
          </div>
          <p className="text-sm text-white">
            {posts.filter((p) => p.status === 'scheduled').length} scheduled
          </p>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Avg Rating</h3>
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-2">
            {reviews.length > 0
              ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
              : '0.0'}
          </div>
          <p className="text-sm text-white">
            from {reviews.length} reviews
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardTab;
