import React, { useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useLifeOS } from './context/LifeOSContext';
import { BreadcrumbNav } from './components/common/BreadcrumbNav';
import { YearSelector } from './components/screens/YearSelector';
import { MonthSelector } from './components/screens/MonthSelector';
import { MonthlyCalendar } from './components/screens/MonthlyCalendar';
import { DailyRecordView } from './components/screens/DailyRecordView';
import { CategoryDetailModal } from './components/screens/CategoryDetailModal';
import { QuickCaptureModal } from './components/quickCapture/QuickCaptureModal';

export const App: React.FC = () => {
  const { screen, openQuickCapture, quickCapture } = useLifeOS();

  // Global keyboard shortcut: 'c' or 'C' to open Quick Capture when not in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'c' &&
        !quickCapture.isOpen &&
        screen !== 'year' &&
        !(
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target as HTMLElement)?.isContentEditable
        )
      ) {
        e.preventDefault();
        openQuickCapture();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, quickCapture.isOpen, openQuickCapture]);

  return (
    <div className="min-h-screen bg-[#070707] dark:bg-[#070707] light:bg-[#FCFCFC] text-white dark:text-white light:text-neutral-900 transition-colors flex flex-col font-sans selection:bg-white selection:text-black">
      {/* TIME FIRST Breadcrumb Header */}
      <BreadcrumbNav />

      {/* Main Temporal Navigation Routing */}
      <main className="flex-1 w-full">
        {screen === 'year' && <YearSelector />}
        {screen === 'month' && <MonthSelector />}
        {screen === 'calendar' && <MonthlyCalendar />}
        {screen === 'daily' && <DailyRecordView />}
      </main>

      {/* Deep Telemetry Dossier Modal */}
      <CategoryDetailModal />

      {/* Quick Capture Modal */}
      <QuickCaptureModal />

      {/* Floating Quick Capture Trigger (Shown when not in full-screen year selector) */}
      {screen !== 'year' && (
        <button
          onClick={() => openQuickCapture()}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black dark:bg-white dark:text-black light:bg-black light:text-white shadow-elevated border border-neutral-200/20 hover:scale-105 active:scale-95 transition-all text-xs font-mono font-medium tracking-wide cursor-pointer select-none"
          title="Quick Capture (Press C)"
          aria-label="Quick Capture"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Capture</span>
          <span className="text-[10px] opacity-60 font-mono">C</span>
        </button>
      )}
    </div>
  );
};

export default App;
