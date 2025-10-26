import { motion } from 'framer-motion';
import { Star, FileText, MessageCircle, Calendar } from 'lucide-react';

interface Activity {
  id: string;
  type: 'review' | 'post' | 'message' | 'insight';
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: string) => {
    const icons = {
      review: Star,
      post: FileText,
      message: MessageCircle,
      insight: Calendar
    };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getIconColor = (type: string) => {
    const colors = {
      review: 'text-orange-500 bg-yellow-400/20',
      post: 'text-orange-500 bg-blue-400/20',
      message: 'text-orange-500 bg-green-400/20',
      insight: 'text-orange-500 bg-purple-400/20'
    };
    return colors[type as keyof typeof colors] || 'text-white bg-gray-800';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="bg-black border border-neon-orange rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-white text-center py-8">No recent activity</p>
        ) : (
          activities.map((activity, index) => {
            const Icon = getIcon(activity.type);
            const iconColor = getIconColor(activity.type);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-4 p-4 rounded-lg hover:bg-black transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg ${iconColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-white truncate">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-white whitespace-nowrap ml-2">
                      {formatTime(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-white line-clamp-2">
                    {activity.description}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
