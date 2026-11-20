import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieIcon, ChevronRight } from 'lucide-react';
import { getCategoryColor, getCategoryLabel } from '../../../config/categoryTheme';
import { ActivityCategory } from '../../../types';

export interface CategoryDistributionItem {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryDonutChartProps {
  distribution: CategoryDistributionItem[];
  totalEntries: number;
  onCategoryClick?: (category: ActivityCategory) => void;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  distribution,
  totalEntries,
  onCategoryClick,
}) => {
  const activeItems = distribution.filter((item) => item.count > 0);

  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-xl space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-[#1E232B]">
        <div>
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-[#FF7138]" />
            <h3 className="text-lg font-serif text-white tracking-tight">
              Category Distribution
            </h3>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            Click any category to open deep dossier
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        {/* Clickable Progress Bars (Left) */}
        <div className="sm:col-span-7 space-y-3.5">
          {activeItems.map((cat) => {
            const color = getCategoryColor(cat.category);
            const label = getCategoryLabel(cat.category);

            return (
              <div
                key={cat.category}
                onClick={() =>
                  onCategoryClick && onCategoryClick(cat.category.toLowerCase() as ActivityCategory)
                }
                className="space-y-1.5 p-2 -mx-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                title={`Open ${label} dossier`}
              >
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="flex items-center gap-2 text-neutral-300 group-hover:text-white transition-colors">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium">{label}</span>
                  </span>
                  <span className="font-mono text-neutral-400 flex items-center gap-2">
                    <span className="text-white font-medium">{cat.count}</span>
                    <span className="text-neutral-500">({cat.percentage}%)</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF7138]" />
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#181D24] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Recharts Donut Pie Chart (Right) */}
        <div className="sm:col-span-5 h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeItems}
                innerRadius={52}
                outerRadius={72}
                paddingAngle={3}
                dataKey="count"
              >
                {activeItems.map((entry) => (
                  <Cell
                    key={`cell-${entry.category}`}
                    fill={getCategoryColor(entry.category)}
                    className="cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={() =>
                      onCategoryClick &&
                      onCategoryClick(entry.category.toLowerCase() as ActivityCategory)
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as CategoryDistributionItem;
                    return (
                      <div className="px-3 py-2 rounded-xl bg-[#13161A] border border-[#232830] text-xs font-mono text-white shadow-xl">
                        <span className="font-semibold" style={{ color: getCategoryColor(data.category) }}>
                          {getCategoryLabel(data.category)}:
                        </span>{' '}
                        {data.count} entries ({data.percentage}%)
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Meaningful Total in Center of Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
              Total
            </span>
            <span className="text-base font-mono font-bold text-white tracking-tight">
              {totalEntries}
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              entries
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
