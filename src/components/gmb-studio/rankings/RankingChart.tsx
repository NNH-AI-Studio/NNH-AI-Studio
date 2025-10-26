import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

interface RankingChartProps {
  data: ChartDataPoint[];
  keywords: string[];
}

const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#fb923c'];

function RankingChart({ data, keywords }: RankingChartProps) {
  return (
    <div className="bg-black border border-neon-orange rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Ranking Trends</h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-white">
          No ranking data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis
              dataKey="date"
              stroke="#ffffff60"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#ffffff60"
              style={{ fontSize: '12px' }}
              reversed
              domain={[1, 100]}
              label={{ value: 'Position', angle: -90, position: 'insideLeft', style: { fill: '#ffffff60' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#000',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {keywords.slice(0, 6).map((keyword, index) => (
              <Line
                key={keyword}
                type="monotone"
                dataKey={keyword}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                name={keyword}
                dot={{ fill: colors[index % colors.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default RankingChart;
