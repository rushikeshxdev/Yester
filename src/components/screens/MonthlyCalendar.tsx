import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { generateCalendarGrid } from '../../services/calendarService';
import {
  WEEKDAY_SHORT_MONDAY_FIRST,
  getMonthName,
  getPreviousMonth,
  getNextMonth,
} from '../../utils/dateUtils';
import { CategoryAnalyticsPanel } from './CategoryAnalyticsPanel';
import { Button } from '../common/Button';

export const MonthlyCalendar: React.FC = () => {
  const {
    year,
    month,
    selectedDate,
    selectMonth,
    selectDate,
    goToToday,
    records,
    openQuickCapture,
  } = useLifeOS();

  const grid = generateCalendarGrid(year, month, selectedDate, records);
  const monthName = getMonthName(month);

  const handlePrevMonth = () => {
    const prev = getPreviousMonth(year, month);
    selectMonth(prev.month);
  };

  const handleNextMonth = () => {
    const next = getNextMonth(year, month);
    selectMonth(next.month);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
        <div className="flex items-center gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                TEMPORAL CANVASES &bull; {year}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900">
              {monthName}
            </h1>
          </div>

          {/* Month Switcher */}
          <div className="flex items-center gap-1 border border-[#222222] dark:border-[#222222] light:border-neutral-300 rounded-md p-0.5 bg-[#121212] dark:bg-[#121212] light:bg-neutral-100">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black rounded hover:bg-[#1D1D1D] dark:hover:bg-[#1D1D1D] light:hover:bg-neutral-200 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black rounded hover:bg-[#1D1D1D] dark:hover:bg-[#1D1D1D] light:hover:bg-neutral-200 transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={goToToday}
            icon={<CalendarIcon className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Jump to Today
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => openQuickCapture()}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-mono uppercase tracking-wider"
          >
            Quick Capture
          </Button>
        </div>
      </div>

      {/* Main Workspace: Calendar Grid Left + Growth Ledger Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Weekday Headers (Monday-first) */}
          <div className="grid grid-cols-7 gap-2 text-center pb-2 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
            {WEEKDAY_SHORT_MONDAY_FIRST.map((weekday, idx) => (
              <span
                key={weekday}
                className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                  idx >= 5
                    ? 'text-neutral-600 dark:text-neutral-600 light:text-neutral-400'
                    : 'text-neutral-400 dark:text-neutral-400 light:text-neutral-600'
                }`}
              >
                {weekday}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 gap-2">
            {grid.map((cell) => {
              const isSelected = cell.date === selectedDate;
              const hasActivity = cell.totalEntries > 0;

              return (
                <div
                  key={cell.date}
                  onClick={() => selectDate(cell.date)}
                  className={`group relative min-h-[96px] sm:min-h-[114px] p-2 sm:p-2.5 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col justify-between select-none ${
                    !cell.isCurrentMonth
                      ? 'opacity-25 bg-[#0A0A0A]/40 dark:bg-[#0A0A0A]/40 light:bg-neutral-100/40 border-[#1A1A1A] dark:border-[#1A1A1A] light:border-neutral-200/50 hover:opacity-60'
                      : isSelected
                      ? 'bg-[#151515] dark:bg-[#151515] light:bg-neutral-100 border-white dark:border-white light:border-black ring-1 ring-white/50 dark:ring-white/50 light:ring-black/50 shadow-md'
                      : cell.isToday
                      ? 'bg-[#0E0E0E] dark:bg-[#0E0E0E] light:bg-neutral-50 border-neutral-500 dark:border-neutral-500 light:border-neutral-400 shadow-sm'
                      : 'bg-[#0A0A0A] dark:bg-[#0A0A0A] light:bg-white hover:bg-[#111111] dark:hover:bg-[#111111] light:hover:bg-neutral-50 border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200 hover:border-neutral-500 dark:hover:border-neutral-600 light:hover:border-neutral-400 shadow-sm'
                  }`}
                >
                  {/* Top row in day cell: day number and today indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-mono font-medium ${
                        cell.isToday
                          ? 'underline decoration-1 underline-offset-4 text-white dark:text-white light:text-black font-bold'
                          : cell.isCurrentMonth
                          ? 'text-neutral-200 dark:text-neutral-200 light:text-neutral-800'
                          : 'text-neutral-600 dark:text-neutral-600 light:text-neutral-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.isToday && (
                      <span className="text-[8px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-semibold px-1 py-0.2 rounded bg-neutral-800/60 dark:bg-neutral-800/60 light:bg-neutral-200">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Middle: Activity summary snippet if exists */}
                  <div className="my-auto py-1">
                    {hasActivity && cell.record?.summary ? (
                      <p className="text-[10px] font-serif italic text-neutral-400 dark:text-neutral-400 light:text-neutral-600 line-clamp-2 leading-tight">
                        {cell.record.summary}
                      </p>
                    ) : null}
                  </div>

                  {/* Bottom: Subtle activity indicators reflecting real records */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#181818] dark:border-[#181818] light:border-neutral-100">
                    <div className="flex items-center gap-1">
                      {cell.hasWork && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white light:bg-black"
                          title="Work documented"
                        />
                      )}
                      {cell.hasFitness && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-400 light:bg-neutral-600"
                          title="Fitness documented"
                        />
                      )}
                      {cell.hasLearning && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-500 light:bg-neutral-500"
                          title="Learning documented"
                        />
                      )}
                      {cell.hasProject && (
                        <span
                          className="w-1.5 h-1.5 rounded-full border border-neutral-300 dark:border-neutral-300 light:border-neutral-700"
                          title="Project milestone"
                        />
                      )}
                      {cell.hasPersonal && (
                        <span
                          className="w-1.5 h-1.5 rounded-sm bg-neutral-400 dark:bg-neutral-400 light:bg-neutral-600"
                          title="Personal life moment"
                        />
                      )}
                      {cell.hasHealth && (
                        <span
                          className="w-1 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-600 light:bg-neutral-400"
                          title="Health vitals logged"
                        />
                      )}
                    </div>

                    {hasActivity ? (
                      <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-500 font-medium">
                        {cell.totalEntries}&times;
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-neutral-500 transition-opacity">
                        +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Footer Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-[11px] font-mono text-neutral-500 dark:text-neutral-500 light:text-neutral-500 border-t border-[#1E1E1E] dark:border-[#1E1E1E] light:border-neutral-200">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-white light:bg-black" />
                Work
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-400 light:bg-neutral-600" />
                Fitness
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-500 light:bg-neutral-500" />
                Learning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full border border-neutral-300 dark:border-neutral-300 light:border-neutral-700" />
                Projects
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-sm bg-neutral-400 dark:bg-neutral-400 light:bg-neutral-600" />
                Personal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1.5 rounded-full bg-neutral-600 dark:bg-neutral-600 light:bg-neutral-400" />
                Health
              </span>
            </div>

            <span className="italic font-serif">Click any date to open the daily journal</span>
          </div>
        </div>

        {/* Right Column: Growth Ledger Panel */}
        <div className="lg:col-span-4 sticky top-20">
          <CategoryAnalyticsPanel />
        </div>
      </div>
    </div>
  );
};
