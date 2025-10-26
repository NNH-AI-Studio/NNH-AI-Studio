import { motion } from 'framer-motion';
import { Eye, Search, Phone, MessageCircle, TrendingUp, MapPin, Loader2, Chrome, AlertCircle, Star, FileText, Zap, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/cards/StatCard';
import InsightsChart from '../components/charts/InsightsChart';
import { useInsights } from '../hooks/useInsights';
import { useAccounts } from '../hooks/useAccounts';
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

  const recentActivities = [
    { id: 1, type: 'review', text: 'New 5-star review from Sarah M.', time: '5 min ago', icon: Star, color: 'text-orange-500' },
    { id: 2, type: 'post', text: 'Post published: Weekend Special Offer', time: '1 hour ago', icon: FileText, color: 'text-orange-500' },
    { id: 3, type: 'action', text: 'Location verified: Downtown Office', time: '3 hours ago', icon: MapPin, color: 'text-orange-500' },
    { id: 4, type: 'insight', text: 'Profile views increased by 24%', time: '5 hours ago', icon: TrendingUp, color: 'text-orange-500' },
  ];

  const aiSuggestions = [
    { id: 1, title: 'Respond to pending reviews', description: '3 reviews are waiting for your response', priority: 'high', action: '/reviews', icon: Star },
    { id: 2, title: 'Post weekly update', description: 'You haven\'t posted in 4 days', priority: 'medium', action: '/posts', icon: FileText },
    { id: 3, title: 'Update business hours', description: 'Holiday hours need updating', priority: 'low', action: '/locations', icon: Clock },
  ];

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
            {[
              { name: 'Downtown Office', views: 2847, calls: 143, rating: 4.8, color: 'from-blue-500 to-cyan-500' },
              { name: 'North Branch', views: 1923, calls: 98, rating: 4.6, color: 'from-green-500 to-emerald-500' },
              { name: 'Mall Location', views: 3421, calls: 187, rating: 4.9, color: 'from-purple-500 to-pink-500' },
              { name: 'Airport Branch', views: 1654, calls: 76, rating: 4.5, color: 'from-orange-500 to-amber-500' },
            ].map((location, index) => (
              <motion.div
                key={location.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors group"
              >
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${location.color} mb-4`} />
                <h4 className="font-semibold text-white mb-3">{location.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Views</span>
                    <span className="text-white font-medium">{location.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Calls</span>
                    <span className="text-white font-medium">{location.calls}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">Rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-orange-500" />
                      <span className="text-white font-medium">{location.rating}</span>
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