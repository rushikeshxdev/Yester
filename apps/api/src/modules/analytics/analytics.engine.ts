import { ActivityCategory, PacingType, PlanStatus } from '@prisma/client';
import { formatCalendarDate, parseCalendarDate } from '../../common/utils/date.util';
import { calculateExpectedProgress, PaceStatus } from '../plans/trajectory.engine';

export interface StreaksResult {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
}

export interface HeatmapDayData {
  date: string;
  weekday: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  weekIndex: number;
  count: number;
  intensity: number; // 0 = 0, 1 = 1-2, 2 = 3-4, 3 = 5-6, 4 = 7+
  categories: Record<string, number>;
}

export interface CalendarHeatmapData {
  year: number;
  totalDays: number;
  activeDays: number;
  maxDayEntries: number;
  startWeekday: number;
  totalWeeks: number;
  heatmap: HeatmapDayData[];
  weekdayDistribution: Record<string, number>;
}

export interface PlanTimeSeriesPoint {
  date: string;
  actualCumulative: number;
  expectedCumulative: number;
  targetValue: number;
  dailyContribution: number;
}

export interface PlanAnalyticsItem {
  id: string;
  title: string;
  category: ActivityCategory;
  status: PlanStatus;
  targetValue: number;
  unitLabel: string;
  startDate: string;
  targetDate: string;
  currentValue: number;
  progressPercent: number;
  expectedPercent: number;
  variancePercent: number;
  paceStatus: PaceStatus;
  timeSeries: PlanTimeSeriesPoint[];
}

/**
 * Calculates current streak, longest streak, and active days.
 * @param sortedUniqueDates - Array of YYYY-MM-DD dates in ascending order with >= 1 entry
 * @param asOfDateStr - Optional reference date (defaults to UTC today)
 */
export function calculateStreaks(
  sortedUniqueDates: string[],
  asOfDateStr?: string,
): StreaksResult {
  if (!sortedUniqueDates || sortedUniqueDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDays: 0 };
  }

  const activeDays = sortedUniqueDates.length;
  const dateSet = new Set(sortedUniqueDates);

  // 1. Calculate Longest Streak
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedUniqueDates.length; i++) {
    const prevDate = parseCalendarDate(sortedUniqueDates[i - 1]);
    const currDate = parseCalendarDate(sortedUniqueDates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentRun++;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    } else if (diffDays > 1) {
      currentRun = 1;
    }
  }

  // 2. Calculate Current Streak
  const referenceDateStr = asOfDateStr || formatCalendarDate(new Date());
  const refDate = parseCalendarDate(referenceDateStr);
  const yesterday = new Date(refDate);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayStr = formatCalendarDate(yesterday);

  let currentStreak = 0;
  // If the user recorded today, count backward from today.
  // If the user did not record today yet, but recorded yesterday, count backward from yesterday (grace period).
  let anchorDateStr: string | null = null;
  if (dateSet.has(referenceDateStr)) {
    anchorDateStr = referenceDateStr;
  } else if (dateSet.has(yesterdayStr)) {
    anchorDateStr = yesterdayStr;
  }

  if (anchorDateStr) {
    let checkDate = parseCalendarDate(anchorDateStr);
    while (dateSet.has(formatCalendarDate(checkDate))) {
      currentStreak++;
      checkDate.setUTCDate(checkDate.getUTCDate() - 1);
    }
  }

  return {
    currentStreak,
    longestStreak,
    activeDays,
  };
}

/**
 * Calculates consistency percentage given active days and total elapsed days.
 */
export function calculateConsistencyRate(activeDays: number, elapsedDays: number): number {
  if (elapsedDays <= 0 || activeDays <= 0) return 0;
  return Math.min(100, Number(((activeDays / elapsedDays) * 100).toFixed(1)));
}

/**
 * Calculates period-over-period percentage delta.
 * Returns null if prior is null (indicating baseline period).
 */
export function calculatePeriodDelta(current: number, prior: number | null): number | null {
  if (prior === null) return null;
  if (prior === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - prior) / prior) * 100).toFixed(1));
}

/**
 * Determines heatmap intensity (0 to 4) based on entry count.
 */
export function getIntensityLevel(count: number): number {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Checks if a given calendar year is a leap year.
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Generates an annual calendar heatmap matrix with true 365/366-day support,
 * accurate ISO weekday alignment, dynamic week counts (52 or 53 weeks), and category breakdowns.
 */
export function generateCalendarHeatmap(
  year: number,
  entriesByDate: Map<string, { count: number; categories: Record<string, number> }>,
): CalendarHeatmapData {
  const isLeap = isLeapYear(year);
  const totalDays = isLeap ? 366 : 365;

  const startDate = new Date(Date.UTC(year, 0, 1));
  const startWeekday = startDate.getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayDistribution: Record<string, number> = {
    Sun: 0,
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
  };

  const heatmap: HeatmapDayData[] = [];
  let activeDays = 0;
  let maxDayEntries = 0;

  for (let dayOfYear = 0; dayOfYear < totalDays; dayOfYear++) {
    const dateObj = new Date(Date.UTC(year, 0, 1 + dayOfYear));
    const dateStr = formatCalendarDate(dateObj);
    const weekday = dateObj.getUTCDay();
    const weekdayName = weekdayNames[weekday];

    // Standard calendar grid: week 0 starts with the first week containing Jan 1
    const weekIndex = Math.floor((dayOfYear + startWeekday) / 7);

    const dayData = entriesByDate.get(dateStr) || { count: 0, categories: {} };
    const count = dayData.count;

    if (count > 0) {
      activeDays++;
      weekdayDistribution[weekdayName] += count;
      if (count > maxDayEntries) {
        maxDayEntries = count;
      }
    }

    heatmap.push({
      date: dateStr,
      weekday,
      weekIndex,
      count,
      intensity: getIntensityLevel(count),
      categories: dayData.categories,
    });
  }

  const totalWeeks = Math.ceil((totalDays + startWeekday) / 7);

  return {
    year,
    totalDays,
    activeDays,
    maxDayEntries,
    startWeekday,
    totalWeeks,
    heatmap,
    weekdayDistribution,
  };
}

/**
 * Constructs dated time-series data for a Life Plan, computing actual cumulative
 * progress and expected trajectory progress for each date.
 */
export function calculatePlanTimeSeries(
  plan: {
    id: string;
    title: string;
    category: ActivityCategory;
    status: PlanStatus;
    targetValue: number;
    unitLabel: string;
    startDate: Date;
    targetDate: Date;
    pacingType: PacingType;
  },
  contributions: { date: string; amount: number }[],
  asOfDateStr?: string,
): PlanAnalyticsItem {
  const startDateStr = formatCalendarDate(plan.startDate);
  const targetDateStr = formatCalendarDate(plan.targetDate);
  const referenceDateStr = asOfDateStr || formatCalendarDate(new Date());

  // Aggregate contributions per day
  const dailyContribMap = new Map<string, number>();
  for (const c of contributions) {
    const existing = dailyContribMap.get(c.date) || 0;
    dailyContribMap.set(c.date, existing + c.amount);
  }

  // Create dates list from plan start date to either asOfDate or targetDate, whichever is later
  const criticalDatesSet = new Set<string>();
  criticalDatesSet.add(startDateStr);
  criticalDatesSet.add(referenceDateStr);
  if (targetDateStr > startDateStr && targetDateStr <= referenceDateStr) {
    criticalDatesSet.add(targetDateStr);
  }
  for (const c of contributions) {
    criticalDatesSet.add(c.date);
  }

  const sortedDates = Array.from(criticalDatesSet).sort();

  let runningTotal = 0;
  const timeSeries: PlanTimeSeriesPoint[] = [];

  for (const d of sortedDates) {
    const dailyContrib = dailyContribMap.get(d) || 0;
    runningTotal += dailyContrib;

    const expected = calculateExpectedProgress(
      plan.targetValue,
      startDateStr,
      targetDateStr,
      plan.pacingType,
      d,
    );

    timeSeries.push({
      date: d,
      actualCumulative: Number(runningTotal.toFixed(2)),
      expectedCumulative: Number(expected.expectedValue.toFixed(2)),
      targetValue: plan.targetValue,
      dailyContribution: Number(dailyContrib.toFixed(2)),
    });
  }

  // Current value is the cumulative sum up to asOfDate
  const totalActual = runningTotal;
  const progressPercent =
    plan.targetValue > 0
      ? Number(((totalActual / plan.targetValue) * 100).toFixed(1))
      : 0;

  const currentExpected = calculateExpectedProgress(
    plan.targetValue,
    startDateStr,
    targetDateStr,
    plan.pacingType,
    referenceDateStr,
  );

  const variancePercent = Number((progressPercent - currentExpected.expectedPercent).toFixed(1));

  let paceStatus: PaceStatus = 'on_pace';
  if (variancePercent >= 5) {
    paceStatus = 'ahead';
  } else if (variancePercent <= -5) {
    paceStatus = 'behind';
  }

  return {
    id: plan.id,
    title: plan.title,
    category: plan.category,
    status: plan.status,
    targetValue: plan.targetValue,
    unitLabel: plan.unitLabel,
    startDate: startDateStr,
    targetDate: targetDateStr,
    currentValue: Number(totalActual.toFixed(2)),
    progressPercent,
    expectedPercent: currentExpected.expectedPercent,
    variancePercent,
    paceStatus,
    timeSeries,
  };
}
