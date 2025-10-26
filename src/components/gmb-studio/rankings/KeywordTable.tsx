import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Award } from 'lucide-react';

interface Ranking {
  id: string;
  keyword: string;
  current_position?: number;
  previous_position?: number;
  best_position?: number;
  search_volume?: number;
  difficulty?: string;
  last_checked?: string;
}

interface KeywordTableProps {
  rankings: Ranking[];
}

function KeywordTable({ rankings }: KeywordTableProps) {
  const getPositionChange = (current?: number, previous?: number) => {
    if (!current || !previous) return null;
    const change = previous - current;
    return change;
  };

  const getDifficultyColor = (difficulty?: string) => {
    const colors: Record<string, string> = {
      easy: 'text-orange-500 bg-green-400/20',
      medium: 'text-orange-500 bg-yellow-400/20',
      hard: 'text-orange-500 bg-red-400/20'
    };
    return colors[difficulty || ''] || 'text-white bg-gray-800';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-black border border-neon-orange rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neon-orange">
              <th className="text-left p-4 text-sm font-medium text-white">Keyword</th>
              <th className="text-center p-4 text-sm font-medium text-white">Position</th>
              <th className="text-center p-4 text-sm font-medium text-white">Change</th>
              <th className="text-center p-4 text-sm font-medium text-white">Best</th>
              <th className="text-center p-4 text-sm font-medium text-white">Volume</th>
              <th className="text-center p-4 text-sm font-medium text-white">Difficulty</th>
              <th className="text-center p-4 text-sm font-medium text-white">Last Checked</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((ranking, index) => {
              const change = getPositionChange(ranking.current_position, ranking.previous_position);

              return (
                <motion.tr
                  key={ranking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-black transition-colors"
                >
                  <td className="p-4">
                    <span className="font-medium text-white">{ranking.keyword}</span>
                  </td>

                  <td className="p-4 text-center">
                    {ranking.current_position ? (
                      <span className="text-2xl font-bold text-white">
                        {ranking.current_position}
                      </span>
                    ) : (
                      <span className="text-white">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {change !== null && change !== 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        {change > 0 ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-500 font-medium">+{change}</span>
                          </>
                        ) : (
                          <>
                            <TrendingDown className="w-4 h-4 text-orange-500" />
                            <span className="text-orange-500 font-medium">{change}</span>
                          </>
                        )}
                      </div>
                    ) : change === 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Minus className="w-4 h-4 text-white" />
                        <span className="text-white">0</span>
                      </div>
                    ) : (
                      <span className="text-white">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {ranking.best_position ? (
                      <div className="flex items-center justify-center gap-1">
                        <Award className="w-4 h-4 text-orange-500" />
                        <span className="text-white font-medium">{ranking.best_position}</span>
                      </div>
                    ) : (
                      <span className="text-white">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {ranking.search_volume ? (
                      <span className="text-white">{ranking.search_volume.toLocaleString()}</span>
                    ) : (
                      <span className="text-white">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {ranking.difficulty ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(ranking.difficulty)}`}>
                        {ranking.difficulty}
                      </span>
                    ) : (
                      <span className="text-white">-</span>
                    )}
                  </td>

                  <td className="p-4 text-center text-sm text-white">
                    {formatDate(ranking.last_checked)}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default KeywordTable;
