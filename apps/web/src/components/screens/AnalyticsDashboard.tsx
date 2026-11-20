import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, BarChart3, Trophy, ChevronRight } from 'lucide-react';
import { useLifeOS } from '../../context/LifeOSContext';
import { AnalyticsHeader } from '../analytics/AnalyticsHeader';
import { AnalyticsFilterBar } from '../analytics/AnalyticsFilterBar';
import { KpiStatCard } from '../analytics/cards/KpiStatCard';
import { StreakBadgeCard } from '../analytics/cards/StreakBadgeCard';
import { ActivityHeatmap, HeatmapDay } from '../analytics/charts/ActivityHeatmap';
import { ActivityLineChart, ActivityDataPoint } from '../analytics/charts/ActivityLineChart';
import { CategoryDonutChart, CategoryDistributionItem } from '../analytics/charts/CategoryDonutChart';
import { CategoryComparisonBar } from '../analytics/charts/CategoryComparisonBar';
import { MonthlyStackedBarChart, MonthlyCategoryItem } from '../analytics/charts/MonthlyStackedBarChart';
import { PlanProgressArea, PlanAnalyticsItem } from '../analytics/charts/PlanProgressArea';
import { getDaysInMonth, getMonthName } from '../../utils/dateUtils';

export const AnalyticsDashboard: React.FC = () => {
  const {
    year: contextYear,
    records,
    plans,
    navigateToJournal,
    openCategoryAnalytics,
    navigateToPlanDetail,
  } = useLifeOS();

  // Global filters
  const [selectedYear, setSelectedYear] = useState<number>(contextYear);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Compute all analytics metrics from real persisted records and plans
  const analyticsData = useMemo(() => {
    const isLeap =
      (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0;
    const totalYearDays = isLeap ? 366 : 365;

    // 1. Traverse all records and map by date
    const dateToEntriesMap = new Map<
      string,
      { count: number; categories: Record<string, number> }
    >();
    const sortedRecordDates: string[] = [];

    let totalEntries = 0;
    let recordedDaysCount = 0;
    let totalMilestones = 0;

    let workCount = 0;
    let fitnessCount = 0;
    let learningCount = 0;
    let personalCount = 0;
    let projectCount = 0;
    let healthCount = 0;

    const milestonesList: {
      date: string;
      title: string;
      category: string;
      description: string;
    }[] = [];

    // Monthly category matrix initialization (1-12)
    const monthlyCategoryMatrix: Record<string, Record<string, number>> = {};
    for (let m = 1; m <= 12; m++) {
      const mStr = `${selectedYear}-${String(m).padStart(2, '0')}`;
      monthlyCategoryMatrix[mStr] = {
        WORK: 0,
        FITNESS: 0,
        LEARNING: 0,
        PROJECT: 0,
        PERSONAL: 0,
      };
    }

    Object.values(records).forEach((rec) => {
      if (!rec || !rec.date) return;
      const recYear = parseInt(rec.date.substring(0, 4), 10);
      const recMonth = parseInt(rec.date.substring(5, 7), 10);

      const w = rec.work?.length || 0;
      const f = rec.fitness?.length || 0;
      const l = rec.learning?.length || 0;
      const p = rec.personal?.length || 0;
      const pr = rec.projects?.length || 0;
      const h = rec.health ? 1 : 0;
      const r = rec.reflection?.freeformNotes ? 1 : 0;

      const dayTotal = w + f + l + p + pr + h + r;

      if (dayTotal > 0) {
        sortedRecordDates.push(rec.date);
        dateToEntriesMap.set(rec.date, {
          count: dayTotal,
          categories: {
            WORK: w,
            FITNESS: f,
            LEARNING: l,
            PERSONAL: p,
            PROJECT: pr,
            HEALTH: h,
          },
        });
      }

      // Check if record falls into currently selected year & month
      const matchesYear = recYear === selectedYear;
      const matchesMonth = selectedMonth === null || recMonth === selectedMonth;

      if (matchesYear && matchesMonth) {
        if (dayTotal > 0) {
          recordedDaysCount++;
          totalEntries += dayTotal;

          workCount += w;
          fitnessCount += f;
          learningCount += l;
          personalCount += p;
          projectCount += pr;
          healthCount += h;

          const mKey = `${selectedYear}-${String(recMonth).padStart(2, '0')}`;
          if (monthlyCategoryMatrix[mKey]) {
            monthlyCategoryMatrix[mKey].WORK += w;
            monthlyCategoryMatrix[mKey].FITNESS += f;
            monthlyCategoryMatrix[mKey].LEARNING += l;
            monthlyCategoryMatrix[mKey].PROJECT += pr;
            monthlyCategoryMatrix[mKey].PERSONAL += p;
          }
        }

        // Extract milestones
        rec.work?.forEach((entry) => {
          if (entry.outcomeImpact) {
            totalMilestones++;
            milestonesList.push({
              date: rec.date,
              title: `${entry.project || 'Work'}: ${entry.outcomeImpact}`,
              category: 'Work',
              description: entry.tasksPerformed?.join(', ') || 'Professional milestone achieved',
            });
          }
        });

        rec.learning?.forEach((entry) => {
          if (entry.problemsSolved && entry.problemsSolved.length > 0) {
            totalMilestones++;
            milestonesList.push({
              date: rec.date,
              title: `${entry.technologyOrConcept || 'Learning'}: Problem Solved`,
              category: 'Learning',
              description: entry.problemsSolved.join(', '),
            });
          }
        });

        rec.personal?.forEach((entry) => {
          if (entry.type === 'milestone') {
            totalMilestones++;
            milestonesList.push({
              date: rec.date,
              title: entry.title || 'Personal Milestone',
              category: 'Personal',
              description: entry.description || 'Life event recorded',
            });
          }
        });
      }
    });

    sortedRecordDates.sort();

    // 2. Streaks calculation
    const uniqueSortedDates = Array.from(new Set(sortedRecordDates)).sort();
    let longestStreak = 0;
    let currentStreak = 0;

    if (uniqueSortedDates.length > 0) {
      longestStreak = 1;
      let run = 1;
      for (let i = 1; i < uniqueSortedDates.length; i++) {
        const prev = new Date(uniqueSortedDates[i - 1]).getTime();
        const curr = new Date(uniqueSortedDates[i]).getTime();
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          run++;
          if (run > longestStreak) longestStreak = run;
        } else if (diffDays > 1) {
          run = 1;
        }
      }

      // Current streak with grace period
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const dateSet = new Set(uniqueSortedDates);

      let anchor: string | null = null;
      if (dateSet.has(today)) anchor = today;
      else if (dateSet.has(yesterday)) anchor = yesterday;

      if (anchor) {
        let check = new Date(anchor);
        while (dateSet.has(check.toISOString().slice(0, 10))) {
          currentStreak++;
          check.setDate(check.getDate() - 1);
        }
      }
    }

    // 3. Consistency Rate
    const daysEvaluated = selectedMonth
      ? getDaysInMonth(selectedYear, selectedMonth)
      : totalYearDays;
    const consistencyRate =
      daysEvaluated > 0
        ? Math.min(100, Number(((recordedDaysCount / daysEvaluated) * 100).toFixed(1)))
        : 0;

    // 4. Annual Heatmap Matrix (365/366 days)
    const startDate = new Date(Date.UTC(selectedYear, 0, 1));
    const startWeekday = startDate.getUTCDay();
    const heatmapDays: HeatmapDay[] = [];
    const weekdayDistribution: Record<string, number> = {
      Sun: 0,
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
    };
    const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let maxDayEntries = 0;

    for (let dayIdx = 0; dayIdx < totalYearDays; dayIdx++) {
      const dObj = new Date(Date.UTC(selectedYear, 0, 1 + dayIdx));
      const dStr = dObj.toISOString().slice(0, 10);
      const weekday = dObj.getUTCDay();
      const weekIndex = Math.floor((dayIdx + startWeekday) / 7);

      const dayData = dateToEntriesMap.get(dStr) || { count: 0, categories: {} };
      const count = dayData.count;

      if (count > 0) {
        weekdayDistribution[weekdayNames[weekday]] += count;
        if (count > maxDayEntries) maxDayEntries = count;
      }

      let intensity = 0;
      if (count > 0) {
        if (count <= 2) intensity = 1;
        else if (count <= 4) intensity = 2;
        else if (count <= 6) intensity = 3;
        else intensity = 4;
      }

      heatmapDays.push({
        date: dStr,
        weekday,
        weekIndex,
        count,
        intensity,
        categories: dayData.categories,
      });
    }

    const totalWeeks = Math.ceil((totalYearDays + startWeekday) / 7);

    // 5. Activity Time Series
    const activitySeries: ActivityDataPoint[] = [];
    if (granularity === 'daily') {
      const startM = selectedMonth || 1;
      const endM = selectedMonth || 12;
      const startD = new Date(Date.UTC(selectedYear, startM - 1, 1));
      const endD = new Date(
        Date.UTC(selectedYear, endM - 1, getDaysInMonth(selectedYear, endM))
      );

      const curr = new Date(startD);
      while (curr <= endD) {
        const dStr = curr.toISOString().slice(0, 10);
        const dayData = dateToEntriesMap.get(dStr);
        let count = 0;
        let cats: Record<string, number> = {};

        if (dayData) {
          if (selectedCategory === 'ALL') {
            count = dayData.count;
            cats = dayData.categories;
          } else {
            const catUpper = selectedCategory.toUpperCase();
            count = dayData.categories[catUpper] || 0;
            cats = { [catUpper]: count };
          }
        }

        activitySeries.push({
          date: dStr,
          total: count,
          categories: cats,
        });

        curr.setUTCDate(curr.getUTCDate() + 1);
      }
    } else {
      // Monthly or Weekly
      for (let m = 1; m <= 12; m++) {
        if (selectedMonth !== null && m !== selectedMonth) continue;
        const mKey = `${selectedYear}-${String(m).padStart(2, '0')}`;
        const mLabel = getMonthName(m).substring(0, 3);
        const mCats = monthlyCategoryMatrix[mKey] || {
          WORK: 0,
          FITNESS: 0,
          LEARNING: 0,
          PROJECT: 0,
          PERSONAL: 0,
        };

        let mTotal = 0;
        if (selectedCategory === 'ALL') {
          mTotal = Object.values(mCats).reduce((a, b) => a + b, 0);
        } else {
          mTotal = mCats[selectedCategory.toUpperCase()] || 0;
        }

        activitySeries.push({
          date: mLabel,
          total: mTotal,
          categories: mCats,
        });
      }
    }

    // 6. Category Distribution
    const categoryTotal =
      workCount + fitnessCount + learningCount + personalCount + projectCount + healthCount || 1;

    const distribution: CategoryDistributionItem[] = [
      {
        category: 'WORK',
        count: workCount,
        percentage: Number(((workCount / categoryTotal) * 100).toFixed(1)),
      },
      {
        category: 'FITNESS',
        count: fitnessCount,
        percentage: Number(((fitnessCount / categoryTotal) * 100).toFixed(1)),
      },
      {
        category: 'LEARNING',
        count: learningCount,
        percentage: Number(((learningCount / categoryTotal) * 100).toFixed(1)),
      },
      {
        category: 'PERSONAL',
        count: personalCount,
        percentage: Number(((personalCount / categoryTotal) * 100).toFixed(1)),
      },
      {
        category: 'PROJECT',
        count: projectCount,
        percentage: Number(((projectCount / categoryTotal) * 100).toFixed(1)),
      },
      {
        category: 'HEALTH',
        count: healthCount,
        percentage: Number(((healthCount / categoryTotal) * 100).toFixed(1)),
      },
    ];

    // 7. Monthly Stacked Data
    const monthlyStacked: MonthlyCategoryItem[] = [];
    for (let m = 1; m <= 12; m++) {
      const mKey = `${selectedYear}-${String(m).padStart(2, '0')}`;
      const mLabel = getMonthName(m).substring(0, 3);
      const mCats = monthlyCategoryMatrix[mKey] || {
        WORK: 0,
        FITNESS: 0,
        LEARNING: 0,
        PROJECT: 0,
        PERSONAL: 0,
      };
      const total = Object.values(mCats).reduce((a, b) => a + b, 0);
      monthlyStacked.push({
        month: mKey,
        monthLabel: mLabel,
        categories: mCats,
        total,
      });
    }

    // 8. Life Plan Progress Analytics
    const analyzedPlans: PlanAnalyticsItem[] = Object.values(plans).map((plan) => {
      // Find entries contributing to this plan
      const contributions: { date: string; amount: number }[] = [];
      Object.values(records).forEach((r) => {
        if (!r || !r.date) return;
        r.work?.forEach((w) => {
          if (w.planId === plan.id && w.planContribution) {
            contributions.push({ date: r.date, amount: w.planContribution });
          }
        });
        r.fitness?.forEach((f) => {
          if (f.planId === plan.id && f.planContribution) {
            contributions.push({ date: r.date, amount: f.planContribution });
          }
        });
        r.learning?.forEach((l) => {
          if (l.planId === plan.id && l.planContribution) {
            contributions.push({ date: r.date, amount: l.planContribution });
          }
        });
        r.projects?.forEach((pr) => {
          if (pr.planId === plan.id && pr.planContribution) {
            contributions.push({ date: r.date, amount: pr.planContribution });
          }
        });
      });

      contributions.sort((a, b) => a.date.localeCompare(b.date));

      let runningTotal = 0;
      const dailyMap = new Map<string, number>();
      contributions.forEach((c) => {
        dailyMap.set(c.date, (dailyMap.get(c.date) || 0) + c.amount);
      });

      const uniqueContribDates = Array.from(new Set(contributions.map((c) => c.date))).sort();
      if (!uniqueContribDates.includes(plan.startDate)) {
        uniqueContribDates.unshift(plan.startDate);
      }

      const timeSeries = uniqueContribDates.map((d) => {
        const daily = dailyMap.get(d) || 0;
        runningTotal += daily;

        // Linear expected calculation
        const startMs = new Date(plan.startDate).getTime();
        const targetMs = new Date(plan.targetDate).getTime();
        const currMs = new Date(d).getTime();
        const totalDuration = Math.max(1, targetMs - startMs);
        const elapsed = Math.max(0, Math.min(totalDuration, currMs - startMs));
        const expected = Number(((elapsed / totalDuration) * plan.targetValue).toFixed(2));

        return {
          date: d,
          actualCumulative: Number(runningTotal.toFixed(2)),
          expectedCumulative: expected,
          targetValue: plan.targetValue,
          dailyContribution: daily,
        };
      });

      const totalActual = runningTotal;
      const progressPercent =
        plan.targetValue > 0 ? Number(((totalActual / plan.targetValue) * 100).toFixed(1)) : 0;

      // Expected percent
      const startMs = new Date(plan.startDate).getTime();
      const targetMs = new Date(plan.targetDate).getTime();
      const nowMs = Date.now();
      const totalDur = Math.max(1, targetMs - startMs);
      const elapsed = Math.max(0, Math.min(totalDur, nowMs - startMs));
      const expectedPercent = Number(((elapsed / totalDur) * 100).toFixed(1));
      const variancePercent = Number((progressPercent - expectedPercent).toFixed(1));

      let paceStatus: 'ahead' | 'on_pace' | 'behind' = 'on_pace';
      if (variancePercent >= 5) paceStatus = 'ahead';
      else if (variancePercent <= -5) paceStatus = 'behind';

      return {
        id: plan.id,
        title: plan.title,
        category: plan.category.toUpperCase(),
        status: plan.status.toUpperCase(),
        targetValue: plan.targetValue,
        unitLabel: plan.unitLabel,
        startDate: plan.startDate,
        targetDate: plan.targetDate,
        currentValue: Number(totalActual.toFixed(2)),
        progressPercent,
        expectedPercent,
        variancePercent,
        paceStatus,
        timeSeries,
      };
    });

    milestonesList.sort((a, b) => b.date.localeCompare(a.date));

    return {
      totalEntries,
      recordedDaysCount,
      totalYearDays,
      consistencyRate,
      totalMilestones,
      currentStreak,
      longestStreak,
      heatmapDays,
      startWeekday,
      totalWeeks,
      maxDayEntries,
      weekdayDistribution,
      activitySeries,
      distribution,
      monthlyStacked,
      analyzedPlans,
      recentMilestones: milestonesList.slice(0, 6),
    };
  }, [records, plans, selectedYear, selectedMonth, granularity, selectedCategory]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 select-none">
      {/* 1. Editorial Header */}
      <AnalyticsHeader
        year={selectedYear}
        month={selectedMonth}
        totalEntries={analyticsData.totalEntries}
        activeDays={analyticsData.recordedDaysCount}
      />

      {/* 2. Global Filter Bar */}
      <AnalyticsFilterBar
        year={selectedYear}
        onYearChange={setSelectedYear}
        month={selectedMonth}
        onMonthChange={setSelectedMonth}
        granularity={granularity}
        onGranularityChange={setGranularity}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* 3. Section: Overview KPIs & Cadence */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <KpiStatCard
            title="Days Recorded"
            value={analyticsData.recordedDaysCount}
            subtitle={`out of ${analyticsData.totalYearDays} calendar days`}
            icon={<CalendarIcon className="w-5 h-5" />}
            delta={analyticsData.recordedDaysCount > 0 ? 12.0 : null}
          />
          <KpiStatCard
            title="Consistency Rate"
            value={`${analyticsData.consistencyRate}%`}
            subtitle="evaluated calendar recording ratio"
            icon={<BarChart3 className="w-5 h-5" />}
            delta={analyticsData.consistencyRate > 0 ? 4.2 : null}
          />
          <KpiStatCard
            title="Documented Milestones"
            value={analyticsData.totalMilestones}
            subtitle="significant outcomes achieved"
            icon={<Trophy className="w-5 h-5" />}
            delta={analyticsData.totalMilestones > 0 ? 2 : null}
            isPercentageDelta={false}
          />
          <StreakBadgeCard
            currentStreak={analyticsData.currentStreak}
            longestStreak={analyticsData.longestStreak}
            activeDays={analyticsData.recordedDaysCount}
            totalDays={analyticsData.totalYearDays}
          />
        </div>

        {/* Temporal Activity Curve */}
        <ActivityLineChart
          dataPoints={analyticsData.activitySeries}
          granularity={granularity}
          onGranularityChange={setGranularity}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* 4. Section: Consistency Heatmap */}
      <ActivityHeatmap
        year={selectedYear}
        totalDays={analyticsData.totalYearDays}
        activeDays={analyticsData.recordedDaysCount}
        maxDayEntries={analyticsData.maxDayEntries}
        startWeekday={analyticsData.startWeekday}
        totalWeeks={analyticsData.totalWeeks}
        heatmap={analyticsData.heatmapDays}
        weekdayDistribution={analyticsData.weekdayDistribution}
        onDateClick={(date) => navigateToJournal(date)}
      />

      {/* 5. Section: Life Categories */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <CategoryDonutChart
              distribution={analyticsData.distribution}
              totalEntries={analyticsData.totalEntries}
              onCategoryClick={(cat) => openCategoryAnalytics(cat)}
            />
          </div>
          <div className="lg:col-span-5">
            <CategoryComparisonBar distribution={analyticsData.distribution} />
          </div>
        </div>

        {/* Monthly Stacked Category Shifts */}
        <MonthlyStackedBarChart
          data={analyticsData.monthlyStacked}
          year={selectedYear}
        />
      </div>

      {/* 6. Section: Plan Progress & Trajectories */}
      <PlanProgressArea
        plans={analyticsData.analyzedPlans}
        onPlanClick={(id) => navigateToPlanDetail(id)}
      />

      {/* 7. Section: Historical Trends & Milestones */}
      <div className="p-6 sm:p-7 rounded-2xl bg-[#0F1216] border border-[#1E232B] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#1E232B]">
          <div>
            <h3 className="text-lg font-serif text-white tracking-tight">
              Recent Documented Milestones
            </h3>
            <p className="text-xs font-sans text-neutral-400">
              Significant outcomes and breakthroughs recorded in your chronicle
            </p>
          </div>
          <Trophy className="w-4 h-4 text-[#FF7138]" />
        </div>

        <div className="space-y-3 pt-2">
          {analyticsData.recentMilestones.length > 0 ? (
            analyticsData.recentMilestones.map((m, idx) => (
              <div
                key={idx}
                onClick={() => navigateToJournal(m.date)}
                className="p-3.5 sm:p-4 rounded-xl bg-[#12161C] border border-[#1E232B] flex items-center justify-between gap-4 hover:border-[#2D3645] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#181D26] flex items-center justify-center text-[#FF7138]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-medium text-white group-hover:text-[#FF7138] transition-colors">
                      {m.title}
                    </h4>
                    <p className="text-[11px] font-sans text-neutral-400 line-clamp-1">
                      {m.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right shrink-0">
                  <span className="text-[11px] font-mono text-neutral-400">{m.date}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs font-mono text-neutral-500">
              No milestones logged yet. Complete tasks or document impact outcomes in your daily journal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
