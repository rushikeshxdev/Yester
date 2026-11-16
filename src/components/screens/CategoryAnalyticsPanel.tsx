import React from 'react';
import {
  Briefcase,
  Dumbbell,
  BookOpen,
  FolderKanban,
  Heart,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllCategoriesMonthlyMetrics } from '../../services/analyticsService';
import { ActivityCategory } from '../../types';

export const CategoryAnalyticsPanel: React.FC = () => {
  const { year, month, records, openCategoryAnalytics } = useLifeOS();
  const { theme } = useTheme();

  const allMetrics = getAllCategoriesMonthlyMetrics(year, month, records);

  const getCategoryIcon = (category: ActivityCategory) => {
    switch (category) {
      case 'work':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'fitness':
        return <Dumbbell className="w-3.5 h-3.5" />;
      case 'learning':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'project':
        return <FolderKanban className="w-3.5 h-3.5" />;
      case 'personal':
        return <Heart className="w-3.5 h-3.5" />;
      case 'health':
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-[#222222]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Monthly Telemetry
          </span>
          <h3 className="text-sm font-mono font-bold text-neutral-900 dark:text-white">
            GROWTH DOMAINS
          </h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500">
          Click domain to inspect
        </span>
      </div>

      {/* Grid of 6 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {allMetrics.map((metric) => {
          const hasData = metric.activeDaysCount > 0;

          return (
            <div
              key={metric.category}
              onClick={() => openCategoryAnalytics(metric.category)}
              className="group p-3.5 rounded-lg border border-neutral-200 dark:border-[#242424] bg-white dark:bg-[#141414] hover:bg-neutral-50 dark:hover:bg-[#191919] hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer flex flex-col justify-between gap-2.5 shadow-sm"
            >
              {/* Card Title & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-neutral-100 dark:bg-[#1F1F1F] text-neutral-700 dark:text-neutral-300">
                    {getCategoryIcon(metric.category)}
                  </div>
                  <span className="text-xs font-mono font-semibold text-neutral-900 dark:text-white group-hover:translate-x-0.5 transition-transform">
                    {metric.categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  <span>Details</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>

              {/* Stats Triplet */}
              <div className="grid grid-cols-3 gap-2 py-1 text-center border-t border-b border-neutral-100 dark:border-[#1C1C1C]">
                <div>
                  <div className="text-[10px] font-mono text-neutral-500 truncate">
                    {metric.metric1.label}
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                    {hasData ? metric.metric1.value : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-neutral-500 truncate">
                    {metric.metric2.label}
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                    {hasData ? metric.metric2.value : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-neutral-500 truncate">
                    {metric.metric3.label}
                  </div>
                  <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                    {hasData ? metric.metric3.value : '—'}
                  </div>
                </div>
              </div>

              {/* Mini Sparkline / Trend visualization or Empty note */}
              <div className="h-9 w-full flex items-center justify-center">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metric.trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <Bar
                        dataKey="value"
                        fill={theme === 'dark' ? '#E5E5E5' : '#171717'}
                        radius={[1, 1, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-600">
                    No data recorded this month
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
