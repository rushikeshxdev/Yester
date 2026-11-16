import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { generateCalendarGrid } from '../../services/calendarService';
import {
  WEEKDAY_SHORT_MONDAY_FIRST,
  WEEKDAY_SHORT_SUNDAY_FIRST,
  getMonthName,
  getPreviousMonth,
  getNextMonth,
  formatDateKey,
} from '../../utils/dateUtils';
import { Button } from '../common/Button';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

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
    navigateToJournal,
    preferences,
  } = useLifeOS();

  const grid = generateCalendarGrid(year, month, selectedDate, records);
  const monthName = getMonthName(month);

  // Determine weekday headers based on user preferences (1 = Monday, 0 = Sunday)
  const isMondayFirst = preferences?.firstDayOfWeek === 1;
  const weekdayHeaders = isMondayFirst
    ? WEEKDAY_SHORT_MONDAY_FIRST
    : WEEKDAY_SHORT_SUNDAY_FIRST;

  const handlePrevMonth = () => {
    const prev = getPreviousMonth(year, month);
    selectMonth(prev.month);
  };

  const handleNextMonth = () => {
    const next = getNextMonth(year, month);
    selectMonth(next.month);
  };

  // Month Statistics Calculations
  const monthStats = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    let recordedDaysCount = 0;
    let workCount = 0;
    let fitnessCount = 0;
    let learningCount = 0;
    let personalCount = 0;
    let projectCount = 0;
    let healthCount = 0;

    const sparklineData: { day: number; count: number; dateKey: string }[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = formatDateKey(year, month, d);
      const record = records[dateKey];
      let dayEntries = 0;

      if (record) {
        const w = record.work?.length || 0;
        const f = record.fitness?.length || 0;
        const l = record.learning?.length || 0;
        const p = record.personal?.length || 0;
        const pr = record.projects?.length || 0;
        const h = record.health ? 1 : 0;
        const ref = record.reflection?.freeformNotes ? 1 : 0;

        dayEntries = w + f + l + p + pr + h + ref;
        if (dayEntries > 0) {
          recordedDaysCount++;
        }

        workCount += w;
        fitnessCount += f;
        learningCount += l;
        personalCount += p;
        projectCount += pr;
        healthCount += h;
      }

      sparklineData.push({ day: d, count: dayEntries, dateKey });
    }

    const totalCategoryEntries =
      workCount + fitnessCount + learningCount + personalCount + projectCount + healthCount || 1;

    const completionRate = Math.round((recordedDaysCount / daysInMonth) * 100);

    return {
      daysInMonth,
      recordedDaysCount,
      completionRate,
      workPct: Math.round((workCount / totalCategoryEntries) * 100),
      fitnessPct: Math.round((fitnessCount / totalCategoryEntries) * 100),
      learningPct: Math.round((learningCount / totalCategoryEntries) * 100),
      personalPct: Math.round((personalCount / totalCategoryEntries) * 100),
      projectPct: Math.round((projectCount / totalCategoryEntries) * 100),
      healthPct: Math.round((healthCount / totalCategoryEntries) * 100),
      sparklineData,
    };
  }, [year, month, records]);

  // Selected date details
  const selectedRecord = records[selectedDate];
  const selectedDateObj = useMemo(() => new Date(`${selectedDate}T00:00:00`), [selectedDate]);
  const formattedSelectedHeader = useMemo(() => {
    return selectedDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedDateObj]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 select-none">
      {/* Month Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1E2229] dark:border-[#1E2229] light:border-neutral-200">
        <div className="flex items-center gap-4">
          {/* Previous Month Chevron */}
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black hover:bg-[#14171C] dark:hover:bg-[#14171C] light:hover:bg-neutral-100 transition-colors"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Month & Year Title */}
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-white dark:text-white light:text-neutral-900">
              {monthName} {year}
            </h1>
          </div>

          {/* Next Month Chevron */}
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black hover:bg-[#14171C] dark:hover:bg-[#14171C] light:hover:bg-neutral-100 transition-colors"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={goToToday}
            icon={<CalendarIcon className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Today
          </Button>
          <button
            onClick={() => openQuickCapture(undefined, selectedDate)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF7138] hover:bg-[#FF8352] text-white text-xs font-medium tracking-wide shadow-orange-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Quick Capture</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Calendar Grid (Left) + Overview/Date Preview Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Calendar Grid */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Weekday Column Headers */}
          <div className="grid grid-cols-7 gap-2 text-center pb-2">
            {weekdayHeaders.map((weekday, idx) => (
              <span
                key={weekday}
                className={`text-[11px] font-mono uppercase tracking-wider font-semibold ${
                  idx >= 5
                    ? 'text-neutral-500 dark:text-neutral-500 light:text-neutral-400'
                    : 'text-neutral-400 dark:text-neutral-400 light:text-neutral-600'
                }`}
              >
                {weekday}
              </span>
            ))}
          </div>

          {/* Calendar Day Cells */}
          <div className="grid grid-cols-7 gap-2">
            {grid.map((cell) => {
              const isSelected = cell.date === selectedDate;
              const hasActivity = cell.totalEntries > 0;

              return (
                <div
                  key={cell.date}
                  onClick={() => selectDate(cell.date)}
                  onDoubleClick={() => navigateToJournal(cell.date)}
                  className={`group relative min-h-[92px] sm:min-h-[105px] p-2 sm:p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between select-none ${
                    !cell.isCurrentMonth
                      ? 'opacity-25 bg-[#0A0C0E]/40 dark:bg-[#0A0C0E]/40 light:bg-neutral-100/40 border-[#181B20] dark:border-[#181B20] light:border-neutral-200/50 hover:opacity-50'
                      : isSelected
                      ? 'bg-[#15191E] dark:bg-[#15191E] light:bg-neutral-100 border-[#FF7138] ring-1 ring-[#FF7138]/40 shadow-lg'
                      : cell.isToday
                      ? 'bg-[#111418] dark:bg-[#111418] light:bg-white border-neutral-600 dark:border-neutral-600 light:border-neutral-400'
                      : 'bg-[#0E1114] dark:bg-[#0E1114] light:bg-white hover:bg-[#14181E] dark:hover:bg-[#14181E] light:hover:bg-neutral-50 border-[#1B1F26] dark:border-[#1B1F26] light:border-neutral-200 hover:border-neutral-600 dark:hover:border-neutral-600 light:hover:border-neutral-300'
                  }`}
                >
                  {/* Top row: day number badge */}
                  <div className="flex items-center justify-between">
                    {/* Date Number Indicator */}
                    <div
                      className={`text-xs sm:text-sm font-sans flex items-center justify-center transition-all ${
                        isSelected
                          ? 'w-7 h-7 rounded-full bg-[#FF7138] text-white font-semibold shadow-orange-sm'
                          : cell.isToday
                          ? 'w-7 h-7 rounded-full border border-neutral-400 dark:border-neutral-400 light:border-neutral-600 text-white dark:text-white light:text-neutral-900 font-medium'
                          : cell.isCurrentMonth
                          ? 'text-neutral-200 dark:text-neutral-200 light:text-neutral-800'
                          : 'text-neutral-500'
                      }`}
                    >
                      {cell.dayNumber}
                    </div>

                    {/* Entry Count Pip */}
                    {hasActivity && (
                      <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-500">
                        {cell.totalEntries}
                      </span>
                    )}
                  </div>

                  {/* Day Content Summary (if any) */}
                  <div className="my-auto py-1">
                    {cell.record?.summary ? (
                      <p className="text-[10px] font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600 line-clamp-1 leading-tight">
                        {cell.record.summary}
                      </p>
                    ) : cell.record?.reflection?.freeformNotes ? (
                      <p className="text-[10px] font-serif italic text-neutral-400 dark:text-neutral-400 light:text-neutral-600 line-clamp-1 leading-tight">
                        {cell.record.reflection.freeformNotes}
                      </p>
                    ) : null}
                  </div>

                  {/* Bottom: Activity Dot Indicators */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#181C22] dark:border-[#181C22] light:border-neutral-100">
                    <div className="flex items-center gap-1">
                      {cell.hasWork && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#FF7138]"
                          title="Work"
                        />
                      )}
                      {cell.hasFitness && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#4A72B2]"
                          title="Fitness"
                        />
                      )}
                      {cell.hasLearning && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#3FB950]"
                          title="Learning"
                        />
                      )}
                      {cell.hasPersonal && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#E5A84B]"
                          title="Personal"
                        />
                      )}
                      {cell.hasProject && (
                        <span
                          className="w-1.5 h-1.5 rounded-full bg-[#A371F7]"
                          title="Projects"
                        />
                      )}
                    </div>

                    <span className="opacity-0 group-hover:opacity-100 text-[10px] text-neutral-400 transition-opacity">
                      &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Footnote / Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-xs text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF7138]" />
                Work
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#4A72B2]" />
                Fitness
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
                Learning
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E5A84B]" />
                Personal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A371F7]" />
                Projects
              </span>
            </div>

            <span className="italic font-serif text-[11px] text-neutral-500">
              Double-click any day to open full journal
            </span>
          </div>
        </div>

        {/* Right Column: Month Overview / Date Preview Panel (Concept Panel 3) */}
        <div className="lg:col-span-4 sticky top-24 space-y-5">
          <div className="p-6 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-neutral-50 border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-xl space-y-6">
            {/* Header: Month Overview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xl font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
                  {monthName} Overview
                </h2>
                <span className="text-xs font-mono font-medium text-[#FF7138]">
                  {monthStats.completionRate}%
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-500">
                {monthStats.recordedDaysCount} days recorded
              </p>

              {/* Progress Bar */}
              <div className="w-full h-1.5 rounded-full bg-[#1A1F26] mt-3 overflow-hidden">
                <div
                  className="h-full bg-[#FF7138] rounded-full transition-all duration-500"
                  style={{ width: `${monthStats.completionRate}%` }}
                />
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="space-y-2.5 pt-2 border-t border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                  <span className="w-2 h-2 rounded-full bg-[#FF7138]" />
                  Work
                </span>
                <span className="font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
                  {monthStats.workPct}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                  <span className="w-2 h-2 rounded-full bg-[#4A72B2]" />
                  Fitness
                </span>
                <span className="font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
                  {monthStats.fitnessPct}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                  <span className="w-2 h-2 rounded-full bg-[#3FB950]" />
                  Learning
                </span>
                <span className="font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
                  {monthStats.learningPct}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-neutral-300 dark:text-neutral-300 light:text-neutral-700">
                  <span className="w-2 h-2 rounded-full bg-[#E5A84B]" />
                  Personal
                </span>
                <span className="font-mono text-neutral-400 dark:text-neutral-400 light:text-neutral-600">
                  {monthStats.personalPct}%
                </span>
              </div>
            </div>

            {/* Mini Trendline / Sparkline Chart */}
            <div className="pt-2 border-t border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                  Monthly Cadence
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  30-day activity
                </span>
              </div>
              <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={monthStats.sparklineData}
                    margin={{ top: 4, right: 2, left: 2, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="monthSparkline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7138" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#FF7138" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="px-2 py-1 rounded bg-[#13161A] border border-[#232830] text-[10px] font-mono text-white shadow-md">
                              Day {data.day}: {data.count} entries
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#FF7138"
                      strokeWidth={1.8}
                      fillOpacity={1}
                      fill="url(#monthSparkline)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Selected Date Snapshot Card */}
            <div className="p-4 rounded-xl bg-[#14181F] dark:bg-[#14181F] light:bg-white border border-[#222731] dark:border-[#222731] light:border-neutral-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#FF7138] font-semibold">
                    Selected Date
                  </span>
                  <h4 className="text-sm font-sans font-medium text-white dark:text-white light:text-neutral-900 mt-0.5">
                    {formattedSelectedHeader}
                  </h4>
                </div>
                {selectedRecord && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF7138]/20 text-[#FF7138]">
                    Recorded
                  </span>
                )}
              </div>

              {selectedRecord?.summary ? (
                <p className="text-xs font-serif italic text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-snug line-clamp-2">
                  &ldquo;{selectedRecord.summary}&rdquo;
                </p>
              ) : selectedRecord?.reflection?.freeformNotes ? (
                <p className="text-xs font-serif italic text-neutral-300 dark:text-neutral-300 light:text-neutral-700 leading-snug line-clamp-2">
                  &ldquo;{selectedRecord.reflection.freeformNotes}&rdquo;
                </p>
              ) : (
                <p className="text-xs font-sans text-neutral-500 italic">
                  No records yet for this date.
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => navigateToJournal(selectedDate)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FF7138] hover:bg-[#FF8352] text-white text-xs font-medium tracking-wide shadow-orange-sm hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Journal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
