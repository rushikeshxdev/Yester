import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllMonthsForYear } from '../../services/calendarService';
import { padZero } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

export const MonthSelector: React.FC = () => {
  const { year, selectMonth, records } = useLifeOS();
  const { reducedMotion } = useTheme();

  const months = getAllMonthsForYear(year, records);

  const now = new Date();
  const isCurrentYear = now.getFullYear() === year;
  const currentMonthNum = now.getMonth() + 1;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Title & Meta Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-[#222222]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-widest text-neutral-500 dark:text-neutral-400">
              CHRONOLOGY ARCHIVE
            </span>
            <span className="text-neutral-400 dark:text-neutral-600">&bull;</span>
            <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              12 CALENDAR DIVISIONS
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
            {year}
          </h1>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
            Select a month to inspect its calendar grid & telemetry
          </p>
        </div>
      </div>

      {/* 3-Column Responsive Month Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {months.map((m, index) => {
          const isThisMonth = isCurrentYear && m.month === currentMonthNum;

          return (
            <motion.div
              key={m.month}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0.05 : 0.25,
                delay: reducedMotion ? 0 : index * 0.02,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => selectMonth(m.month)}
              className={`group relative p-6 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                isThisMonth
                  ? 'bg-neutral-50 dark:bg-[#161616] border-neutral-400 dark:border-neutral-500 ring-1 ring-neutral-400 dark:ring-neutral-500 shadow-sm'
                  : 'bg-white dark:bg-[#141414] hover:bg-neutral-50 dark:hover:bg-[#191919] border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-neutral-600 shadow-sm'
              }`}
            >
              {/* Top row: Month Number & Days count & Current Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500 font-semibold tracking-wider">
                  #{padZero(m.month)}
                </span>

                <div className="flex items-center gap-2">
                  {isThisMonth && (
                    <Badge variant="active" size="sm">
                      Current
                    </Badge>
                  )}
                  <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                    {m.daysCount} days
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Middle row: Month Name */}
              <div className="my-auto">
                <h2 className="text-2xl font-mono font-bold tracking-tight text-neutral-900 dark:text-white group-hover:translate-x-0.5 transition-transform">
                  {m.monthName}
                </h2>
              </div>

              {/* Bottom row: Real Activity Indicators */}
              <div className="pt-4 mt-2 border-t border-neutral-100 dark:border-[#1F1F1F] flex items-center justify-between text-xs font-mono">
                {m.hasActivity ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
                      <span>{m.totalRecordsCount} days active</span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                      {m.categoryCounts.work > 0 && <span>W:{m.categoryCounts.work}</span>}
                      {m.categoryCounts.fitness > 0 && <span>F:{m.categoryCounts.fitness}</span>}
                      {m.categoryCounts.learning > 0 && <span>L:{m.categoryCounts.learning}</span>}
                    </div>
                  </div>
                ) : (
                  <span className="text-neutral-400 dark:text-neutral-600 text-[11px]">
                    No activity recorded
                  </span>
                )}

                <span className="text-neutral-400 dark:text-neutral-600 text-[11px] group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  Open Grid &rarr;
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
