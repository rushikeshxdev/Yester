import { ActivityCategory, PacingType } from '@prisma/client';
import { formatCalendarDate, parseCalendarDate } from '../../common/utils/date.util';

export type PaceStatus = 'ahead' | 'on_pace' | 'behind';

export interface EvaluatedMilestone {
  id: string;
  title: string;
  targetPercent: number;
  targetValue: number;
  isReached: boolean;
  reachedDate?: string;
  reachedValue?: number;
}

export interface PlanTrajectoryDataPoint {
  date: string; // YYYY-MM-DD
  dayIndex: number;
  expectedValue: number;
  expectedPercent: number;
  actualValue: number | null; // null for future dates beyond asOfDate
  actualPercent: number | null;
  dailyContribution: number;
}

export interface LinkedPlanEntryItem {
  id: string;
  date: string;
  category: ActivityCategory;
  title: string;
  contribution: number;
}

export interface PlanTrajectoryAnalysis {
  asOfDate: string;
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  expectedValue: number;
  expectedPercent: number;
  actualValue: number;
  actualPercent: number;
  varianceValue: number;
  variancePercent: number;
  paceStatus: PaceStatus;
  isComplete: boolean;
  milestones: EvaluatedMilestone[];
  chartData: PlanTrajectoryDataPoint[];
  linkedEntries: LinkedPlanEntryItem[];
}

/**
 * Calculates calendar days between two YYYY-MM-DD dates inclusive of start.
 */
export function getDaysDifference(startStr: string, endStr: string): number {
  const start = parseCalendarDate(startStr).getTime();
  const end = parseCalendarDate(endStr).getTime();
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates the pacing curve factor f(t) for a normalized elapsed time t in [0, 1].
 */
export function calculatePacingFactor(pacingType: PacingType, t: number): number {
  const clampedT = Math.max(0, Math.min(1, t));

  switch (pacingType) {
    case PacingType.LINEAR:
      return clampedT;

    case PacingType.RAMP_UP:
      // Concave up: starts slow, accelerates toward target
      return Math.pow(clampedT, 1.4);

    case PacingType.FRONT_LOADED:
      // Concave down: heavy early progress, steady taper
      return 1 - Math.pow(1 - clampedT, 1.4);

    default:
      return clampedT;
  }
}

/**
 * Calculates expected progress for a plan on a given asOfDate.
 */
export function calculateExpectedProgress(
  targetValue: number,
  startDateStr: string,
  targetDateStr: string,
  pacingType: PacingType,
  asOfDateStr: string,
): { expectedValue: number; expectedPercent: number; normalizedT: number } {
  if (asOfDateStr < startDateStr) {
    return { expectedValue: 0, expectedPercent: 0, normalizedT: 0 };
  }

  if (asOfDateStr >= targetDateStr) {
    return { expectedValue: targetValue, expectedPercent: 100, normalizedT: 1 };
  }

  const totalDays = Math.max(1, getDaysDifference(startDateStr, targetDateStr));
  const elapsedDays = Math.max(0, getDaysDifference(startDateStr, asOfDateStr));

  const t = elapsedDays / totalDays;
  const factor = calculatePacingFactor(pacingType, t);

  const expectedValue = Math.round(factor * targetValue * 100) / 100;
  const expectedPercent = Math.round(factor * 1000) / 10;

  return {
    expectedValue,
    expectedPercent,
    normalizedT: t,
  };
}

/**
 * Pure function: Derives complete plan trajectory metrics, pace, milestones, and daily chart series.
 */
export function derivePlanTrajectory(
  plan: {
    id: string;
    targetValue: number;
    startDate: string;
    targetDate: string;
    pacingType: PacingType;
    milestones: Array<{ id: string; title: string; targetPercent: number }>;
  },
  entries: Array<{
    id: string;
    date: string;
    category: ActivityCategory;
    title: string;
    planContribution: number | null;
  }>,
  asOfDate: string = formatCalendarDate(new Date()),
): PlanTrajectoryAnalysis {
  // Normalize and sort entries
  const normalizedEntries: LinkedPlanEntryItem[] = entries.map((e) => ({
    id: e.id,
    date: e.date,
    category: e.category,
    title: e.title,
    contribution: typeof e.planContribution === 'number' && e.planContribution > 0 ? e.planContribution : 1,
  }));

  // Filter valid contributions within plan timeline up to asOfDate
  const validContributionsUpToDate = normalizedEntries.filter(
    (e) => e.date >= plan.startDate && e.date <= asOfDate,
  );

  const actualValue = validContributionsUpToDate.reduce((sum, e) => sum + e.contribution, 0);
  const roundedActualValue = Math.round(actualValue * 100) / 100;
  const actualPercent =
    plan.targetValue > 0
      ? Math.round((roundedActualValue / plan.targetValue) * 1000) / 10
      : 0;

  // Expected progress as of today/asOfDate
  const { expectedValue, expectedPercent } = calculateExpectedProgress(
    plan.targetValue,
    plan.startDate,
    plan.targetDate,
    plan.pacingType,
    asOfDate,
  );

  // Variance calculation
  const varianceValue = Math.round((roundedActualValue - expectedValue) * 100) / 100;
  const variancePercent = Math.round((actualPercent - expectedPercent) * 10) / 10;

  // Pace status determination (2.5% threshold)
  let paceStatus: PaceStatus = 'on_pace';
  if (variancePercent >= 2.5) {
    paceStatus = 'ahead';
  } else if (variancePercent <= -2.5) {
    paceStatus = 'behind';
  }

  // Chronological sort for milestone evaluation & chart series
  const chronologicalEntries = [...validContributionsUpToDate].sort(
    (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
  );

  // Build cumulative contribution map
  const cumulativeByDate: Array<{ date: string; cumulative: number }> = [];
  let running = 0;
  for (const entry of chronologicalEntries) {
    running += entry.contribution;
    cumulativeByDate.push({ date: entry.date, cumulative: running });
  }

  // Evaluate dynamic milestones
  const evaluatedMilestones: EvaluatedMilestone[] = plan.milestones.map((m) => {
    const targetValue = Math.round(((m.targetPercent / 100) * plan.targetValue) * 100) / 100;
    const reachedMatch = cumulativeByDate.find(
      (item) => item.cumulative >= targetValue && item.date <= asOfDate,
    );

    return {
      id: m.id,
      title: m.title,
      targetPercent: m.targetPercent,
      targetValue,
      isReached: !!reachedMatch,
      reachedDate: reachedMatch?.date,
      reachedValue: reachedMatch?.cumulative,
    };
  });

  // Calculate day metrics
  const totalDays = Math.max(1, getDaysDifference(plan.startDate, plan.targetDate));
  const elapsedDays = Math.max(0, getDaysDifference(plan.startDate, asOfDate));
  const remainingDays = Math.max(0, getDaysDifference(asOfDate, plan.targetDate));

  // Trajectory chart series (daily granularity from startDate to targetDate)
  const chartData: PlanTrajectoryDataPoint[] = [];
  const startObj = parseCalendarDate(plan.startDate);
  const targetObj = parseCalendarDate(plan.targetDate);

  const dailyContributionMap = new Map<string, number>();
  for (const entry of chronologicalEntries) {
    const prev = dailyContributionMap.get(entry.date) || 0;
    dailyContributionMap.set(entry.date, prev + entry.contribution);
  }

  let runningChartActual = 0;
  const currentCursor = new Date(startObj);
  let dayIdx = 0;

  while (currentCursor.getTime() <= targetObj.getTime()) {
    const dateStr = formatCalendarDate(currentCursor);
    const dayContribution = dailyContributionMap.get(dateStr) || 0;
    runningChartActual += dayContribution;

    const exp = calculateExpectedProgress(
      plan.targetValue,
      plan.startDate,
      plan.targetDate,
      plan.pacingType,
      dateStr,
    );

    const isFuture = dateStr > asOfDate;

    chartData.push({
      date: dateStr,
      dayIndex: dayIdx,
      expectedValue: exp.expectedValue,
      expectedPercent: exp.expectedPercent,
      actualValue: isFuture ? null : Math.round(runningChartActual * 100) / 100,
      actualPercent: isFuture
        ? null
        : plan.targetValue > 0
        ? Math.round((runningChartActual / plan.targetValue) * 1000) / 10
        : 0,
      dailyContribution: dayContribution,
    });

    // Advance 1 day UTC
    currentCursor.setUTCDate(currentCursor.getUTCDate() + 1);
    dayIdx++;
  }

  // Linked entries sorted descending for UI inspection
  const descendingEntries = [...normalizedEntries].sort(
    (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
  );

  return {
    asOfDate,
    totalDays,
    elapsedDays,
    remainingDays,
    expectedValue,
    expectedPercent,
    actualValue: roundedActualValue,
    actualPercent,
    varianceValue,
    variancePercent,
    paceStatus,
    isComplete: roundedActualValue >= plan.targetValue,
    milestones: evaluatedMilestones,
    chartData,
    linkedEntries: descendingEntries,
  };
}
