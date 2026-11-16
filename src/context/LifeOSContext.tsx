import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  ScreenMode,
  DailyRecord,
  ActivityCategory,
} from '../types';
import {
  initStorage,
  getAllDailyRecords,
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

  // Data
  records: Record<string, DailyRecord>;
  activeRecord: DailyRecord | null;
  hasSampleData: boolean;

  // Navigation handlers
  setScreen: (screen: ScreenMode) => void;
  selectYear: (year: number) => void;
  selectMonth: (month: number) => void;
  selectDate: (dateKey: string) => void;
  goToToday: () => void;
  navigateToCalendar: () => void;
  navigateToMonths: () => void;
  navigateToYears: () => void;
  openCategoryAnalytics: (category: ActivityCategory) => void;
  closeCategoryAnalytics: () => void;

  // Quick capture
  openQuickCapture: (category?: ActivityCategory, dateKey?: string) => void;
  closeQuickCapture: () => void;

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

  const [quickCapture, setQuickCapture] = useState<QuickCaptureState>({
    isOpen: false,
    initialCategory: 'work',
    initialDate: todayKey,
  });

  const [records, setRecords] = useState<Record<string, DailyRecord>>(() => getAllDailyRecords());

  // Listen to storage mutations
  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      setRecords(getAllDailyRecords());
    });
    return () => unsubscribe();
  }, []);

  const activeRecord = records[selectedDate] || null;

  const hasSampleData = Object.values(records).some((r) => r.isSampleData);

  const selectYear = useCallback((newYear: number) => {
    setYear(newYear);
    // Move to month selector
    setScreen('month');
  }, []);

  const selectMonth = useCallback((newMonth: number) => {
    setMonth(newMonth);
    // Keep date within valid days of selected month
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
    setScreen('daily');
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
        records,
        activeRecord,
        hasSampleData,
        setScreen,
        selectYear,
        selectMonth,
        selectDate,
        goToToday,
        navigateToCalendar,
        navigateToMonths,
        navigateToYears,
        openCategoryAnalytics,
        closeCategoryAnalytics,
        openQuickCapture,
        closeQuickCapture,
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
