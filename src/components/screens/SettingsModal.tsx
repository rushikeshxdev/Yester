import React, { useState } from 'react';
import {
  X,
  Sliders,
  Palette,
  Shield,
  Download,
  Upload,
  Info,
  Check,
  Moon,
  Sun,
  Trash2,
} from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { useTheme } from '../../context/ThemeContext';
import { exportBackupJSON, importBackupJSON, clearAllUserData } from '../../services/storage';

type SettingsTab = 'general' | 'appearance' | 'preferences' | 'data' | 'about';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    closeSettings,
    preferences,
    updatePreferences,
  } = useLifeOS();

  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isSettingsOpen) return null;

  const handleExport = () => {
    const dataStr = exportBackupJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yester-archive-${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus('Backup restored successfully! Refreshing...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } else {
          setImportStatus('Failed to parse backup JSON. Invalid structure.');
        }
      } catch {
        setImportStatus('Error importing file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    clearAllUserData();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div
        className="w-full max-w-3xl rounded-3xl bg-[#0D0F13] dark:bg-[#0D0F13] light:bg-white border border-[#1E232B] dark:border-[#1E232B] light:border-neutral-200 shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar Navigation (Matching Concept Panel 7) */}
        <div className="w-full md:w-56 p-5 border-b md:border-b-0 md:border-r border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200 bg-[#090B0E] dark:bg-[#090B0E] light:bg-neutral-50 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="px-2 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                PREFERENCES
              </span>
            </div>

            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'appearance'
                    ? 'bg-[#161B22] text-[#FF7138] border border-[#272E3A]'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black'
                }`}
              >
                <Palette className="w-4 h-4" />
                <span>Appearance</span>
              </button>

              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'general'
                    ? 'bg-[#161B22] text-[#FF7138] border border-[#272E3A]'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'data'
                    ? 'bg-[#161B22] text-[#FF7138] border border-[#272E3A]'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Data & Privacy</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-sans font-medium transition-all cursor-pointer ${
                  activeTab === 'about'
                    ? 'bg-[#161B22] text-[#FF7138] border border-[#272E3A]'
                    : 'text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>About Yester</span>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-[#1A1F26] text-[10px] font-mono text-neutral-500 px-2">
            Yester &bull; v1.0.0
          </div>
        </div>

        {/* Right Main Content Pane */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Top header with close X */}
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200">
              <div>
                <h2 className="text-xl font-serif text-white dark:text-white light:text-neutral-900 tracking-tight">
                  Settings
                </h2>
                <p className="text-xs font-sans text-neutral-400 dark:text-neutral-400 light:text-neutral-600 mt-0.5">
                  Customize your Yester experience
                </p>
              </div>

              <button
                onClick={closeSettings}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white dark:hover:text-white light:text-neutral-600 light:hover:text-black hover:bg-[#161B22] transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB: Appearance (Concept Panel 7) */}
            {activeTab === 'appearance' && (
              <div className="space-y-5">
                <h3 className="text-sm font-sans font-semibold text-white dark:text-white light:text-neutral-900">
                  Appearance
                </h3>

                {/* Theme Selection Cards (Dark & Light) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Dark Theme Card */}
                  <div
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                      theme === 'dark'
                        ? 'bg-[#12151B] border-[#FF7138] ring-1 ring-[#FF7138]/50 shadow-lg'
                        : 'bg-[#0F1216] border-[#1E232B] hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#181D24] flex items-center justify-center text-neutral-300">
                        <Moon className="w-4 h-4" />
                      </div>
                      {theme === 'dark' && (
                        <div className="w-5 h-5 rounded-full bg-[#FF7138] flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-sans font-medium text-white">Dark</h4>
                      <p className="text-xs font-sans text-neutral-400 mt-0.5">
                        Easy on your eyes
                      </p>
                    </div>
                  </div>

                  {/* Light Theme Card */}
                  <div
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[120px] ${
                      theme === 'light'
                        ? 'bg-[#12151B] border-[#FF7138] ring-1 ring-[#FF7138]/50 shadow-lg'
                        : 'bg-[#0F1216] border-[#1E232B] hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-lg bg-[#181D24] flex items-center justify-center text-neutral-300">
                        <Sun className="w-4 h-4" />
                      </div>
                      {theme === 'light' && (
                        <div className="w-5 h-5 rounded-full bg-[#FF7138] flex items-center justify-center text-white">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-sans font-medium text-white">Light</h4>
                      <p className="text-xs font-sans text-neutral-400 mt-0.5">
                        Bright and clean
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: General Preferences */}
            {activeTab === 'general' && (
              <div className="space-y-5">
                <h3 className="text-sm font-sans font-semibold text-white dark:text-white light:text-neutral-900">
                  Calendar & Display Settings
                </h3>

                <div className="space-y-4">
                  {/* First Day of Week */}
                  <div className="p-4 rounded-xl bg-[#0F1216] border border-[#1E232B] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-sans font-medium text-white">
                        First Day of Week
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Choose whether the calendar grid starts on Monday or Sunday
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#161B22] p-1 rounded-lg border border-[#242A35]">
                      <button
                        onClick={() => updatePreferences({ firstDayOfWeek: 1 })}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                          preferences?.firstDayOfWeek === 1
                            ? 'bg-[#FF7138] text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Monday
                      </button>
                      <button
                        onClick={() => updatePreferences({ firstDayOfWeek: 0 })}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                          preferences?.firstDayOfWeek === 0
                            ? 'bg-[#FF7138] text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        Sunday
                      </button>
                    </div>
                  </div>

                  {/* Reduced Motion */}
                  <div className="p-4 rounded-xl bg-[#0F1216] border border-[#1E232B] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-sans font-medium text-white">
                        Reduced Motion
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Minimize page transitions and animated effects
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences?.reducedMotion || false}
                      onChange={(e) =>
                        updatePreferences({ reducedMotion: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#FF7138] rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Data & Privacy */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                <h3 className="text-sm font-sans font-semibold text-white dark:text-white light:text-neutral-900">
                  Data Portability & Backup
                </h3>

                <div className="space-y-4">
                  {/* Export Backup */}
                  <div className="p-4 rounded-xl bg-[#0F1216] border border-[#1E232B] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-sans font-medium text-white">
                        Export JSON Backup
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Save all your daily records, notes, and milestones to a JSON file
                      </p>
                    </div>
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#242A35] text-xs font-mono text-white hover:border-[#FF7138] transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FF7138]" />
                      <span>Export</span>
                    </button>
                  </div>

                  {/* Import Backup */}
                  <div className="p-4 rounded-xl bg-[#0F1216] border border-[#1E232B] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-sans font-medium text-white">
                        Import JSON Backup
                      </h4>
                      <p className="text-[11px] text-neutral-400">
                        Restore your archive from a previously exported Yester backup
                      </p>
                    </div>
                    <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161B22] border border-[#242A35] text-xs font-mono text-white hover:border-[#FF7138] transition-colors cursor-pointer">
                      <Upload className="w-3.5 h-3.5 text-[#FF7138]" />
                      <span>Import</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {importStatus && (
                    <div className="p-3 rounded-lg bg-[#181D24] text-xs font-mono text-[#FF7138]">
                      {importStatus}
                    </div>
                  )}

                  {/* Reset / Purge */}
                  <div className="p-4 rounded-xl bg-[#1A1111] border border-red-950 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-sans font-medium text-red-300">
                        Clear All Data
                      </h4>
                      <p className="text-[11px] text-red-400/70">
                        Permanently purge local records and restore blank initial state
                      </p>
                    </div>
                    <button
                      onClick={handleClearAll}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                        confirmClear
                          ? 'bg-red-600 text-white font-bold'
                          : 'bg-red-950/60 border border-red-800 text-red-300 hover:bg-red-900'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{confirmClear ? 'Confirm Reset?' : 'Clear'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: About */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-[#0F1216] border border-[#1E232B] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-serif font-bold text-white tracking-tight">
                      Yester<span className="text-[#FF7138]">.</span>
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#181D24] text-neutral-400">
                      v1.0.0
                    </span>
                  </div>
                  <p className="text-xs font-serif italic text-neutral-300 leading-relaxed">
                    &ldquo;Every yesterday shapes who you become tomorrow.&rdquo;
                  </p>
                  <p className="text-xs font-sans text-neutral-400 leading-relaxed">
                    A premium personal life-history and growth-tracking platform designed to preserve
                    your professional journey, physical fitness, education, personal projects, and
                    everyday reflections.
                  </p>
                  <div className="pt-2 flex items-center gap-3 text-[11px] font-mono text-neutral-500">
                    <span>100% Client-Side Local Storage</span>
                    <span>&bull;</span>
                    <span>Private &amp; Offline-Ready</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Done Button */}
          <div className="pt-4 border-t border-[#1A1F26] dark:border-[#1A1F26] light:border-neutral-200 flex justify-end">
            <button
              onClick={closeSettings}
              className="px-5 py-2 rounded-xl bg-[#FF7138] hover:bg-[#FF8352] text-white text-xs font-medium tracking-wide shadow-orange-sm transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
