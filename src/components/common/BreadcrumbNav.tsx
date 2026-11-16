import React from 'react';
import { Sparkles, Plus, Settings, Search } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './Button';

export const BreadcrumbNav: React.FC = () => {
  const {
    screen,
    navigateToYears,
    navigateToCalendar,
    navigateToAnalytics,
    navigateToJournal,
    navigateToSearch,
    openSettings,
    hasSampleData,
    clearSampleData,
    loadSampleData,
    openQuickCapture,
  } = useLifeOS();

  // If on the full-screen year selector, render the dedicated minimal immersive bar
  if (screen === 'year') {
    return null;
  }

  // Active navigation tab
  const isCalendarActive = screen === 'calendar' || screen === 'month';
  const isAnalyticsActive = screen === 'analytics';
  const isJournalActive = screen === 'daily';
  const isSearchActive = screen === 'search';

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#090A0C]/90 dark:bg-[#090A0C]/90 light:bg-[#F5F4F0]/90 border-b border-[#242930] dark:border-[#242930] light:border-[#E5E3DC] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={navigateToYears}
            className="flex items-baseline gap-0.5 group focus:outline-none"
            title="Yester &bull; Life Archive"
          >
            <span className="text-xl font-serif italic font-normal tracking-wide text-white dark:text-[#F5F4F0] light:text-[#191B20] group-hover:opacity-80 transition-opacity">
              Yester
            </span>
            <span className="text-lg font-serif font-bold text-[#FF7138] dark:text-[#FF7138] light:text-[#E95D2B]">
              .
            </span>
          </button>
        </div>

        {/* Center: Global Navigation Tabs with Active Orange Underline */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={navigateToCalendar}
            className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors select-none ${
              isCalendarActive
                ? 'text-white dark:text-[#F5F4F0] light:text-[#191B20]'
                : 'text-neutral-400 dark:text-[#A2A6AE] light:text-[#626872] hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
          >
            <span>Calendar</span>
            {isCalendarActive && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF7138] dark:bg-[#FF7138] light:bg-[#E95D2B] rounded-full" />
            )}
          </button>

          <button
            onClick={navigateToAnalytics}
            className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors select-none ${
              isAnalyticsActive
                ? 'text-white dark:text-[#F5F4F0] light:text-[#191B20]'
                : 'text-neutral-400 dark:text-[#A2A6AE] light:text-[#626872] hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
          >
            <span>Analytics</span>
            {isAnalyticsActive && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF7138] dark:bg-[#FF7138] light:bg-[#E95D2B] rounded-full" />
            )}
          </button>

          <button
            onClick={() => navigateToJournal()}
            className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors select-none ${
              isJournalActive
                ? 'text-white dark:text-[#F5F4F0] light:text-[#191B20]'
                : 'text-neutral-400 dark:text-[#A2A6AE] light:text-[#626872] hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
          >
            <span>Journal</span>
            {isJournalActive && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF7138] dark:bg-[#FF7138] light:bg-[#E95D2B] rounded-full" />
            )}
          </button>

          <button
            onClick={navigateToSearch}
            className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors select-none ${
              isSearchActive
                ? 'text-white dark:text-[#F5F4F0] light:text-[#191B20]'
                : 'text-neutral-400 dark:text-[#A2A6AE] light:text-[#626872] hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
          >
            <span>Search</span>
            {isSearchActive && (
              <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#FF7138] dark:bg-[#FF7138] light:bg-[#E95D2B] rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Actions, Search, Quick Capture, Settings, Theme, Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Sample Data Toggle Badge */}
          {hasSampleData ? (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#242930] dark:border-[#242930] light:border-[#E5E3DC] bg-[#13161A] dark:bg-[#13161A] light:bg-[#FFFFFF]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF7138]" />
              <span className="text-[10px] font-mono text-neutral-400">Sample Active</span>
              <button
                onClick={clearSampleData}
                className="text-[9px] uppercase font-mono ml-1 text-neutral-500 hover:text-red-400 underline transition-colors"
                title="Clear sample data"
              >
                Clear
              </button>
            </div>
          ) : (
            <button
              onClick={loadSampleData}
              className="hidden xl:flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black transition-colors"
              title="Load demo journal records"
            >
              <Sparkles className="w-3 h-3 text-[#FF7138]" />
              <span>Load Sample</span>
            </button>
          )}

          {/* Quick Capture button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => openQuickCapture()}
            icon={<Plus className="w-3.5 h-3.5 text-[#FF7138]" />}
            className="hidden md:inline-flex text-xs font-mono uppercase tracking-wider"
          >
            Capture
          </Button>

          {/* Search Shortcut Icon */}
          <button
            onClick={navigateToSearch}
            className="p-1.5 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black rounded-md hover:bg-[#191D23] dark:hover:bg-[#191D23] light:hover:bg-neutral-200 transition-colors"
            title="Search memories (Press ⌘K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Settings Trigger Icon */}
          <button
            onClick={openSettings}
            className="p-1.5 text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black rounded-md hover:bg-[#191D23] dark:hover:bg-[#191D23] light:hover:bg-neutral-200 transition-colors"
            title="Settings & Preferences"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Profile Circle Avatar */}
          <div
            className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7138] to-[#FF8555] flex items-center justify-center text-black font-mono font-bold text-xs select-none shadow-orange-sm cursor-pointer"
            title="Sovereign Life Archive"
          >
            Y
          </div>
        </div>
      </div>
    </header>
  );
};
