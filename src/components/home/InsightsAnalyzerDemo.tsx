import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Phone, Navigation, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../shared/Button';

const metrics = [
  { icon: Eye, label: 'Profile Views', value: '2,847', change: '+12%', color: 'from-blue-500 to-cyan-500' },
  { icon: Phone, label: 'Phone Calls', value: '143', change: '+8%', color: 'from-green-500 to-emerald-500' },
  { icon: Navigation, label: 'Direction Requests', value: '521', change: '+15%', color: 'from-purple-500 to-pink-500' },
  { icon: Clock, label: 'Avg Response Time', value: '2.3h', change: '-25%', color: 'from-orange-500 to-amber-500' }
];

const insights = [
  {
    title: 'Peak Engagement Times',
    description: 'Your posts get 3x more engagement when published between 10 AM - 2 PM on weekdays.',
    priority: 'high',
    icon: TrendingUp
  },
  {
    title: 'Response Time Impact',
    description: 'Locations with sub-3 hour response times see 40% more conversion from profile views to calls.',
    priority: 'medium',
    icon: Clock
  },
  {
    title: 'Photo Upload Opportunity',
    description: 'Profiles with 20+ photos get 2x more direction requests. You currently have 12 photos.',
    priority: 'high',
    icon: AlertCircle
  },
  {
    title: 'Review Response Rate',
    description: 'Great job! Your 98% response rate is above industry average and building strong trust.',
    priority: 'low',
    icon: CheckCircle
  }
];

export default function InsightsAnalyzerDemo() {
  const [showInsights, setShowInsights] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [visibleInsights, setVisibleInsights] = useState<number[]>([]);

  const analyze = async () => {
    setIsAnalyzing(true);
    setVisibleInsights([]);

    await new Promise(resolve => setTimeout(resolve, 1500));

    setShowInsights(true);
    setIsAnalyzing(false);

    for (let i = 0; i < insights.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400));
      setVisibleInsights(prev => [...prev, i]);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-white/60 bg-nnh-orange/5 border-neon-orange shadow-neon-orange';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded ${
                  metric.change.startsWith('+') ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                }`}>
                  {metric.change}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-sm text-white/60">{metric.label}</div>
            </motion.div>
          );
        })}
      </div>

      <Button
        onClick={analyze}
        disabled={isAnalyzing}
        className="w-full"
      >
        {isAnalyzing ? 'Analyzing Data...' : 'Analyze with AI'}
      </Button>

      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-white">AI-Generated Insights</h4>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/60">Live Analysis</span>
              </div>
            </div>

            <div className="space-y-3">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <AnimatePresence key={index}>
                    {visibleInsights.includes(index) && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-nnh-orange/5 border border-neon-orange shadow-neon-orange rounded-xl p-4 hover:border-neon-orange shadow-neon-orange transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h5 className="font-semibold text-white">{insight.title}</h5>
                              <span className={`text-xs px-2 py-1 rounded-full border whitespace-nowrap ${getPriorityColor(insight.priority)}`}>
                                {insight.priority}
                              </span>
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed">
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">Overall Performance Score</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-nnh-orange/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '87%' }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    </div>
                    <span className="text-lg font-bold text-white">87%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
