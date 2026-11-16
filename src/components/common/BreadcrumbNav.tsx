import React from 'react';
import { ChevronRight, Calendar, Sparkles, ArrowLeft, Plus } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { getMonthName, formatDisplayDate } from '../../utils/dateUtils';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';

export const BreadcrumbNav: React.FC = () => {
  const {
    screen,
    year,
    month,
    selectedDate,
    navigateToYears,
    navigateToMonths,
    navigateToCalendar,
    goToToday,
    hasSampleData,
    clearSampleData,
    loadSampleData,
    openQuickCapture,
  } = useLifeOS();

  if (screen === 'year') {
    return null; // Full-screen pure experience for year selector
  }

  const { monthName } = formatDisplayDate(selectedDate);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-[#0B0B0B]/85 border-b border-neutral-200 dark:border-[#222222] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Back button when in daily or calendar */}
          {screen === 'daily' && (
            <button
              onClick={navigateToCalendar}
              className="p-1.5 -ml-1 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-1 text-xs font-medium"
              title="Return to Calendar"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          )}

          {screen === 'calendar' && (
            <button
              onClick={navigateToMonths}
              className="p-1.5 -ml-1 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-1 text-xs font-medium"
              title="Return to Months"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Months</span>
            </button>
          )}

          {screen === 'month' && (
            <button
              onClick={navigateToYears}
              className="p-1.5 -ml-1 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white rounded hover:bg-neutral-100 dark:hover:bg-[#1A1A1A] transition-colors flex items-center gap-1 text-xs font-medium"
              title="Return to Year Selector"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Years</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-neutral-300 dark:bg-[#2A2A2A] mx-0.5" />

          {/* Root Brand */}
          <button
            onClick={navigateToYears}
            className="text-xs uppercase font-mono tracking-widest font-bold text-neutral-900 dark:text-white hover:opacity-75 transition-opacity"
          >
            LIFE&nbsp;OS
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />

          {/* Year Crumb */}
          <button
            onClick={navigateToYears}
            className={`text-xs font-mono font-medium transition-colors ${
              screen === 'month'
                ? 'text-neutral-900 dark:text-white font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            {year}
          </button>

          {/* Month Crumb */}
          {(screen === 'calendar' || screen === 'daily') && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <button
                onClick={navigateToMonths}
                className={`text-xs uppercase tracking-wider font-mono font-medium transition-colors ${
                  screen === 'calendar'
                    ? 'text-neutral-900 dark:text-white font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                }`}
              >
                {getMonthName(month)}
              </button>
            </>
          )}

          {/* Day Crumb */}
          {screen === 'daily' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="text-xs font-mono text-neutral-900 dark:text-white font-semibold tracking-wide">
                {selectedDate.split('-')[2]}&nbsp;{monthName.slice(0, 3).toUpperCase()}
              </span>
            </>
          )}
        </div>

        {/* Right: Actions, Today, Quick Capture, Demo Toggle, Theme */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sample Data Indicator */}
          {hasSampleData ? (
            <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded border border-neutral-300 dark:border-[#333333] bg-neutral-100 dark:bg-[#161616]">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
              <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">Sample Data</span>
              <button
                onClick={clearSampleData}
                className="text-[10px] uppercase font-mono ml-1 text-neutral-400 hover:text-red-400 underline transition-colors"
                title="Clear demonstration data"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={loadSampleData}
              className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title="Load demo records"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Demo Data</span>
            </button>
          )}

          {/* Quick Capture button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openQuickCapture()}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="hidden sm:inline-flex text-xs font-mono"
          >
            Capture
          </Button>

          {/* Today Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={goToToday}
            icon={<Calendar className="w-3.5 h-3.5" />}
            className="text-xs font-mono"
          >
            Today
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
