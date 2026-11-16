import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllMonthsForYear } from '../../services/calendarService';
import { padZero, getDaysInMonth, formatDateKey } from '../../utils/dateUtils';

export const MonthSelector: React.FC = () => {
  const { year, selectMonth, navigateToYears, records } = useLifeOS();
  const { reducedMotion } = useTheme();

  const months = getAllMonthsForYear(year, records);

  const now = new Date();
  const isCurrentYear = now.getFullYear() === year;
  const currentMonthNum = now.getMonth() + 1;

  // Aggregate annual statistics across all 12 months
  const totalActiveDaysYear = months.reduce((acc, m) => acc + m.totalRecordsCount, 0);
  const totalEntriesYear = months.reduce(
    (acc, m) =>
      acc +
      m.categoryCounts.work +
      m.categoryCounts.fitness +
      m.categoryCounts.learning +
      m.categoryCounts.project +
      m.categoryCounts.personal +
      m.categoryCounts.health,
    0
  );

  // Computes a 5-bar sparkline representing the month's chronological recording density
  const getMonthSparkline = (monthNum: number) => {
    const daysInMonth = getDaysInMonth(year, monthNum);
    const binCount = 5;
    const binSize = Math.ceil(daysInMonth / binCount);
    const bins = [0, 0, 0, 0, 0];

    for (let d = 1; d <= daysInMonth; d++) {
      const key = formatDateKey(year, monthNum, d);
      const rec = records[key];
      if (
        rec &&
        (rec.work.length > 0 ||
          rec.fitness.length > 0 ||
          rec.learning.length > 0 ||
          rec.projects.length > 0 ||
          rec.personal.length > 0 ||
          !!rec.health ||
          !!rec.reflection)
      ) {
        const binIdx = Math.min(Math.floor((d - 1) / binSize), binCount - 1);
        bins[binIdx]++;
      }
    }

    const maxBin = Math.max(...bins, 1);
    return bins.map((val) => ({
      val,
      heightPct: val > 0 ? Math.max(Math.round((val / maxBin) * 100), 22) : 10,
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
      {/* Editorial Header (Matching Concept Screen 2) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 pb-6 border-b border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200">
        <div>
          <button
            onClick={navigateToYears}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-500 light:hover:text-black mb-3 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Select another year</span>
          </button>

          <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900 leading-none">
            {year}
          </h1>
          <p className="text-sm font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600 mt-2">
            Select a month to explore your journey
          </p>
        </div>

        {/* Annual Snapshot Metrics */}
        <div className="flex items-center gap-6 text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block mb-0.5 tracking-wider">
              Active Days
            </span>
            <span className="text-base font-semibold text-white dark:text-white light:text-neutral-900">
              {totalActiveDaysYear}{' '}
              <span className="text-[11px] font-normal text-neutral-500">/ 365</span>
            </span>
          </div>
          <div className="h-6 w-[1px] bg-[#232934] dark:bg-[#232934] light:bg-neutral-300" />
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block mb-0.5 tracking-wider">
              Total Entries
            </span>
            <span className="text-base font-semibold text-white dark:text-white light:text-neutral-900">
              {totalEntriesYear}
            </span>
          </div>
        </div>
      </div>

      {/* 12-Month Architectural Grid (4 Columns x 3 Rows - Concept Screen 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {months.map((m, index) => {
          const isFocusedMonth = isCurrentYear ? m.month === currentMonthNum : m.month === 6;
          const sparkline = getMonthSparkline(m.month);

          return (
            <motion.div
              key={m.month}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0.05 : 0.2,
                delay: reducedMotion ? 0 : index * 0.012,
              }}
              onClick={() => selectMonth(m.month)}
              className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[148px] select-none ${
                isFocusedMonth
                  ? 'bg-[#12151B] dark:bg-[#12151B] light:bg-white border-[#FF7138] shadow-[0_0_25px_rgba(255,113,56,0.18)]'
                  : 'bg-[#0E1116] dark:bg-[#0E1116] light:bg-white hover:bg-[#13171E] dark:hover:bg-[#13171E] light:hover:bg-neutral-50 border-[#1F2530] dark:border-[#1F2530] light:border-neutral-200 hover:border-[#2D3645] dark:hover:border-[#2D3645] light:hover:border-neutral-300 shadow-sm'
              }`}
            >
              {/* Card Header: Month Number (01, 02, etc.) */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-medium tracking-wider ${
                    isFocusedMonth
                      ? 'text-[#FF7138]'
                      : 'text-neutral-500 dark:text-neutral-500 light:text-neutral-400'
                  }`}
                >
                  {padZero(m.month)}
                </span>

                {isFocusedMonth && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF7138] animate-pulse" />
                )}
              </div>

              {/* Month Name */}
              <div className="my-auto pt-2">
                <h2 className="text-xl sm:text-2xl font-serif text-white dark:text-white light:text-neutral-900 group-hover:translate-x-0.5 transition-transform">
                  {m.monthName}
                </h2>
              </div>

              {/* Card Footer: Days Count (Left) + 5-Bar Activity Sparkline (Right) */}
              <div className="flex items-end justify-between pt-3 border-t border-[#181D26] dark:border-[#181D26] light:border-neutral-100">
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-500">
                  {m.totalRecordsCount} {m.totalRecordsCount === 1 ? 'day' : 'days'}
                </span>

                {/* Concept Mini Sparkline Histogram */}
                <div className="flex items-end gap-1 h-5" title={`${m.totalRecordsCount} active days in ${m.monthName}`}>
                  {sparkline.map((bar, barIdx) => (
                    <div
                      key={barIdx}
                      style={{ height: `${bar.heightPct}%` }}
                      className={`w-1 rounded-sm transition-all duration-300 ${
                        isFocusedMonth
                          ? 'bg-[#FF7138]'
                          : bar.val > 0
                          ? 'bg-neutral-400 dark:bg-neutral-500 light:bg-neutral-400 group-hover:bg-[#FF7138]'
                          : 'bg-[#222834] dark:bg-[#222834] light:bg-neutral-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
