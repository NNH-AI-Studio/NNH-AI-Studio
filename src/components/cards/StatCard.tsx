import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  icon: LucideIcon;
  color: string;
  index: number;
}

function StatCard({ title, value, change, icon: Icon, color, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
      className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
          className={`text-sm px-2 py-1 rounded-full border ${
            change.startsWith('+') 
              ? 'bg-green-500/10 text-green-400 border-green-500/20' 
              : change.startsWith('-')
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-white/5 text-white border-white/10'
          }`}
        >
          {change}
        </motion.div>
      </div>
      
      <h3 className="text-white/80 text-sm font-medium mb-2">{title}</h3>
      <motion.p
        initial={{ scale: 0.5 }}
        animate={{ scale: 1 }}
        transition={{ delay: index * 0.2 + 0.5, type: "spring", stiffness: 300 }}
        className="text-3xl font-bold text-white"
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </motion.p>
    </motion.div>
  );
}

export default StatCard;