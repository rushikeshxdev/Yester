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
    <div className="flex flex-col gap-3.5">
      {/* Panel Header */}
      <div className="flex items-baseline justify-between pb-2.5 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-0.5">
            Telemetry & Progress
          </span>
          <h3 className="text-base font-serif italic font-normal text-white dark:text-white light:text-neutral-900">
            Growth Ledger
          </h3>
        </div>
        <span className="text-[10px] font-mono text-neutral-500">
          Click domain to inspect &rarr;
        </span>
      </div>

      {/* Grid of 6 Refined Domain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {allMetrics.map((metric) => {
          const hasData = metric.activeDaysCount > 0;

          return (
            <div
              key={metric.category}
              onClick={() => openCategoryAnalytics(metric.category)}
              className="group p-3.5 rounded-lg border border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white hover:bg-[#121212] dark:hover:bg-[#121212] light:hover:bg-neutral-50 hover:border-neutral-500 dark:hover:border-neutral-600 light:hover:border-neutral-400 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 shadow-sm"
            >
              {/* Card Title & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded bg-[#161616] dark:bg-[#161616] light:bg-neutral-100 text-neutral-400 dark:text-neutral-300 light:text-neutral-700">
                    {getCategoryIcon(metric.category)}
                  </div>
                  <span className="text-xs font-mono font-medium text-white dark:text-white light:text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                    {metric.categoryLabel}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 group-hover:text-white dark:group-hover:text-white light:group-hover:text-black transition-colors">
                  <span>Dossier</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Stats Triplet */}
              <div className="grid grid-cols-3 gap-2 py-1.5 text-center border-t border-b border-[#181818] dark:border-[#181818] light:border-neutral-100">
                <div>
                  <div className="text-[9px] font-mono uppercase text-neutral-500 truncate">
                    {metric.metric1.label}
                  </div>
                  <div className="text-xs font-mono font-semibold text-white dark:text-white light:text-neutral-900 mt-0.5">
                    {hasData ? metric.metric1.value : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-mono uppercase text-neutral-500 truncate">
                    {metric.metric2.label}
                  </div>
                  <div className="text-xs font-mono font-semibold text-white dark:text-white light:text-neutral-900 mt-0.5">
                    {hasData ? metric.metric2.value : '—'}
                  </div>
                </div>

                <div>
                  <div className="text-[9px] font-mono uppercase text-neutral-500 truncate">
                    {metric.metric3.label}
                  </div>
                  <div className="text-xs font-mono font-semibold text-white dark:text-white light:text-neutral-900 mt-0.5">
                    {hasData ? metric.metric3.value : '—'}
                  </div>
                </div>
              </div>

              {/* Mini Sparkline / Trend visualization or Empty note */}
              <div className="h-8 w-full flex items-center justify-center">
                {hasData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metric.trendData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <Bar
                        dataKey="value"
                        fill={theme === 'dark' ? '#EAEAEA' : '#1A1A1A'}
                        radius={[1, 1, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <span className="text-[10px] font-serif italic text-neutral-600 dark:text-neutral-600 light:text-neutral-400">
                    No entries logged this month
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
