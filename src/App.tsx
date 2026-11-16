import React from 'react';
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
  const { screen, openQuickCapture } = useLifeOS();

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#0B0B0B] text-neutral-900 dark:text-white transition-colors flex flex-col font-sans">
      {/* TIME FIRST Breadcrumb Header */}
      <BreadcrumbNav />

      {/* Main Temporal View Routing */}
      <main className="flex-1 w-full">
        {screen === 'year' && <YearSelector />}
        {screen === 'month' && <MonthSelector />}
        {screen === 'calendar' && <MonthlyCalendar />}
        {screen === 'daily' && <DailyRecordView />}
      </main>

      {/* Deep Analytics Detail Modal */}
      <CategoryDetailModal />

      {/* Quick Capture Modal */}
      <QuickCaptureModal />

      {/* Floating Quick Capture Trigger (Shown when not in full-screen year selector) */}
      {screen !== 'year' && (
        <button
          onClick={() => openQuickCapture()}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black shadow-elevated hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-neutral-500"
          title="Quick Capture (+)"
          aria-label="Quick Capture"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};

export default App;

