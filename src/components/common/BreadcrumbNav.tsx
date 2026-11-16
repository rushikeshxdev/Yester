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
    return null; // Full-screen immersive experience on year selector
  }

  const { monthName } = formatDisplayDate(selectedDate);

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#070707]/90 dark:bg-[#070707]/90 light:bg-[#FCFCFC]/90 border-b border-[#1E1E1E] dark:border-[#1E1E1E] light:border-[#E5E5E2] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand + Breadcrumbs */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {/* Back Action */}
          {screen === 'daily' && (
            <button
              onClick={navigateToCalendar}
              className="p-1.5 -ml-1 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors flex items-center gap-1 text-[11px] font-mono"
              title="Return to Calendar"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
          )}

          {screen === 'calendar' && (
            <button
              onClick={navigateToMonths}
              className="p-1.5 -ml-1 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors flex items-center gap-1 text-[11px] font-mono"
              title="Return to Months"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Months</span>
            </button>
          )}

          {screen === 'month' && (
            <button
              onClick={navigateToYears}
              className="p-1.5 -ml-1 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black rounded hover:bg-neutral-900 dark:hover:bg-[#161616] light:hover:bg-neutral-100 transition-colors flex items-center gap-1 text-[11px] font-mono"
              title="Return to Year Selector"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Years</span>
            </button>
          )}

          <div className="h-3.5 w-[1px] bg-neutral-800 dark:bg-[#252525] light:bg-neutral-300 mx-1" />

          {/* Root Brand: YESTER */}
          <button
            onClick={navigateToYears}
            className="flex items-baseline gap-1.5 group transition-opacity"
            title="Yester — Home"
          >
            <span className="text-sm font-serif italic tracking-wide font-normal text-white dark:text-white light:text-black group-hover:opacity-70 transition-opacity">
              Yester
            </span>
          </button>

          <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />

          {/* Year Crumb */}
          <button
            onClick={navigateToYears}
            className={`text-xs font-mono transition-colors ${
              screen === 'month'
                ? 'text-white dark:text-white light:text-black font-semibold'
                : 'text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-500 light:hover:text-black'
            }`}
          >
            {year}
          </button>

          {/* Month Crumb */}
          {(screen === 'calendar' || screen === 'daily') && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />
              <button
                onClick={navigateToMonths}
                className={`text-xs font-mono uppercase tracking-wider transition-colors ${
                  screen === 'calendar'
                    ? 'text-white dark:text-white light:text-black font-semibold'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-500 light:hover:text-black'
                }`}
              >
                {getMonthName(month)}
              </button>
            </>
          )}

          {/* Day Crumb */}
          {screen === 'daily' && (
            <>
              <ChevronRight className="w-3 h-3 text-neutral-600 shrink-0" />
              <span className="text-xs font-mono text-white dark:text-white light:text-black font-medium tracking-wide">
                {selectedDate.split('-')[2]}&nbsp;{monthName.slice(0, 3).toUpperCase()}
              </span>
            </>
          )}
        </div>

        {/* Right: Actions, Today, Quick Capture, Demo Toggle, Theme */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sample Data Indicator */}
          {hasSampleData ? (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#222222] dark:border-[#222222] light:border-neutral-200 bg-[#121212] dark:bg-[#121212] light:bg-neutral-100">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
              <span className="text-[11px] font-mono text-neutral-400 light:text-neutral-600">Sample Records</span>
              <button
                onClick={clearSampleData}
                className="text-[10px] uppercase font-mono ml-1 text-neutral-500 hover:text-red-400 underline transition-colors"
                title="Clear demonstration records"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={loadSampleData}
              className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-white light:text-neutral-600 light:hover:text-black transition-colors"
              title="Load demo journal entries"
            >
              <Sparkles className="w-3 h-3" />
              <span>Load Sample</span>
            </button>
          )}

          {/* Quick Capture button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openQuickCapture()}
            icon={<Plus className="w-3 h-3" />}
            className="hidden sm:inline-flex text-[11px] font-mono uppercase tracking-wider"
          >
            Capture
          </Button>

          {/* Today Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={goToToday}
            icon={<Calendar className="w-3 h-3" />}
            className="text-[11px] font-mono"
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
