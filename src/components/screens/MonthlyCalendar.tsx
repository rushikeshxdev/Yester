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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-[#222222]">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">
              TIME FIRST &bull; {year}
            </span>
            <h1 className="text-3xl sm:text-4xl font-mono font-bold tracking-tight text-neutral-900 dark:text-white">
              {monthName.toUpperCase()}
            </h1>
          </div>

          <div className="flex items-center gap-1 border border-neutral-200 dark:border-[#292929] rounded-md p-0.5 bg-neutral-100 dark:bg-[#141414]">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-[#1F1F1F] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white rounded hover:bg-neutral-200 dark:hover:bg-[#1F1F1F] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={goToToday}
            icon={<CalendarIcon className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Today
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => openQuickCapture()}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Quick Log
          </Button>
        </div>
      </div>

      {/* Main Workspace: Calendar Left + Analytics Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Calendar (7 or 8 columns on large desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Weekday Headers (Monday-first) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center pb-2 border-b border-neutral-200 dark:border-[#222222]">
            {WEEKDAY_SHORT_MONDAY_FIRST.map((weekday, idx) => (
              <span
                key={weekday}
                className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                  idx >= 5
                    ? 'text-neutral-400 dark:text-neutral-600'
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {weekday}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {grid.map((cell) => {
              const isSelected = cell.date === selectedDate;
              const hasActivity = cell.totalEntries > 0;

              return (
                <div
                  key={cell.date}
                  onClick={() => selectDate(cell.date)}
                  className={`group relative min-h-[90px] sm:min-h-[110px] p-2 sm:p-2.5 rounded-lg border transition-all duration-150 cursor-pointer flex flex-col justify-between select-none ${
                    !cell.isCurrentMonth
                      ? 'opacity-35 bg-neutral-50/50 dark:bg-[#0E0E0E]/50 border-neutral-200/50 dark:border-[#1A1A1A] hover:opacity-75'
                      : isSelected
                      ? 'bg-neutral-100 dark:bg-[#1E1E1E] border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white shadow-md'
                      : cell.isToday
                      ? 'bg-neutral-50 dark:bg-[#161616] border-neutral-400 dark:border-neutral-500 shadow-sm'
                      : 'bg-white dark:bg-[#141414] hover:bg-neutral-50 dark:hover:bg-[#181818] border-neutral-200 dark:border-[#242424] hover:border-neutral-400 dark:hover:border-neutral-500 shadow-sm'
                  }`}
                >
                  {/* Top row in day cell: day number and today indicator */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs sm:text-sm font-mono font-semibold ${
                        cell.isToday
                          ? 'underline decoration-2 underline-offset-4 text-neutral-900 dark:text-white font-bold'
                          : cell.isCurrentMonth
                          ? 'text-neutral-800 dark:text-neutral-200'
                          : 'text-neutral-400 dark:text-neutral-600'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {cell.isToday && (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-medium">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Middle: Activity summary snippet if exists */}
                  <div className="my-auto py-1">
                    {hasActivity && cell.record?.summary ? (
                      <p className="text-[10px] font-mono text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-tight">
                        {cell.record.summary}
                      </p>
                    ) : null}
                  </div>

                  {/* Bottom: Subtle activity indicators reflecting real records */}
                  <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-[#1C1C1C]">
                    <div className="flex items-center gap-1">
                      {cell.hasWork && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-200"
                          title="Work logged"
                        />
                      )}
                      {cell.hasFitness && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-neutral-700 dark:bg-neutral-400"
                          title="Fitness logged"
                        />
                      )}
                      {cell.hasLearning && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-500"
                          title="Learning logged"
                        />
                      )}
                      {cell.hasProject && (
                        <span
                          className="w-1.5 h-1.5 rounded-full border border-neutral-900 dark:border-neutral-300"
                          title="Project logged"
                        />
                      )}
                      {cell.hasPersonal && (
                        <span
                          className="w-1.5 h-1.5 rounded-sm bg-neutral-600 dark:bg-neutral-400"
                          title="Personal logged"
                        />
                      )}
                      {cell.hasHealth && (
                        <span
                          className="w-1 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600"
                          title="Health logged"
                        />
                      )}
                    </div>

                    {hasActivity ? (
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-medium">
                        {cell.totalEntries}&times;
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-neutral-400 transition-opacity">
                        +
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Footer Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-[11px] font-mono text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-[#222222]">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-900 dark:bg-neutral-200" />
                Work
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 dark:bg-neutral-400" />
                Fitness
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 dark:bg-neutral-500" />
                Learning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full border border-neutral-900 dark:border-neutral-300" />
                Projects
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-sm bg-neutral-600 dark:bg-neutral-400" />
                Personal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600" />
                Health
              </span>
            </div>

            <span>Click any day to open daily journal</span>
          </div>
        </div>

        {/* Right Column: Monthly Analytics Panel */}
        <div className="lg:col-span-4 sticky top-20">
          <CategoryAnalyticsPanel />
        </div>
      </div>
    </div>
  );
};
