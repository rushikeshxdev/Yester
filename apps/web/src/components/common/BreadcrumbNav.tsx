import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Plus, Settings, Search, Download, User } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { exportBackupJSON } from '../../services/storage';
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
    navigateToPlans,
    openSettings,
    hasSampleData,
    clearSampleData,
    loadSampleData,
    openQuickCapture,
    records,
  } = useLifeOS();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  const totalRecordedDays = Object.values(records).filter(
    (r) =>
      r &&
      (r.work?.length > 0 ||
        r.fitness?.length > 0 ||
        r.learning?.length > 0 ||
        r.projects?.length > 0 ||
        r.personal?.length > 0 ||
        !!r.health ||
        !!r.reflection)
  ).length;

  // Handle direct JSON export
  const handleExportBackup = () => {
    const jsonString = exportBackupJSON();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yester-chronicle-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsProfileOpen(false);
  };

  // If on the full-screen year selector, render the dedicated minimal immersive bar
  if (screen === 'year') {
    return null;
  }

  // Active navigation tab
  const isCalendarActive = screen === 'calendar' || screen === 'month';
  const isAnalyticsActive = screen === 'analytics';
  const isPlansActive = screen === 'plans' || screen === 'plan-detail';
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
            onClick={navigateToPlans}
            className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors select-none ${
              isPlansActive
                ? 'text-white dark:text-[#F5F4F0] light:text-[#191B20]'
                : 'text-neutral-400 dark:text-[#A2A6AE] light:text-[#626872] hover:text-white dark:hover:text-white light:hover:text-black'
            }`}
          >
            <span>Plans</span>
            {isPlansActive && (
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

          {/* Profile Circle Avatar with Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF7138] to-[#FF8555] flex items-center justify-center text-white font-mono font-bold text-xs select-none shadow-orange-sm cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Yester Chronicle Profile"
              aria-label="Profile Menu"
            >
              Y
            </button>

            {/* Profile Dropdown Popover */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-[#0F1216] dark:bg-[#0F1216] light:bg-white border border-[#232934] dark:border-[#232934] light:border-neutral-200 shadow-2xl p-3 space-y-3 z-50 animate-fade-in select-none">
                <div className="px-2 py-1.5 border-b border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#181D26] flex items-center justify-center text-[#FF7138]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-serif text-white dark:text-white light:text-neutral-900 font-medium">
                        Sovereign Chronicle
                      </h4>
                      <p className="text-[10px] font-mono text-[#FF7138]">
                        {totalRecordedDays} {totalRecordedDays === 1 ? 'day' : 'days'} archived
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      openSettings();
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:text-white hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 transition-colors text-left cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Preferences & Settings</span>
                  </button>

                  <button
                    onClick={handleExportBackup}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-sans text-neutral-300 dark:text-neutral-300 light:text-neutral-700 hover:text-white hover:bg-white/5 dark:hover:bg-white/5 light:hover:bg-black/5 transition-colors text-left cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Export JSON Chronicle</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-100 px-2 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>Local Sovereign Data</span>
                  <span className="text-emerald-400">Offline Ready</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
