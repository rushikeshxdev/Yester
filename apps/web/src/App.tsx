import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useLifeOS } from './context/LifeOSContext';
import { BreadcrumbNav } from './components/common/BreadcrumbNav';
import { YearSelector } from './components/screens/YearSelector';
import { MonthSelector } from './components/screens/MonthSelector';
import { MonthlyCalendar } from './components/screens/MonthlyCalendar';
import { DailyRecordView } from './components/screens/DailyRecordView';
import { AnalyticsDashboard } from './components/screens/AnalyticsDashboard';
import { SearchView } from './components/screens/SearchView';
import { PlansView } from './components/screens/PlansView';
import { PlanDetailView } from './components/screens/PlanDetailView';
import { SettingsModal } from './components/screens/SettingsModal';
import { CategoryDetailModal } from './components/screens/CategoryDetailModal';
import { QuickCaptureModal } from './components/quickCapture/QuickCaptureModal';
import { AuthModal } from './components/auth/AuthModal';
import { MigrationModal } from './components/auth/MigrationModal';
import { inspectLocalArchive } from './services/migration';

export const App: React.FC = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMigrationOpen, setIsMigrationOpen] = useState(false);
  const {
    screen,
    openQuickCapture,
    quickCapture,
    navigateToSearch,
    isSettingsOpen,
    closeSettings,
  } = useLifeOS();

  // Global keyboard shortcuts:
  // 'C' -> Quick Capture
  // '⌘K' or 'Ctrl+K' -> Search
  // 'Escape' -> Close open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K for Search
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        navigateToSearch();
        return;
      }

      // Escape key to close settings
      if (e.key === 'Escape' && isSettingsOpen) {
        closeSettings();
        return;
      }

      // 'c' or 'C' for Quick Capture (only if not typing in an input)
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
  }, [
    screen,
    quickCapture.isOpen,
    isSettingsOpen,
    openQuickCapture,
    navigateToSearch,
    closeSettings,
  ]);

  return (
    <div className="min-h-screen bg-[#090A0C] dark:bg-[#090A0C] light:bg-[#F5F4F0] text-white dark:text-[#F5F4F0] light:text-[#191B20] transition-colors flex flex-col font-sans selection:bg-[#FF7138] selection:text-white">
      {/* TIME FIRST Global Header Nav */}
      <BreadcrumbNav
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenMigration={() => setIsMigrationOpen(true)}
      />

      {/* Main Temporal Navigation Routing */}
      <main className="flex-1 w-full">
        {screen === 'year' && <YearSelector />}
        {screen === 'month' && <MonthSelector />}
        {screen === 'calendar' && <MonthlyCalendar />}
        {screen === 'daily' && <DailyRecordView />}
        {screen === 'analytics' && <AnalyticsDashboard />}
        {screen === 'search' && <SearchView />}
        {screen === 'plans' && <PlansView />}
        {screen === 'plan-detail' && <PlanDetailView />}
      </main>

      {/* Deep Telemetry Dossier Modal */}
      <CategoryDetailModal />

      {/* Quick Capture Modal (Concept Panel 6) */}
      <QuickCaptureModal />

      {/* Settings Modal (Concept Panel 7) */}
      <SettingsModal />

      {/* Sovereign Vault Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          const archive = inspectLocalArchive();
          if (archive.plansCount + archive.recordsCount + archive.entriesCount > 0) {
            setIsMigrationOpen(true);
          }
        }}
      />

      {/* Lossless Sovereign Cloud Migration Modal */}
      <MigrationModal
        isOpen={isMigrationOpen}
        onClose={() => setIsMigrationOpen(false)}
      />

      {/* Floating Orange Quick Capture Action (Concept Panel 6) */}
      {screen !== 'year' && (
        <button
          onClick={() => openQuickCapture()}
          className="fixed bottom-7 right-7 z-40 w-12 h-12 rounded-full bg-[#FF7138] hover:bg-[#FF8352] text-white shadow-orange-md hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none border border-white/20"
          title="Quick Capture (Press C)"
          aria-label="Quick Capture"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};

export default App;
