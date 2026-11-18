import {
  CalendarMonthMeta,
  DayActivitySummary,
  DailyRecord,
  ActivityCategory,
} from '../types';
import {
  getDaysInMonth,
  getFirstWeekdayOfMonth,
  getMonthName,
  getShortMonthName,
  formatDateKey,
  getTodayDateKey,
  getPreviousMonth,
} from '../utils/dateUtils';
import { getAllDailyRecords } from './storage';

export function getDynamicYearRange(centerYear: number, span = 7): number[] {
  const years: number[] = [];
  for (let y = centerYear - span; y <= centerYear + span; y++) {
    years.push(y);
  }
  return years;
}

export function getMonthMetadata(
  year: number,
  month: number,
  allRecords: Record<string, DailyRecord> = getAllDailyRecords()
): CalendarMonthMeta {
  const daysCount = getDaysInMonth(year, month);
  let totalRecordsCount = 0;
  const categoryCounts: Record<ActivityCategory, number> = {
    work: 0,
    fitness: 0,
    learning: 0,
    project: 0,
    personal: 0,
    health: 0,
  };

  for (let d = 1; d <= daysCount; d++) {
    const key = formatDateKey(year, month, d);
    const rec = allRecords[key];
    if (rec) {
      const hasContent =
        rec.work.length > 0 ||
        rec.fitness.length > 0 ||
        rec.learning.length > 0 ||
        rec.projects.length > 0 ||
        rec.personal.length > 0 ||
        !!rec.health ||
        !!rec.reflection;

      if (hasContent) {
        totalRecordsCount++;
        if (rec.work.length > 0) categoryCounts.work += rec.work.length;
        if (rec.fitness.length > 0) categoryCounts.fitness += rec.fitness.length;
        if (rec.learning.length > 0) categoryCounts.learning += rec.learning.length;
        if (rec.projects.length > 0) categoryCounts.project += rec.projects.length;
        if (rec.personal.length > 0) categoryCounts.personal += rec.personal.length;
        if (rec.health) categoryCounts.health += 1;
      }
    }
  }

  return {
    year,
    month,
    monthName: getMonthName(month),
    shortName: getShortMonthName(month),
    daysCount,
    totalRecordsCount,
    categoryCounts,
    hasActivity: totalRecordsCount > 0,
  };
}

export function getAllMonthsForYear(
  year: number,
  allRecords: Record<string, DailyRecord> = getAllDailyRecords()
): CalendarMonthMeta[] {
  const months: CalendarMonthMeta[] = [];
  for (let m = 1; m <= 12; m++) {
    months.push(getMonthMetadata(year, m, allRecords));
  }
  return months;
}

export function generateCalendarGrid(
  year: number,
  month: number,
  selectedDateKey?: string,
  allRecords: Record<string, DailyRecord> = getAllDailyRecords(),
  firstDayOfWeek: 0 | 1 = 1
): DayActivitySummary[] {
  const todayKey = getTodayDateKey();
  const daysInCurrentMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekdayOfMonth(year, month, firstDayOfWeek);

  const grid: DayActivitySummary[] = [];

  // Trailing days from previous month
  const prev = getPreviousMonth(year, month);
  const daysInPrevMonth = getDaysInMonth(prev.year, prev.month);
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateKey = formatDateKey(prev.year, prev.month, dayNum);
    const rec = allRecords[dateKey];
    grid.push(buildDaySummary(dateKey, dayNum, false, todayKey, selectedDateKey, rec));
  }

  // Days of the current month
  for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
    const dateKey = formatDateKey(year, month, dayNum);
    const rec = allRecords[dateKey];
    grid.push(buildDaySummary(dateKey, dayNum, true, todayKey, selectedDateKey, rec));
  }

  // Next month leading days to complete grid (multiples of 7: 35 or 42)
  const remainingCells = grid.length % 7 === 0 ? 0 : 7 - (grid.length % 7);
  // Ensure we display at least 5 rows (35) or 6 rows (42) cleanly
  const targetTotal = grid.length + remainingCells < 35 ? 35 : grid.length + remainingCells;
  const trailingNeeded = targetTotal - grid.length;

  const nextMonthYear = month === 12 ? year + 1 : year;
  const nextMonthNum = month === 12 ? 1 : month + 1;

  for (let dayNum = 1; dayNum <= trailingNeeded; dayNum++) {
    const dateKey = formatDateKey(nextMonthYear, nextMonthNum, dayNum);
    const rec = allRecords[dateKey];
    grid.push(buildDaySummary(dateKey, dayNum, false, todayKey, selectedDateKey, rec));
  }

  return grid;
}

function buildDaySummary(
  dateKey: string,
  dayNumber: number,
  isCurrentMonth: boolean,
  todayKey: string,
  selectedDateKey?: string,
  rec?: DailyRecord
): DayActivitySummary {
  const hasWork = (rec?.work?.length ?? 0) > 0;
  const hasFitness = (rec?.fitness?.length ?? 0) > 0;
  const hasLearning = (rec?.learning?.length ?? 0) > 0;
  const hasProject = (rec?.projects?.length ?? 0) > 0;
  const hasPersonal = (rec?.personal?.length ?? 0) > 0;
  const hasHealth = !!rec?.health;
  const hasReflection = !!rec?.reflection;

  const totalEntries =
    (rec?.work?.length ?? 0) +
    (rec?.fitness?.length ?? 0) +
    (rec?.learning?.length ?? 0) +
    (rec?.projects?.length ?? 0) +
    (rec?.personal?.length ?? 0) +
    (hasHealth ? 1 : 0) +
    (hasReflection ? 1 : 0);

  return {
    date: dateKey,
    dayNumber,
    isCurrentMonth,
    isToday: dateKey === todayKey,
    isSelected: dateKey === selectedDateKey,
    totalEntries,
    hasWork,
    hasFitness,
    hasLearning,
    hasProject,
    hasPersonal,
    hasHealth,
    hasReflection,
    record: rec,
  };
}

