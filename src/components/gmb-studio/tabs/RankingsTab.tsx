import { useState, useMemo } from 'react';
import { Plus, TrendingUp, TrendingDown, Award, Search } from 'lucide-react';
import { useRankings } from '../../../hooks/useRankings';
import KeywordTable from '../rankings/KeywordTable';
import RankingChart from '../rankings/RankingChart';

interface RankingsTabProps {
  selectedLocation: string;
}

function RankingsTab({ selectedLocation }: RankingsTabProps) {
  const { rankings, loading } = useRankings(selectedLocation);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRankings = useMemo(() => {
    if (!searchTerm) return rankings;
    return rankings.filter((ranking) =>
      ranking.keyword.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [rankings, searchTerm]);

  const stats = useMemo(() => {
    const rankedKeywords = rankings.filter((r) => r.current_position);
    const top3 = rankings.filter((r) => r.current_position && r.current_position <= 3).length;
    const improved = rankings.filter((r) => {
      if (!r.current_position || !r.previous_position) return false;
      return r.current_position < r.previous_position;
    }).length;
    const declined = rankings.filter((r) => {
      if (!r.current_position || !r.previous_position) return false;
      return r.current_position > r.previous_position;
    }).length;

    const avgPosition = rankedKeywords.length > 0
      ? Math.round(
          rankedKeywords.reduce((sum, r) => sum + (r.current_position || 0), 0) /
            rankedKeywords.length
        )
      : 0;

    return {
      total: rankings.length,
      avgPosition,
      top3,
      improved,
      declined
    };
  }, [rankings]);

  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    return last30Days.map((date) => {
      const dataPoint: any = { date };
      rankings.slice(0, 6).forEach((ranking) => {
        const basePosition = ranking.current_position || 50;
        const variation = Math.floor(Math.random() * 10) - 5;
        dataPoint[ranking.keyword] = Math.max(1, Math.min(100, basePosition + variation));
      });
      return dataPoint;
    });
  }, [rankings]);

  const topKeywords = rankings.slice(0, 6).map((r) => r.keyword);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Rankings & Keywords</h2>
          <p className="text-white mt-1">
            Track your keyword rankings and monitor performance
          </p>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-black rounded-lg font-semibold hover:from-orange-600 hover:via-orange-700 hover:to-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/20">
          <Plus className="w-5 h-5" />
          Add Keyword
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <Search className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
          <div className="text-sm text-white">Tracked Keywords</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.avgPosition}</div>
          <div className="text-sm text-white">Avg Position</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.top3}</div>
          <div className="text-sm text-white">Top 3 Rankings</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.improved}</div>
          <div className="text-sm text-white">Improved</div>
        </div>

        <div className="bg-black border border-neon-orange rounded-xl p-6 shadow-neon-orange">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.declined}</div>
          <div className="text-sm text-white">Declined</div>
        </div>
      </div>

      <RankingChart data={chartData} keywords={topKeywords} />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search keywords..."
          className="w-full pl-10 pr-4 py-3 bg-black border border-orange-500 rounded-lg text-white placeholder:text-white focus:outline-none focus:border-orange-600 focus:shadow-neon-orange transition-all"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        </div>
      ) : filteredRankings.length === 0 ? (
        <div className="bg-black border border-neon-orange rounded-xl p-12 text-center">
          <Search className="w-16 h-16 text-orange-500/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchTerm ? 'No keywords found' : 'No keywords yet'}
          </h3>
          <p className="text-white">
            {searchTerm
              ? 'Try adjusting your search'
              : 'Add keywords to start tracking your rankings'}
          </p>
        </div>
      ) : (
        <KeywordTable rankings={filteredRankings} />
      )}
    </div>
  );
}

export default RankingsTab;
