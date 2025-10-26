import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartData {
  date: string;
  views: number;
  searches: number;
  calls: number;
}

interface PerformanceChartProps {
  data: ChartData[];
}

function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <div className="bg-black border border-neon-orange rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Performance Overview</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis
            dataKey="date"
            stroke="#ffffff60"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#ffffff60" style={{ fontSize: '12px' }} />
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
          <Line
            type="monotone"
            dataKey="views"
            stroke="#60a5fa"
            strokeWidth={2}
            name="Profile Views"
            dot={{ fill: '#60a5fa', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="searches"
            stroke="#a78bfa"
            strokeWidth={2}
            name="Searches"
            dot={{ fill: '#a78bfa', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="calls"
            stroke="#34d399"
            strokeWidth={2}
            name="Calls"
            dot={{ fill: '#34d399', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PerformanceChart;
