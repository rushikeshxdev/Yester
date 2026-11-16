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

interface QuickCaptureState {
  isOpen: boolean;
  initialCategory: ActivityCategory;
  initialDate: string;
}

interface LifeOSContextType {
  // Navigation state
  screen: ScreenMode;
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

  const [screen, setScreen] = useState<ScreenMode>('year');
  const [year, setYear] = useState<number>(todayParts.year);
  const [month, setMonth] = useState<number>(todayParts.month);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
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

  const activeRecord = records[selectedDate] || null;
  const hasSampleData = Object.values(records).some((r) => r.isSampleData);

  const selectYear = useCallback((newYear: number) => {
    setYear(newYear);
    setScreen('month');
  }, []);

  const selectMonth = useCallback((newMonth: number) => {
    setMonth(newMonth);
    const currentDateParts = parseDateKey(selectedDate);
    const safeDay = Math.min(currentDateParts.day, 28);
    setSelectedDate(formatDateKey(year, newMonth, safeDay));
    setScreen('calendar');
  }, [year, selectedDate]);

  const selectDate = useCallback((dateKey: string) => {
    setSelectedDate(dateKey);
    const parts = parseDateKey(dateKey);
    setYear(parts.year);
    setMonth(parts.month);
  }, []);

  const goToToday = useCallback(() => {
    const today = getTodayDateKey();
    const parts = parseDateKey(today);
    setYear(parts.year);
    setMonth(parts.month);
    setSelectedDate(today);
    setScreen('calendar');
  }, []);

  const navigateToCalendar = useCallback(() => {
    setScreen('calendar');
  }, []);

  const navigateToMonths = useCallback(() => {
    setScreen('month');
  }, []);

  const navigateToYears = useCallback(() => {
    setScreen('year');
  }, []);

  const navigateToAnalytics = useCallback(() => {
    setScreen('analytics');
  }, []);

  const navigateToJournal = useCallback((dateKey?: string) => {
    if (dateKey) {
      setSelectedDate(dateKey);
      const parts = parseDateKey(dateKey);
      setYear(parts.year);
      setMonth(parts.month);
    }
    setScreen('daily');
  }, []);

  const navigateToSearch = useCallback(() => {
    setScreen('search');
  }, []);

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
