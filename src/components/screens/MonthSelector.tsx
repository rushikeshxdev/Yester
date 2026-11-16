import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllMonthsForYear } from '../../services/calendarService';
import { padZero } from '../../utils/dateUtils';
import { Badge } from '../common/Badge';

const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-10">
      {/* Editorial Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-[#E5E5E2]">
        <div>
          <button
            onClick={navigateToYears}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-500 light:hover:text-black mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Select another year</span>
          </button>

          <div className="flex items-baseline gap-3">
            <h1 className="text-5xl sm:text-6xl font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900">
              {year}
            </h1>
            <span className="text-sm font-serif italic text-neutral-400 dark:text-neutral-500 light:text-neutral-500">
              Annual Chronicle
            </span>
          </div>
          <p className="text-xs font-mono text-neutral-500 dark:text-neutral-500 light:text-neutral-500 mt-2">
            Twelve temporal divisions preserving your personal, physical, and intellectual path.
          </p>
        </div>

        {/* Annual Snapshot Metrics */}
        <div className="flex items-center gap-6 text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block mb-0.5">Active Days</span>
            <span className="text-base font-semibold text-white dark:text-white light:text-neutral-900">
              {totalActiveDaysYear} <span className="text-[11px] font-normal text-neutral-500">/ 365</span>
            </span>
          </div>
          <div className="h-6 w-[1px] bg-neutral-800 dark:bg-[#252525] light:bg-neutral-300" />
          <div>
            <span className="text-[10px] uppercase text-neutral-500 block mb-0.5">Total Records</span>
            <span className="text-base font-semibold text-white dark:text-white light:text-neutral-900">
              {totalEntriesYear}
            </span>
          </div>
        </div>
      </div>

      {/* 12-Month Architectural Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {months.map((m, index) => {
          const isThisMonth = isCurrentYear && m.month === currentMonthNum;
          const romanNumeral = ROMAN_NUMERALS[m.month - 1];

          return (
            <motion.div
              key={m.month}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={reducedMotion ? false : { opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0.05 : 0.22,
                delay: reducedMotion ? 0 : index * 0.015,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => selectMonth(m.month)}
              className={`group relative p-6 rounded-lg border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[175px] ${
                isThisMonth
                  ? 'bg-[#101010] dark:bg-[#101010] light:bg-neutral-50 border-neutral-400 dark:border-neutral-500 light:border-neutral-400 shadow-md ring-1 ring-neutral-400/30'
                  : 'bg-[#0B0B0B] dark:bg-[#0B0B0B] light:bg-white hover:bg-[#111111] dark:hover:bg-[#111111] light:hover:bg-neutral-50/80 border-[#1F1F1F] dark:border-[#1F1F1F] light:border-[#E5E5E2] hover:border-neutral-500 dark:hover:border-neutral-500 light:hover:border-neutral-400 shadow-sm'
              }`}
            >
              {/* Top row: Chapter Roman Numeral, Days count, Status */}
              <div className="flex items-center justify-between pb-3 border-b border-[#181818] dark:border-[#181818] light:border-neutral-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold tracking-wider text-neutral-500 dark:text-neutral-500 light:text-neutral-400">
                    PART {romanNumeral}
                  </span>
                  <span className="text-neutral-600 dark:text-neutral-700 light:text-neutral-300">&bull;</span>
                  <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 light:text-neutral-500">
                    #{padZero(m.month)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isThisMonth && (
                    <Badge variant="active" size="sm">
                      Current
                    </Badge>
                  )}
                  <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-neutral-400">
                    {m.daysCount} days
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white dark:group-hover:text-white light:group-hover:text-black transition-colors" />
                </div>
              </div>

              {/* Middle row: Month Name in Editorial Serif */}
              <div className="py-4">
                <h2 className="text-3xl font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900 group-hover:translate-x-1 transition-transform duration-200">
                  {m.monthName}
                </h2>
              </div>

              {/* Bottom row: Real Activity Indicators */}
              <div className="pt-3 border-t border-[#181818] dark:border-[#181818] light:border-neutral-100 flex items-center justify-between text-xs font-mono">
                {m.hasActivity ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-neutral-300 dark:text-neutral-300 light:text-neutral-700 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white light:bg-black animate-pulse" />
                      <span>{m.totalRecordsCount} {m.totalRecordsCount === 1 ? 'day' : 'days'} documented</span>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-neutral-500">
                      {m.categoryCounts.work > 0 && <span title="Work">W:{m.categoryCounts.work}</span>}
                      {m.categoryCounts.fitness > 0 && <span title="Fitness">F:{m.categoryCounts.fitness}</span>}
                      {m.categoryCounts.learning > 0 && <span title="Learning">L:{m.categoryCounts.learning}</span>}
                    </div>
                  </div>
                ) : (
                  <span className="text-neutral-600 dark:text-neutral-600 light:text-neutral-400 text-[11px] italic font-serif">
                    Unwritten chapter
                  </span>
                )}

                <span className="text-neutral-500 dark:text-neutral-500 light:text-neutral-400 text-[11px] group-hover:text-white dark:group-hover:text-white light:group-hover:text-black transition-colors flex items-center gap-1">
                  <span>Explore</span>
                  <span>&rarr;</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
