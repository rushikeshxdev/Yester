import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { BarChart3, FlipHorizontal } from 'lucide-react';
import { getCategoryColor, getCategoryLabel } from '../../../config/categoryTheme';
import { CategoryDistributionItem } from './CategoryDonutChart';

interface CategoryComparisonBarProps {
  distribution: CategoryDistributionItem[];
}

export const CategoryComparisonBar: React.FC<CategoryComparisonBarProps> = ({
  distribution,
}) => {
  const [isHorizontal, setIsHorizontal] = useState<boolean>(true);

  const formattedData = distribution.map((item) => ({
    category: item.category,
    label: getCategoryLabel(item.category),
    count: item.count,
    percentage: item.percentage,
    color: getCategoryColor(item.category),
  }));

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#1E232B]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#FF7138]" />
            <h3 className="text-lg font-serif text-white tracking-tight">
              Category Volume Comparison
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Comparative balance across life domains
          </span>
        </div>

        {/* Orientation Toggle */}
        <button
          onClick={() => setIsHorizontal(!isHorizontal)}
          className="p-1.5 rounded-lg bg-[#141820] border border-[#202632] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          title="Toggle chart orientation"
        >
          <FlipHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {isHorizontal ? (
            <BarChart
              data={formattedData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
            >
              <XAxis type="number" stroke="#475161" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="label"
                stroke="#8B949E"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="px-3 py-2 rounded-xl bg-[#12151B] border border-[#232934] text-xs font-mono shadow-xl space-y-0.5">
                        <p className="font-semibold" style={{ color: data.color }}>
                          {data.label}
                        </p>
                        <p className="text-white">
                          {data.count} entries ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {formattedData.map((entry) => (
                  <Cell key={`bar-${entry.category}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={formattedData}
              layout="horizontal"
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="px-3 py-2 rounded-xl bg-[#12151B] border border-[#232934] text-xs font-mono shadow-xl space-y-0.5">
                        <p className="font-semibold" style={{ color: data.color }}>
                          {data.label}
                        </p>
                        <p className="text-white">
                          {data.count} entries ({data.percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {formattedData.map((entry) => (
                  <Cell key={`bar-${entry.category}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
