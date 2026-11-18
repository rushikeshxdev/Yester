import {
  LifePlan,
  DailyRecord,
  PlanProgressSummary,
  EvaluatedMilestone,
  LinkedPlanEntry,
  PlanTrajectoryDataPoint,
  PaceStatus,
} from '../types';

/**
 * Safely parses YYYY-MM-DD into a UTC calendar Date object (00:00:00 UTC)
 * avoiding local timezone offsets or daylight saving jumps.
 */
export function parseDateUTC(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  return new Date(Date.UTC(year, month, day));
}

/**
 * Formats a Date object as YYYY-MM-DD.
 */
export function formatDateUTC(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Calculates calendar days between two YYYY-MM-DD dates inclusive of start.
 */
export function getDaysDifference(startStr: string, endStr: string): number {
  const start = parseDateUTC(startStr).getTime();
  const end = parseDateUTC(endStr).getTime();
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Validates a plan payload before creation or update.
 */
export function validatePlan(plan: Partial<LifePlan>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!plan.title || !plan.title.trim()) {
    errors.push('Plan title is required.');
  }

  if (!plan.statement || !plan.statement.trim()) {
    errors.push('Intention statement is required.');
  }

  if (!plan.category) {
    errors.push('Trackable category is required.');
  }

  if (!plan.unitLabel || !plan.unitLabel.trim()) {
    errors.push('Progress unit label is required.');
  }

  if (plan.targetValue === undefined || plan.targetValue === null || plan.targetValue <= 0) {
    errors.push('Target value must be greater than zero.');
  }

  if (!plan.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(plan.startDate)) {
    errors.push('Valid start date (YYYY-MM-DD) is required.');
  }

  if (!plan.targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(plan.targetDate)) {
    errors.push('Valid target date (YYYY-MM-DD) is required.');
  }

  if (plan.startDate && plan.targetDate && plan.targetDate < plan.startDate) {
    errors.push('Target date cannot precede start date.');
  }

  if (plan.milestones && Array.isArray(plan.milestones)) {
    const seenPercents = new Set<number>();
    for (const m of plan.milestones) {
      if (!m.title || !m.title.trim()) {
        errors.push('Every milestone must have a title.');
        break;
      }
      if (m.targetPercent <= 0 || m.targetPercent > 100) {
        errors.push(`Milestone "${m.title}" percentage must be between 1 and 100.`);
        break;
      }
      if (seenPercents.has(m.targetPercent)) {
        errors.push(`Duplicate milestone percentage: ${m.targetPercent}%.`);
        break;
      }
      seenPercents.add(m.targetPercent);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Evaluates the pacing curve factor f(t) for a normalized elapsed time t in [0, 1].
 */
export function calculatePacingFactor(
  pacingType: LifePlan['pacingType'],
  t: number
): number {
  // Clamp t between 0 and 1
  const clampedT = Math.max(0, Math.min(1, t));

  switch (pacingType) {
    case 'linear':
      return clampedT;

    case 'ramp_up':
      // Concave up: starts slow, accelerates toward target
      return Math.pow(clampedT, 1.4);

    case 'front_loaded':
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
  plan: LifePlan,
  asOfDate: string
): { expectedValue: number; expectedPercent: number; normalizedT: number } {
  if (asOfDate < plan.startDate) {
    return { expectedValue: 0, expectedPercent: 0, normalizedT: 0 };
  }

  if (asOfDate >= plan.targetDate) {
    return { expectedValue: plan.targetValue, expectedPercent: 100, normalizedT: 1 };
  }

  const totalDays = Math.max(1, getDaysDifference(plan.startDate, plan.targetDate));
  const elapsedDays = Math.max(0, getDaysDifference(plan.startDate, asOfDate));

  const t = elapsedDays / totalDays;
  const factor = calculatePacingFactor(plan.pacingType, t);

  const expectedValue = Math.round(factor * plan.targetValue * 100) / 100;
  const expectedPercent = Math.round(factor * 1000) / 10;

  return {
    expectedValue,
    expectedPercent,
    normalizedT: t,
  };
}

/**
 * Collects linked daily entries for a plan from daily records.
 */
export function extractLinkedEntries(
  plan: LifePlan,
  records: Record<string, DailyRecord>
): LinkedPlanEntry[] {
  const linked: LinkedPlanEntry[] = [];

  for (const [date, record] of Object.entries(records)) {
    if (!record) continue;

    if (plan.category === 'work' && Array.isArray(record.work)) {
      for (const w of record.work) {
        if (w.planId === plan.id) {
          linked.push({
            entryId: w.id,
            date: w.date || date,
            category: 'work',
            title: `${w.organization || 'Work'}: ${w.project || 'Project'}`,
            contribution: typeof w.planContribution === 'number' && w.planContribution > 0 ? w.planContribution : 1,
            unitLabel: plan.unitLabel,
            notes: w.outcomeImpact || (w.tasksPerformed && w.tasksPerformed[0]) || '',
          });
        }
      }
    } else if (plan.category === 'fitness' && Array.isArray(record.fitness)) {
      for (const f of record.fitness) {
        if (f.planId === plan.id) {
          linked.push({
            entryId: f.id,
            date: f.date || date,
            category: 'fitness',
            title: `${f.workoutType} Session (${f.workoutDurationMinutes || 45}m)`,
            contribution: typeof f.planContribution === 'number' && f.planContribution > 0 ? f.planContribution : 1,
            unitLabel: plan.unitLabel,
            notes: f.notes || (f.muscleGroups && f.muscleGroups.join(', ')) || '',
          });
        }
      }
    } else if (plan.category === 'learning' && Array.isArray(record.learning)) {
      for (const l of record.learning) {
        if (l.planId === plan.id) {
          linked.push({
            entryId: l.id,
            date: l.date || date,
            category: 'learning',
            title: `${l.subject}: ${l.technologyOrConcept}`,
            contribution: typeof l.planContribution === 'number' && l.planContribution > 0 ? l.planContribution : 1,
            unitLabel: plan.unitLabel,
            notes: l.whatIUnderstood || l.notes || '',
          });
        }
      }
    } else if (plan.category === 'project' && Array.isArray(record.projects)) {
      for (const p of record.projects) {
        if (p.planId === plan.id) {
          linked.push({
            entryId: p.id,
            date: p.date || date,
            category: 'project',
            title: p.projectName,
            contribution: typeof p.planContribution === 'number' && p.planContribution > 0 ? p.planContribution : 1,
            unitLabel: plan.unitLabel,
            notes: p.objective || '',
          });
        }
      }
    } else if (plan.category === 'personal' && Array.isArray(record.personal)) {
      for (const pers of record.personal) {
        if (pers.planId === plan.id) {
          linked.push({
            entryId: pers.id,
            date: pers.date || date,
            category: 'personal',
            title: pers.title,
            contribution: typeof pers.planContribution === 'number' && pers.planContribution > 0 ? pers.planContribution : 1,
            unitLabel: plan.unitLabel,
            notes: pers.description || '',
          });
        }
      }
    }
  }

  // Sort linked entries descending by date, with stable deterministic secondary sort by entryId
  linked.sort((a, b) => b.date.localeCompare(a.date) || b.entryId.localeCompare(a.entryId));
  return linked;
}

/**
 * Derives comprehensive progress, pace variance, dynamic milestones,
 * and chart time-series data for a plan as of a given date.
 */
export function calculatePlanProgress(
  plan: LifePlan,
  records: Record<string, DailyRecord>,
  asOfDate: string = new Date().toISOString().split('T')[0]
): PlanProgressSummary {
  const allLinkedEntries = extractLinkedEntries(plan, records);

  // Filter valid contributions within plan timeline:
  // Exclude entries before plan start date, and entries later than asOfDate.
  // Entries after target date are included if they occur on or before asOfDate (late completion).
  const validContributionsUpToDate = allLinkedEntries.filter(
    (e) => e.date >= plan.startDate && e.date <= asOfDate
  );

  const actualValue = validContributionsUpToDate.reduce((sum, e) => sum + e.contribution, 0);
  const roundedActualValue = Math.round(actualValue * 100) / 100;
  const actualPercent =
    plan.targetValue > 0
      ? Math.round((roundedActualValue / plan.targetValue) * 1000) / 10
      : 0;

  // Expected progress
  const { expectedValue, expectedPercent } = calculateExpectedProgress(plan, asOfDate);

  // Variance
  const varianceValue = Math.round((roundedActualValue - expectedValue) * 100) / 100;
  const variancePercent = Math.round((actualPercent - expectedPercent) * 10) / 10;

  // Pace status
  let paceStatus: PaceStatus = 'on_pace';
  if (variancePercent >= 2.5) {
    paceStatus = 'ahead';
  } else if (variancePercent <= -2.5) {
    paceStatus = 'behind';
  }

  // Milestones evaluation (chronological accumulation with secondary ordering)
  const chronologicalEntries = [...validContributionsUpToDate].sort(
    (a, b) => a.date.localeCompare(b.date) || a.entryId.localeCompare(b.entryId)
  );
  
  // Build cumulative map by date
  const cumulativeByDate: Array<{ date: string; cumulative: number }> = [];
  let running = 0;
  for (const entry of chronologicalEntries) {
    running += entry.contribution;
    cumulativeByDate.push({ date: entry.date, cumulative: running });
  }

  const milestones: EvaluatedMilestone[] = plan.milestones.map((m) => {
    const targetValue = Math.round(((m.targetPercent / 100) * plan.targetValue) * 100) / 100;
    
    // Find first date where cumulative >= targetValue
    const reachedMatch = cumulativeByDate.find(
      (item) => item.cumulative >= targetValue && item.date <= asOfDate
    );

    return {
      ...m,
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
  const startObj = parseDateUTC(plan.startDate);
  const targetObj = parseDateUTC(plan.targetDate);

  // Group contributions by day
  const dailyContributionMap = new Map<string, number>();
  for (const entry of chronologicalEntries) {
    const prev = dailyContributionMap.get(entry.date) || 0;
    dailyContributionMap.set(entry.date, prev + entry.contribution);
  }

  let runningChartActual = 0;
  const currentCursor = new Date(startObj);
  let dayIdx = 0;

  while (currentCursor.getTime() <= targetObj.getTime()) {
    const dateStr = formatDateUTC(currentCursor);
    const dayContribution = dailyContributionMap.get(dateStr) || 0;
    runningChartActual += dayContribution;

    const exp = calculateExpectedProgress(plan, dateStr);

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

  return {
    plan,
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
    milestones,
    linkedEntries: allLinkedEntries,
    chartData,
  };
}

