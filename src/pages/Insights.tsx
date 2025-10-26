import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LineChart, PieChart, Calendar } from 'lucide-react';
import InsightsChart from '../components/charts/InsightsChart';
import { mockInsightsData } from '../mock/data';

function Insights() {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState('7d');

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
          <p className="text-white mt-2">Deep dive into your business performance</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-black rounded-lg p-1">
            {timeRanges.map((range) => (
              <motion.button
                key={range.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setTimeRange(range.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range.value
                    ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                    : 'text-white hover:text-white'
                }`}
              >
                {range.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black rounded-xl p-6 border border-neon-orange shadow-neon-orange"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Performance Overview</h3>
          <div className="flex bg-black rounded-lg p-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                  : 'text-white hover:text-white'
              }`}
            >
              <LineChart className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'bar'
                  ? 'bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black font-semibold'
                  : 'text-white hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <InsightsChart 
          data={mockInsightsData} 
          type={chartType} 
          title="Business Metrics Trend"
        />
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black rounded-xl p-6 border border-neon-orange shadow-neon-orange"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">Total Views</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">24,456</p>
          <p className="text-orange-500 text-sm">+18.2% from last period</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black rounded-xl p-6 border border-neon-orange shadow-neon-orange"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <PieChart className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">12.4%</p>
          <p className="text-orange-500 text-sm">+2.1% from last period</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black rounded-xl p-6 border border-neon-orange shadow-neon-orange"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">Avg. Response Time</h3>
          </div>
          <p className="text-3xl font-bold text-white mb-2">2.3h</p>
          <p className="text-orange-500 text-sm">-12min from last period</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Insights;