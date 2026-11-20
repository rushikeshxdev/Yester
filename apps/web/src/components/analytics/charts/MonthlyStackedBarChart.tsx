import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { Layers } from 'lucide-react';
import { getCategoryColor, getCategoryLabel } from '../../../config/categoryTheme';

export interface MonthlyCategoryItem {
  month: string; // YYYY-MM
  monthLabel: string;
  categories: Record<string, number>;
  total: number;
}

interface MonthlyStackedBarChartProps {
  data: MonthlyCategoryItem[];
  year: number;
}

const CATEGORY_KEYS = ['WORK', 'FITNESS', 'LEARNING', 'PROJECT', 'PERSONAL'];

export const MonthlyStackedBarChart: React.FC<MonthlyStackedBarChartProps> = ({
  data,
  year,
}) => {
  // Flatten categories object into top-level properties for Recharts Bar
  const chartData = data.map((item) => {
    const flat: Record<string, any> = {
      monthLabel: item.monthLabel,
      month: item.month,
      total: item.total,
    };
    for (const cat of CATEGORY_KEYS) {
      flat[cat] = item.categories[cat] || 0;
    }
    return flat;
  });

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#1E232B]">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF7138]" />
            <h3 className="text-lg font-serif text-white tracking-tight">
              Monthly Category Mix ({year})
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Shifts in life focus and domain composition over time
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="monthLabel"
              stroke="#8B949E"
              fontSize={11}
              tickLine={false}
              axisLine={false}
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
                  const total = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                  return (
                    <div className="p-3 rounded-xl bg-[#12151B] border border-[#232934] text-xs font-mono shadow-xl space-y-1.5 min-w-[140px]">
                      <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
                        <span className="font-semibold text-white">{label}</span>
                        <span className="text-neutral-400">{total} entries</span>
                      </div>
                      <div className="space-y-1">
                        {payload.map((entry) => {
                          const val = Number(entry.value) || 0;
                          if (val === 0) return null;
                          const cat = entry.dataKey as string;
                          return (
                            <div key={cat} className="flex items-center justify-between gap-3 text-[11px]">
                              <span style={{ color: getCategoryColor(cat) }}>
                                {getCategoryLabel(cat)}:
                              </span>
                              <span className="text-white font-medium">{val}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '8px' }}
              formatter={(value) => (
                <span className="text-neutral-400 font-sans">{getCategoryLabel(value)}</span>
              )}
            />
            {CATEGORY_KEYS.map((cat, idx) => (
              <Bar
                key={cat}
                dataKey={cat}
                stackId="categoryStack"
                fill={getCategoryColor(cat)}
                radius={idx === CATEGORY_KEYS.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
