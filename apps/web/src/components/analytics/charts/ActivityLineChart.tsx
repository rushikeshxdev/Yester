import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { getCategoryColor, getCategoryLabel } from '../../../config/categoryTheme';

export interface ActivityDataPoint {
  date: string;
  total: number;
  categories?: Record<string, number>;
}

interface ActivityLineChartProps {
  dataPoints: ActivityDataPoint[];
  granularity: 'daily' | 'weekly' | 'monthly';
  onGranularityChange?: (g: 'daily' | 'weekly' | 'monthly') => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

export const ActivityLineChart: React.FC<ActivityLineChartProps> = ({
  dataPoints,
  granularity,
  onGranularityChange,
  selectedCategory = 'ALL',
  onCategoryChange: _onCategoryChange,
}) => {
  const chartColor =
    selectedCategory !== 'ALL' ? getCategoryColor(selectedCategory) : '#FF7138';

  const totalEntries = dataPoints.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-xl space-y-4">
      {/* Title & Granularity Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#1E232B]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF7138]" />
            <h3 className="text-xl font-serif text-white tracking-tight">
              Activity Trajectory
            </h3>
          </div>
          <p className="text-xs font-sans text-neutral-400 mt-1">
            Chronological cadence ({granularity}) • {totalEntries} total entries in period
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {onGranularityChange && (
            <div className="flex items-center gap-1 p-1 rounded-full bg-[#141820] border border-[#202632]">
              {(['daily', 'weekly', 'monthly'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => onGranularityChange(g)}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono capitalize transition-all cursor-pointer ${
                    granularity === g
                      ? 'bg-[#FF7138] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recharts Area Chart */}
      {dataPoints.length > 0 ? (
        <div className="h-64 sm:h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                stroke="#475161"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val: string) => {
                  if (granularity === 'monthly') return val.slice(5, 7);
                  if (granularity === 'daily') return val.slice(5);
                  return val.slice(5);
                }}
              />
              <YAxis
                stroke="#475161"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ActivityDataPoint;
                    return (
                      <div className="p-3 rounded-xl bg-[#12151B] border border-[#232934] text-xs font-mono shadow-xl space-y-1.5">
                        <p className="font-semibold text-white">{label}</p>
                        <p className="text-[#FF7138] font-medium">
                          {data.total} {data.total === 1 ? 'entry' : 'entries'}
                        </p>
                        {data.categories && (
                          <div className="pt-1 border-t border-neutral-800 space-y-0.5">
                            {Object.entries(data.categories)
                              .filter(([_, count]) => count > 0)
                              .map(([cat, count]) => (
                                <div
                                  key={cat}
                                  className="flex items-center justify-between gap-3 text-[11px]"
                                >
                                  <span style={{ color: getCategoryColor(cat) }}>
                                    {getCategoryLabel(cat)}:
                                  </span>
                                  <span className="text-white">{count}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke={chartColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#activityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-500 font-mono text-xs">
          <p>No activity logged for selected criteria.</p>
          <p className="text-neutral-600 mt-1">Zero activity is recorded in this period.</p>
        </div>
      )}
    </div>
  );
};
