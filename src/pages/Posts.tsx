import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, MessageCircle, Share2, Calendar, MapPin, Loader2, FileX, LayoutGrid, CalendarDays, Eye, MousePointerClick, FileText, Tag, Megaphone, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import CreatePostModal from '../components/modals/CreatePostModal';
import AIDrawer from '../components/shared/AIDrawer';
import { aiGeneratePost } from '../lib/ai';

function Posts() {
  const { posts, loading } = usePosts();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState<'friendly' | 'professional' | 'short'>('friendly');
  const [aiLang, setAiLang] = useState<'English' | 'Arabic'>('English');
  const [aiCaptionDraft, setAiCaptionDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const templates = [
    { id: 'event', title: 'Event Announcement', icon: Calendar, description: 'Promote upcoming events', color: 'from-blue-500 to-cyan-500' },
    { id: 'offer', title: 'Special Offer', icon: Tag, description: 'Share discounts and deals', color: 'from-purple-500 to-pink-500' },
    { id: 'update', title: 'Business Update', icon: Megaphone, description: 'Announce changes or news', color: 'from-green-500 to-emerald-500' },
    { id: 'product', title: 'Product Showcase', icon: FileText, description: 'Highlight products/services', color: 'from-orange-500 to-amber-500' },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getPostsForDate = (date: Date | null) => {
    if (!date) return [];
    return posts.filter(post => {
      const postDate = new Date(post.scheduled_at || post.created_at);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const stats = useMemo(() => {
    const totalViews = posts.reduce((sum, p) => sum + (p.engagement?.views || 0), 0);
    const totalClicks = posts.reduce((sum, p) => sum + (p.engagement?.clicks || 0), 0);
    const totalLikes = posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0);
    const avgEngagement = posts.length > 0 ? ((totalLikes + totalClicks) / posts.length).toFixed(1) : '0';
    return { totalViews, totalClicks, totalLikes, avgEngagement };
  }, [posts]);

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Posts & Updates</h1>
          <p className="text-white/70 mt-2">Manage your Google My Business posts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'grid' ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold' : 'text-white hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'calendar' ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold' : 'text-white hover:text-white'
              }`}
            >
              <CalendarDays className="w-4 h-4" />
              <span className="text-sm font-medium">Calendar</span>
            </button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiOpen(true)}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-medium"
          >
            Ask AI
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Post</span>
          </motion.button>
        </div>
      </div>

      {/* Performance Metrics */}
      {posts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-white">Total Views</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
            <div className="text-xs text-orange-500 mt-1">+12.5% from last month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-white">Total Clicks</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalClicks.toLocaleString()}</div>
            <div className="text-xs text-orange-500 mt-1">+8.3% from last month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-pink-400" />
              <span className="text-sm text-white">Total Likes</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalLikes.toLocaleString()}</div>
            <div className="text-xs text-orange-500 mt-1">+15.7% from last month</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-white">Avg Engagement</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.avgEngagement}</div>
            <div className="text-xs text-orange-500 mt-1">per post</div>
          </motion.div>
        </div>
      )}

      {/* Templates */}
      {posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quick Templates
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsCreateModalOpen(true);
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 text-left transition-all group"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">{template.title}</h4>
                  <p className="text-xs text-white/80">{template.description}</p>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {viewMode === 'calendar' && posts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-white py-2">
                {day}
              </div>
            ))}
            {getDaysInMonth(currentMonth).map((date, index) => {
              const dayPosts = date ? getPostsForDate(date) : [];
              const isToday = date && date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-lg border transition-all ${
                    date
                      ? isToday
                        ? 'bg-blue-500/10 border-blue-500/50'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                      : 'bg-transparent border-transparent'
                  }`}
                >
                  {date && (
                    <>
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-orange-500' : 'text-white'
                      }`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.slice(0, 2).map((post) => (
                          <div
                            key={post.id}
                            className={`text-xs p-1 rounded truncate ${
                              post.status === 'published'
                                ? 'bg-green-500/20 text-white'
                                : 'bg-yellow-500/20 text-white'
                            }`}
                          >
                            {post.caption?.slice(0, 20)}...
                          </div>
                        ))}
                        {dayPosts.length > 2 && (
                          <div className="text-xs text-white/80">+{dayPosts.length - 2} more</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      ) : posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-96 bg-white/5 rounded-xl border border-white/10"
        >
          <FileX className="w-16 h-16 text-white mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
          <p className="text-white/80 mb-6 text-center max-w-md">
            Create your first post to start engaging with your customers on Google My Business.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create First Post</span>
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300"
          >
            {post.image_url && (
              <div className="relative">
                <img
                  src={post.image_url}
                  alt="Post"
                  className="w-full h-48 object-cover"
                />
                <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-sm font-medium ${
                  post.post_type === 'photo'
                    ? 'bg-blue-900/80 text-blue-300'
                    : post.post_type === 'event'
                    ? 'bg-green-900/80 text-green-300'
                    : post.post_type === 'offer'
                    ? 'bg-purple-900/80 text-purple-300'
                    : 'bg-black/80 text-white'
                }`}>
                  {post.post_type.toUpperCase()}
                </div>
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                  post.status === 'published'
                    ? 'bg-green-900/80 text-green-300'
                    : post.status === 'scheduled'
                    ? 'bg-yellow-900/80 text-yellow-300'
                    : 'bg-black/80 text-white'
                }`}>
                  {post.status}
                </div>
              </div>
            )}

            <div className="p-6">
              <p className="text-white mb-4 line-clamp-3">{post.caption}</p>

              <div className="flex items-center space-x-4 text-sm text-white mb-4">
                {post.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{post.location.location_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex space-x-6 text-sm text-white">
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{post.engagement.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.engagement.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Share2 className="w-4 h-4" />
                    <span>{post.engagement.shares}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold rounded-lg hover:bg-black transition-colors text-sm font-medium"
                >
                  Edit
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
        </div>
      )}

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        initialCaption={aiCaptionDraft}
      />

      {/* AI Drawer */}
      <AIDrawer isOpen={aiOpen} onClose={() => setAiOpen(false)} title="AI Assistant">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/80 mb-1">Topic or keywords</label>
            <input
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40"
              placeholder="e.g. weekly offer, new product"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-white/80 mb-1">Tone</label>
              <select
                value={aiTone}
                onChange={(e) => setAiTone(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option value="friendly">Friendly</option>
                <option value="professional">Professional</option>
                <option value="short">Short</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Language</label>
              <select
                value={aiLang}
                onChange={(e) => setAiLang(e.target.value as any)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white"
              >
                <option>English</option>
                <option>Arabic</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/80 mb-1">Draft caption</label>
            <textarea
              value={aiCaptionDraft}
              onChange={(e) => setAiCaptionDraft(e.target.value)}
              className="w-full h-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/40 resize-none"
              placeholder="AI draft will appear here"
            />
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              disabled={aiLoading}
              onClick={async () => {
                try {
                  setAiLoading(true);
                  const captions = await aiGeneratePost({ topic: aiTopic, tone: aiTone, language: aiLang });
                  setAiCaptionDraft(captions[0] || '');
                } finally {
                  setAiLoading(false);
                }
              }}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm disabled:opacity-50"
            >
              {aiLoading ? 'Generating…' : 'Generate Caption'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setIsCreateModalOpen(true);
                setAiOpen(false);
              }}
              className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg text-sm"
            >
              Use in composer
            </motion.button>
          </div>
        </div>
      </AIDrawer>
    </motion.div>
  );
}

export default Posts;