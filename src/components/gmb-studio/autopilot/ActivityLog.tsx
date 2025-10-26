import { motion } from 'framer-motion';
import { Bot, MessageCircle, FileText, Calendar } from 'lucide-react';

interface Activity {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
  success: boolean;
}

interface ActivityLogProps {
  activities: Activity[];
}

function ActivityLog({ activities }: ActivityLogProps) {
  const getIcon = (type: string) => {
    const icons = {
      auto_reply: MessageCircle,
      auto_post: FileText,
      scheduled: Calendar,
      default: Bot
    };
    return icons[type as keyof typeof icons] || icons.default;
  };

  const getIconColor = (success: boolean) => {
    return success
      ? 'text-orange-500 bg-green-400/20'
      : 'text-orange-500 bg-red-400/20';
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
      <h3 className="text-xl font-bold text-white mb-6">Activity Log</h3>

      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-white text-center py-8">No activity yet</p>
        ) : (
          activities.map((activity, index) => {
            const Icon = getIcon(activity.action_type);
            const iconColor = getIconColor(activity.success);

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
                    <p className="text-white/80 text-sm">
                      {activity.description}
                    </p>
                    <span className="text-xs text-white whitespace-nowrap ml-2">
                      {formatTime(activity.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${activity.success ? 'text-orange-500' : 'text-orange-500'}`}>
                      {activity.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ActivityLog;
