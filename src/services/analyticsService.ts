import {
  ActivityCategory,
  CategoryMonthlyMetrics,
  DailyRecord,
} from '../types';
import { getDaysInMonth, formatDateKey } from '../utils/dateUtils';
import { getAllDailyRecords } from './storage';

export function calculateMonthlyCategoryMetrics(
  category: ActivityCategory,
  year: number,
  month: number,
  allRecords: Record<string, DailyRecord> = getAllDailyRecords()
): CategoryMonthlyMetrics {
  const daysInMonth = getDaysInMonth(year, month);
  const trendData: Array<{ date: string; day: number; value: number }> = [];

  let activeDaysCount = 0;
  let totalEntriesCount = 0;

  // Trackers for category-specific stats
  let workTasksCount = 0;
  let workProblemsCount = 0;
  let workOrgs = new Set<string>();

  let workoutSessionsCount = 0;
  let totalWorkoutMinutes = 0;
  let cardioSessionsCount = 0;
  let heavySetsCount = 0;

  let learningMinutes = 0;
  let conceptsExploredCount = 0;
  let learningProblemsSolvedCount = 0;

  let projectUpdatesCount = 0;
  let projectTasksCount = 0;
  let uniqueProjects = new Set<string>();

  let personalEventsCount = 0;
  let personalMilestonesCount = 0;

  let sleepDaysCount = 0;
  let totalSleepHours = 0;
  let habitsAttempted = 0;
  let habitsCompleted = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(year, month, d);
    const rec = allRecords[dateKey];
    let dailyValue = 0;

    if (rec) {
      switch (category) {
        case 'work': {
          const entries = rec.work || [];
          if (entries.length > 0) {
            activeDaysCount++;
            totalEntriesCount += entries.length;
            entries.forEach((w) => {
              workTasksCount += w.tasksPerformed?.length || 0;
              if (w.problemsIdentified) workProblemsCount++;
              if (w.organization) workOrgs.add(w.organization);
              dailyValue += (w.tasksPerformed?.length || 1);
            });
          }
          break;
        }

        case 'fitness': {
          const entries = rec.fitness || [];
          if (entries.length > 0) {
            activeDaysCount++;
            totalEntriesCount += entries.length;
            entries.forEach((f) => {
              workoutSessionsCount++;
              totalWorkoutMinutes += f.workoutDurationMinutes || 0;
              if (f.cardio) cardioSessionsCount++;
              f.exercises?.forEach((ex) => {
                heavySetsCount += ex.sets || 0;
              });
              dailyValue += (f.workoutDurationMinutes || 30);
            });
          }
          break;
        }

        case 'learning': {
          const entries = rec.learning || [];
          if (entries.length > 0) {
            activeDaysCount++;
            totalEntriesCount += entries.length;
            entries.forEach((l) => {
              learningMinutes += l.studyDurationMinutes || 0;
              if (l.technologyOrConcept) conceptsExploredCount++;
              learningProblemsSolvedCount += l.problemsSolved?.length || 0;
              dailyValue += (l.studyDurationMinutes || 15);
            });
          }
          break;
        }

        case 'project': {
          const entries = rec.projects || [];
          if (entries.length > 0) {
            activeDaysCount++;
            totalEntriesCount += entries.length;
            entries.forEach((p) => {
              projectUpdatesCount++;
              if (p.projectName) uniqueProjects.add(p.projectName);
              projectTasksCount += p.tasksCompleted?.length || 0;
              dailyValue += (p.tasksCompleted?.length || 1);
            });
          }
          break;
        }

        case 'personal': {
          const entries = rec.personal || [];
          if (entries.length > 0) {
            activeDaysCount++;
            totalEntriesCount += entries.length;
            entries.forEach((pe) => {
              personalEventsCount++;
              if (pe.type === 'milestone') personalMilestonesCount++;
              dailyValue += 1;
            });
          }
          break;
        }

        case 'health': {
          const h = rec.health;
          if (h) {
            activeDaysCount++;
            totalEntriesCount += 1;
            if (h.sleepHours) {
              sleepDaysCount++;
              totalSleepHours += h.sleepHours;
            }
            if (h.habits && h.habits.length > 0) {
              habitsAttempted += h.habits.length;
              habitsCompleted += h.habits.filter((hb) => hb.completed).length;
            }
            dailyValue = h.sleepHours || 8;
          }
          break;
        }
      }
    }

    trendData.push({
      date: dateKey,
      day: d,
      value: dailyValue,
    });
  }

  // Construct label & metric triplets
  switch (category) {
    case 'work':
      return {
        category,
        categoryLabel: 'Work & Professional',
        activeDaysCount,
        totalEntriesCount,
        metric1: { label: 'Workdays Logged', value: activeDaysCount },
        metric2: { label: 'Tasks Completed', value: workTasksCount },
        metric3: { label: 'Problems Solved', value: workProblemsCount },
        trendData,
      };

    case 'fitness':
      return {
        category,
        categoryLabel: 'Physical & Fitness',
        activeDaysCount,
        totalEntriesCount,
        metric1: { label: 'Workout Sessions', value: workoutSessionsCount },
        metric2: { label: 'Total Training', value: `${Math.round(totalWorkoutMinutes / 60 * 10) / 10} hrs` },
        metric3: { label: 'Total Sets Executed', value: heavySetsCount },
        trendData,
      };

    case 'learning':
      return {
        category,
        categoryLabel: 'Learning & Education',
        activeDaysCount,
        totalEntriesCount,
        metric1: { label: 'Study Time', value: `${Math.round(learningMinutes / 60 * 10) / 10} hrs` },
        metric2: { label: 'Concepts Explored', value: conceptsExploredCount },
        metric3: { label: 'Problems Solved', value: learningProblemsSolvedCount },
        trendData,
      };

    case 'project':
      return {
        category,
        categoryLabel: 'Personal Projects',
        activeDaysCount,
        totalEntriesCount,
        metric1: { label: 'Active Projects', value: uniqueProjects.size },
        metric2: { label: 'Milestone Updates', value: projectUpdatesCount },
        metric3: { label: 'Tasks Completed', value: projectTasksCount },
        trendData,
      };

    case 'personal':
      return {
        category,
        categoryLabel: 'Personal Life',
        activeDaysCount,
        totalEntriesCount,
        metric1: { label: 'Days Logged', value: activeDaysCount },
        metric2: { label: 'Significant Moments', value: personalEventsCount },
        metric3: { label: 'Key Milestones', value: personalMilestonesCount },
        trendData,
      };

    case 'health':
      const avgSleep = sleepDaysCount > 0 ? (totalSleepHours / sleepDaysCount).toFixed(1) : '—';
      const habitRate = habitsAttempted > 0 ? `${Math.round((habitsCompleted / habitsAttempted) * 100)}%` : '—';
      return {
        category,
        categoryLabel: 'Health & Habits',
        activeDaysCount,
        totalEntriesCount,
        metric1: { label: 'Avg Sleep Duration', value: avgSleep !== '—' ? `${avgSleep}h` : '—' },
        metric2: { label: 'Habit Consistency', value: habitRate },
        metric3: { label: 'Days Tracked', value: activeDaysCount },
        trendData,
      };
  }
}

export function getAllCategoriesMonthlyMetrics(
  year: number,
  month: number,
  allRecords: Record<string, DailyRecord> = getAllDailyRecords()
): CategoryMonthlyMetrics[] {
  const categories: ActivityCategory[] = ['work', 'fitness', 'learning', 'project', 'personal', 'health'];
  return categories.map((cat) => calculateMonthlyCategoryMetrics(cat, year, month, allRecords));
}

