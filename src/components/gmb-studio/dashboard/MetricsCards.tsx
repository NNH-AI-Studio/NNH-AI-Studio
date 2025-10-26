import { motion } from 'framer-motion';
import { Eye, Search, Phone, MessageCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface Metric {
  label: string;
  value: number;
  change: number;
  icon: React.ElementType;
  color: string;
}

interface MetricsCardsProps {
  metrics: {
    views: number;
    searches: number;
    calls: number;
    messages: number;
    viewsChange: number;
    searchesChange: number;
    callsChange: number;
    messagesChange: number;
  };
}

function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards: Metric[] = [
    {
      label: 'Profile Views',
      value: metrics.views,
      change: metrics.viewsChange,
      icon: Eye,
      color: 'blue'
    },
    {
      label: 'Search Appearances',
      value: metrics.searches,
      change: metrics.searchesChange,
      icon: Search,
      color: 'purple'
    },
    {
      label: 'Phone Calls',
      value: metrics.calls,
      change: metrics.callsChange,
      icon: Phone,
      color: 'green'
    },
    {
      label: 'Messages',
      value: metrics.messages,
      change: metrics.messagesChange,
      icon: MessageCircle,
      color: 'orange'
    }
  ];

  const colorClasses: Record<string, string> = {
    blue: 'text-orange-500',
    purple: 'text-orange-500',
    green: 'text-orange-500',
    orange: 'text-orange-400'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isPositive = card.change >= 0;

        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-black border border-neon-orange rounded-xl p-6 hover:border-orange-500 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <Icon className={`w-6 h-6 ${colorClasses[card.color]}`} />
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-orange-500' : 'text-orange-500'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {Math.abs(card.change)}%
              </div>
            </div>

            <div className="text-3xl font-bold text-white mb-1">
              {card.value.toLocaleString()}
            </div>
            <div className="text-sm text-white">{card.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default MetricsCards;
