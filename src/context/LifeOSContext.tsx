import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  ScreenMode,
  DailyRecord,
  ActivityCategory,
  UserPreferences,
} from '../types';
import {
  initStorage,
  getAllDailyRecords,
  getUserPreferences,
  saveUserPreferences,
  subscribeToStorage,
  loadDemonstrationData,
  clearDemonstrationData,
  clearAllUserData,
} from '../services/storage';
import { getTodayDateKey, parseDateKey, formatDateKey } from '../utils/dateUtils';
import { parseHash, buildHash } from '../utils/routerUtils';

interface QuickCaptureState {
  isOpen: boolean;
  initialCategory: ActivityCategory;
  initialDate: string;
}

interface LifeOSContextType {
  // Navigation state
  screen: ScreenMode;
  previousScreen: ScreenMode | null;
  year: number;
  month: number;
  selectedDate: string;
  activeCategoryModal: ActivityCategory | null;
  quickCapture: QuickCaptureState;
  isSettingsOpen: boolean;

  // Data & Preferences
  records: Record<string, DailyRecord>;
  activeRecord: DailyRecord | null;
  hasSampleData: boolean;
  preferences: UserPreferences;

  // Navigation handlers
  setScreen: (screen: ScreenMode) => void;
  selectYear: (year: number) => void;
  selectMonth: (month: number) => void;
  selectDate: (dateKey: string) => void;
  goToToday: () => void;
  navigateToCalendar: () => void;
  navigateToMonths: () => void;
  navigateToYears: () => void;
  navigateToAnalytics: () => void;
  navigateToJournal: (dateKey?: string) => void;
  navigateToSearch: () => void;
  openCategoryAnalytics: (category: ActivityCategory) => void;
  closeCategoryAnalytics: () => void;

  // Quick capture
  openQuickCapture: (category?: ActivityCategory, dateKey?: string) => void;
  closeQuickCapture: () => void;

  // Settings
  openSettings: () => void;
  closeSettings: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;

  // Sample data controls
  loadSampleData: () => void;
  clearSampleData: () => void;
  clearAllData: () => void;
}

const LifeOSContext = createContext<LifeOSContextType | undefined>(undefined);

export const LifeOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage on mount
  useEffect(() => {
    initStorage();
  }, []);

  const todayKey = getTodayDateKey();
  const todayParts = parseDateKey(todayKey);

  // Initialize from URL hash if available (supports deep linking & reload survival)
  const initialRoute = typeof window !== 'undefined' ? parseHash(window.location.hash) : null;

  const [screen, setScreenState] = useState<ScreenMode>(initialRoute?.screen ?? 'year');
  const [previousScreen, setPreviousScreen] = useState<ScreenMode | null>(null);
  const [year, setYearState] = useState<number>(initialRoute?.year ?? todayParts.year);
  const [month, setMonthState] = useState<number>(initialRoute?.month ?? todayParts.month);
  const [selectedDate, setSelectedDateState] = useState<string>(
    initialRoute?.dateKey ??
      (initialRoute?.year && initialRoute?.month
        ? formatDateKey(initialRoute.year, initialRoute.month, 1)
        : todayKey)
  );
  const [activeCategoryModal, setActiveCategoryModal] = useState<ActivityCategory | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [quickCapture, setQuickCapture] = useState<QuickCaptureState>({
    isOpen: false,
    initialCategory: 'work',
    initialDate: todayKey,
  });

  const [records, setRecords] = useState<Record<string, DailyRecord>>(() => getAllDailyRecords());
  const [preferences, setPreferences] = useState<UserPreferences>(() => getUserPreferences());

  // Listen to storage mutations
  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      setRecords(getAllDailyRecords());
      setPreferences(getUserPreferences());
    });
    return () => unsubscribe();
  }, []);

  // Synchronize state changes to URL hash (two-way router)
  useEffect(() => {
    const targetHash = buildHash({ screen, year, month, selectedDate });
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, [screen, year, month, selectedDate]);

  // Listen to browser Back/Forward navigation (hashchange)
  useEffect(() => {
    const handleHashChange = () => {
      const route = parseHash(window.location.hash);
      if (!route) return;

      setScreenState((currentScreen) => {
        if (currentScreen !== route.screen) {
          setPreviousScreen(currentScreen);
          return route.screen;
        }
        return currentScreen;
      });

      if (route.year) {
        setYearState((cur) => (cur !== route.year ? route.year! : cur));
      }
      if (route.month) {
        setMonthState((cur) => (cur !== route.month ? route.month! : cur));
      }
      if (route.dateKey) {
        setSelectedDateState((cur) => (cur !== route.dateKey ? route.dateKey! : cur));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const activeRecord = records[selectedDate] || null;
  const hasSampleData = Object.values(records).some((r) => r.isSampleData);

  const setScreen = useCallback((newScreen: ScreenMode) => {
    setScreenState((current) => {
      if (current !== newScreen) {
        setPreviousScreen(current);
        return newScreen;
      }
      return current;
    });
  }, []);

  const selectYear = useCallback((newYear: number) => {
    setYearState(newYear);
    setScreen('month');
  }, [setScreen]);

  const selectMonth = useCallback((newMonth: number) => {
    setMonthState(newMonth);
    const currentDateParts = parseDateKey(selectedDate);
    const safeDay = Math.min(currentDateParts.day, 28);
    setSelectedDateState(formatDateKey(year, newMonth, safeDay));
    setScreen('calendar');
  }, [year, selectedDate, setScreen]);

  const selectDate = useCallback((dateKey: string) => {
    setSelectedDateState(dateKey);
    const parts = parseDateKey(dateKey);
    setYearState(parts.year);
    setMonthState(parts.month);
  }, []);

  const goToToday = useCallback(() => {
    const today = getTodayDateKey();
    const parts = parseDateKey(today);
    setYearState(parts.year);
    setMonthState(parts.month);
    setSelectedDateState(today);
    setScreen('calendar');
  }, [setScreen]);

  const navigateToCalendar = useCallback(() => {
    setScreen('calendar');
  }, [setScreen]);

  const navigateToMonths = useCallback(() => {
    setScreen('month');
  }, [setScreen]);

  const navigateToYears = useCallback(() => {
    setScreen('year');
  }, [setScreen]);

  const navigateToAnalytics = useCallback(() => {
    setScreen('analytics');
  }, [setScreen]);

  const navigateToJournal = useCallback((dateKey?: string) => {
    if (dateKey) {
      setSelectedDateState(dateKey);
      const parts = parseDateKey(dateKey);
      setYearState(parts.year);
      setMonthState(parts.month);
    }
    setScreen('daily');
  }, [setScreen]);

  const navigateToSearch = useCallback(() => {
    setScreen('search');
  }, [setScreen]);

  const openCategoryAnalytics = useCallback((category: ActivityCategory) => {
    setActiveCategoryModal(category);
  }, []);

  const closeCategoryAnalytics = useCallback(() => {
    setActiveCategoryModal(null);
  }, []);

  const openQuickCapture = useCallback((category: ActivityCategory = 'work', dateKey?: string) => {
    setQuickCapture({
      isOpen: true,
      initialCategory: category,
      initialDate: dateKey || selectedDate || getTodayDateKey(),
    });
  }, [selectedDate]);

  const closeQuickCapture = useCallback(() => {
    setQuickCapture((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const updatePreferences = useCallback((newPrefs: Partial<UserPreferences>) => {
    const updated = saveUserPreferences(newPrefs);
    setPreferences(updated);
  }, []);

  const handleLoadSampleData = useCallback(() => {
    loadDemonstrationData();
  }, []);

  const handleClearSampleData = useCallback(() => {
    clearDemonstrationData();
  }, []);

  const handleClearAllData = useCallback(() => {
    clearAllUserData();
  }, []);

  return (
    <LifeOSContext.Provider
      value={{
        screen,
        previousScreen,
        year,
        month,
        selectedDate,
        activeCategoryModal,
        quickCapture,
        isSettingsOpen,
        records,
        activeRecord,
        hasSampleData,
        preferences,
        setScreen,
        selectYear,
        selectMonth,
        selectDate,
        goToToday,
        navigateToCalendar,
        navigateToMonths,
        navigateToYears,
        navigateToAnalytics,
        navigateToJournal,
        navigateToSearch,
        openCategoryAnalytics,
        closeCategoryAnalytics,
        openQuickCapture,
        closeQuickCapture,
        openSettings,
        closeSettings,
        updatePreferences,
        loadSampleData: handleLoadSampleData,
        clearSampleData: handleClearSampleData,
        clearAllData: handleClearAllData,
      }}
    >
      {children}
    </LifeOSContext.Provider>
  );
};

export function useLifeOS() {
  const context = useContext(LifeOSContext);
  if (!context) {
    throw new Error('useLifeOS must be used within a LifeOSProvider');
  }
  return context;
}
