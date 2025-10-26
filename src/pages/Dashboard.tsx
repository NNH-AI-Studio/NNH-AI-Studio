import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Eye, Search, Phone, MessageCircle, TrendingUp, MapPin, Loader2, Chrome, AlertCircle, Star, FileText, Zap, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/cards/StatCard';
import InsightsChart from '../components/charts/InsightsChart';
import { useInsights } from '../hooks/useInsights';
import { useAccounts } from '../hooks/useAccounts';
import { useLocations } from '../hooks/useLocations';
import { supabase } from '../lib/supabase';
import { GoogleAuthService } from '../services/googleAuthService';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const getUserDisplayName = () => {
    if (!user) return 'User';
    if (user.user_metadata?.full_name) return user.user_metadata.full_name as string;
    if (user.user_metadata?.name) return user.user_metadata.name as string;
    if (user.email) return user.email.split('@')[0];
    return 'User';
  };
  const { insights, stats, loading } = useInsights(undefined, 7);
  const { accounts, loading: accountsLoading } = useAccounts();
  const { locations } = useLocations();

  const [recentActivities, setRecentActivities] = useState<Array<{ id: string; text: string; time: string; icon: any; color: string }>>([]);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ id: number; title: string; description: string; priority: 'high'|'medium'|'low'; action: string; icon: any }>>([]);
  const [locationPerf, setLocationPerf] = useState<Array<{ name: string; views: number; calls: number; rating?: number }>>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        // Recent activities: latest reviews, posts, locations
        const [{ data: revs }, { data: posts }, { data: locs }] = await Promise.all([
          supabase.from('gmb_reviews').select('id, author_name, rating, review_date').order('review_date', { ascending: false }).limit(5),
          supabase.from('gmb_posts').select('id, caption, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('gmb_locations').select('id, location_name, created_at').order('created_at', { ascending: false }).limit(5),
        ]);

        const items: Array<{ id: string; text: string; time: string; icon: any; color: string; ts: number }> = [];
        (revs || []).forEach((r: any) => items.push({ id: `rev-${r.id}`, text: `New ${r.rating}-star review from ${r.author_name}`, time: new Date(r.review_date).toLocaleString(), icon: Star, color: 'text-orange-500', ts: new Date(r.review_date).getTime() }));
        (posts || []).forEach((p: any) => items.push({ id: `post-${p.id}`, text: `Post published: ${String(p.caption || '').slice(0, 40)}`, time: new Date(p.created_at).toLocaleString(), icon: FileText, color: 'text-orange-500', ts: new Date(p.created_at).getTime() }));
        (locs || []).forEach((l: any) => items.push({ id: `loc-${l.id}`, text: `Location added: ${l.location_name}`, time: new Date(l.created_at).toLocaleString(), icon: MapPin, color: 'text-orange-500', ts: new Date(l.created_at).getTime() }));

        items.sort((a, b) => b.ts - a.ts);
        setRecentActivities(items.slice(0, 6).map(({ ts, ...rest }) => rest));

        // AI Suggestions: pending reviews, posting cadence, missing business info
        const [{ count: pendingReviews }, lastPostRes, { data: allLocs }] = await Promise.all([
          supabase.from('gmb_reviews').select('*', { count: 'exact', head: true }).is('reply_text', null),
          supabase.from('gmb_posts').select('created_at').order('created_at', { ascending: false }).limit(1).maybeSingle(),
          supabase.from('gmb_locations').select('id, website, phone'),
        ]);

        const now = Date.now();
        const lastPostAt = lastPostRes?.data?.created_at ? new Date(lastPostRes.data.created_at).getTime() : 0;
        const daysSincePost = lastPostAt ? Math.floor((now - lastPostAt) / (1000 * 60 * 60 * 24)) : Infinity;
        const missingInfo = (allLocs || []).some((l: any) => !l.website || !l.phone);

        const sug: Array<{ id: number; title: string; description: string; priority: 'high'|'medium'|'low'; action: string; icon: any }> = [];
        if ((pendingReviews || 0) > 0) sug.push({ id: 1, title: 'Respond to pending reviews', description: `${pendingReviews} review(s) awaiting reply`, priority: 'high', action: '/reviews', icon: Star });
        if (daysSincePost > 3) sug.push({ id: 2, title: 'Post weekly update', description: `Last post ${isFinite(daysSincePost) ? daysSincePost + 'd' : 'N/A'} ago`, priority: 'medium', action: '/posts', icon: FileText });
        if (missingInfo) sug.push({ id: 3, title: 'Complete business info', description: 'Some locations missing phone/website', priority: 'low', action: '/locations', icon: Clock });
        setAiSuggestions(sug);

        // Location performance (last 7d): sum views/calls per location
        const start = new Date();
        start.setDate(start.getDate() - 7);
        const startStr = start.toISOString().split('T')[0];
        const { data: insightRows } = await supabase
          .from('gmb_insights')
          .select('location_id, metric_type, metric_value, date')
          .gte('date', startStr);

        const agg: Record<string, { views: number; calls: number }> = {};
        (insightRows || []).forEach((row: any) => {
          if (!agg[row.location_id]) agg[row.location_id] = { views: 0, calls: 0 };
          if (row.metric_type === 'views') agg[row.location_id].views += row.metric_value || 0;
          if (row.metric_type === 'calls') agg[row.location_id].calls += row.metric_value || 0;
        });

        const nameMap: Record<string, { name: string; rating?: number }> = {};
        (locations || []).forEach((loc: any) => { nameMap[loc.id] = { name: loc.location_name, rating: loc.rating }; });

        const perf = Object.entries(agg).map(([locId, vals]) => ({
          name: nameMap[locId]?.name || 'Location',
          views: vals.views,
          calls: vals.calls,
          rating: nameMap[locId]?.rating,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 4);

        setLocationPerf(perf);
      } catch (e) {
        // swallow; dashboard will still render
      }
    };
    load();
  }, [user, locations]);

  const hasGmbConnection = accounts.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Views',
      value: stats.totalViews,
      change: '+12.5%',
      icon: Eye,
      color: 'bg-blue-500/20 text-orange-500'
    },
    {
      title: 'Searches',
      value: stats.totalSearches,
      change: '+8.2%',
      icon: Search,
      color: 'bg-green-500/20 text-orange-500'
    },
    {
      title: 'Phone Calls',
      value: stats.totalCalls,
      change: '+15.3%',
      icon: Phone,
      color: 'bg-yellow-500/20 text-white'
    },
    {
      title: 'Messages',
      value: stats.totalMessages,
      change: '+5.1%',
      icon: MessageCircle,
      color: 'bg-purple-500/20 text-orange-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Welcome, {getUserDisplayName()}</h1>
          <p className="text-white/70 mt-1">Here’s what’s happening with your business</p>
        </div>
        {hasGmbConnection ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-4 py-2 rounded-lg font-medium"
          >
            <TrendingUp className="w-5 h-5" />
            <span>All metrics trending up</span>
          </motion.div>
        ) : null}
      </div>

      {/* GMB Connection Notice */}
      {!hasGmbConnection && !accountsLoading && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <AlertCircle className="w-10 h-10 text-white/80 mb-3" />
          <h2 className="text-xl font-semibold text-white mb-2">Connect your Google Business</h2>
          <p className="text-white/70 mb-4 max-w-2xl">
            To manage your locations, reviews, and insights, please connect your Google Business account.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={async () => {
              try {
                await GoogleAuthService.connectGoogleAccount();
              } catch (error) {
                console.error('Failed to connect Google:', error);
              }
            }}
            className="inline-flex items-center space-x-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-6 py-3 rounded-lg text-base hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-colors"
          >
            <Chrome className="w-6 h-6" />
            <span>Connect Google My Business</span>
          </motion.button>
          <p className="text-xs text-white/60 mt-3">This will redirect you to Google to authorize access to your business account.</p>
        </motion.div>
      )}

      {/* Stats Grid */}
      <h3 className="text-lg font-semibold text-white/90 mb-2">Key metrics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Charts Section */}
      <h3 className="text-lg font-semibold text-white/90 mb-2">Performance trends</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsChart
          data={insights.length > 0 ? insights : []}
          type="line"
          title="Weekly Performance Trends"
        />
        <InsightsChart
          data={insights.length > 0 ? insights : []}
          type="bar"
          title="Daily Metrics Comparison"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <motion.button
              onClick={() => navigate('/locations')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors text-left border border-white/10 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-white" />
                  <div>
                    <h4 className="font-medium text-white">Manage Locations</h4>
                    <p className="text-xs text-white">Update business info</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/reviews')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors text-left border border-white/10 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-medium text-white">View Reviews</h4>
                    <p className="text-xs text-white">Respond to feedback</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              </div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/posts')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white/5 p-4 rounded-lg hover:bg-white/10 transition-colors text-left border border-white/10 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-orange-500" />
                  <div>
                    <h4 className="font-medium text-white">Create Post</h4>
                    <p className="text-xs text-white">Share updates</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white/80 group-hover:text-white transition-colors" />
              </div>
            </motion.button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 pb-4 border-b border-white/10 last:border-0 last:pb-0"
                >
                  <div className={`p-2 rounded-lg bg-nnh-orange/5`}>
                    <Icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90">{activity.text}</p>
                    <p className="text-xs text-white/60 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            AI Suggestions
          </h3>
          <div className="space-y-3">
            {aiSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon;
              const priorityColors = {
                high: 'border-red-500/30 bg-red-500/10',
                medium: 'border-yellow-500/30 bg-yellow-500/10',
                low: 'border-green-500/30 bg-green-500/10'
              };
              return (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  onClick={() => navigate(suggestion.action)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-lg border text-left transition-all group ${priorityColors[suggestion.priority as keyof typeof priorityColors]}`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-white mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{suggestion.title}</h4>
                      <p className="text-xs text-white mt-1">{suggestion.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white group-hover:text-white transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Location Performance Comparison */}
      {hasGmbConnection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 rounded-xl p-6 border border-white/10"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Location Performance Comparison
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {locationPerf.map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors group"
              >
                <div className={`w-full h-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mb-4`} />
                <h4 className="font-semibold text-white mb-3">{location.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Views</span>
                    <span className="text-white font-medium">{Number(location.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Calls</span>
                    <span className="text-white font-medium">{Number(location.calls || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-orange-500" />
                      <span className="text-white font-medium">{location.rating ?? '-'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Dashboard;