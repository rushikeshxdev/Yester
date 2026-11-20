import { BadRequestException, Injectable } from '@nestjs/common';
import { ActivityCategory } from '@prisma/client';
import { formatCalendarDate, parseCalendarDate } from '../../common/utils/date.util';
import { PrismaService } from '../../prisma/prisma.service';
import {
  calculateConsistencyRate,
  calculatePeriodDelta,
  calculatePlanTimeSeries,
  calculateStreaks,
  CalendarHeatmapData,
  generateCalendarHeatmap,
  PlanAnalyticsItem,
} from './analytics.engine';
import { ActivitySeriesQueryDto } from './dto/activity-series-query.dto';
import { CategoryAnalyticsQueryDto } from './dto/category-analytics-query.dto';
import { OverviewQueryDto } from './dto/overview-query.dto';

const ALL_CATEGORIES: ActivityCategory[] = [
  ActivityCategory.WORK,
  ActivityCategory.FITNESS,
  ActivityCategory.LEARNING,
  ActivityCategory.PROJECT,
  ActivityCategory.PERSONAL,
];

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * High-level overview KPIs with period-over-period comparisons.
   */
  async getOverview(userId: string, query: OverviewQueryDto) {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const year = query.year ?? currentYear;
    const month = query.month ?? null;

    let startDate: Date;
    let endDate: Date;

    if (month !== null) {
      startDate = new Date(Date.UTC(year, month - 1, 1));
      const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
      endDate = new Date(Date.UTC(year, month - 1, daysInMonth));
    } else {
      startDate = new Date(Date.UTC(year, 0, 1));
      endDate = new Date(Date.UTC(year, 11, 31));
    }

    // Determine elapsed days up to current date for accurate denominator
    const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let effectiveEndDate: Date;
    if (endDate > todayUtc && startDate <= todayUtc) {
      effectiveEndDate = todayUtc;
    } else if (endDate <= todayUtc) {
      effectiveEndDate = endDate;
    } else {
      effectiveEndDate = startDate; // future window
    }

    const elapsedDays = Math.max(
      1,
      Math.round((effectiveEndDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
    );

    // 1. Fetch records and entries in current period
    const currentRecords = await this.prisma.dailyRecord.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        id: true,
        date: true,
        entries: {
          where: { deletedAt: null },
          select: { id: true, category: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    let totalEntries = 0;
    let recordedDays = 0;
    for (const rec of currentRecords) {
      if (rec.entries.length > 0) {
        recordedDays++;
        totalEntries += rec.entries.length;
      }
    }

    const consistencyRate = calculateConsistencyRate(recordedDays, elapsedDays);

    // 2. Fetch all historical active records for all-time streak calculations
    const allActiveRecords = await this.prisma.dailyRecord.findMany({
      where: {
        userId,
        deletedAt: null,
        entries: { some: { deletedAt: null } },
      },
      select: { date: true },
      orderBy: { date: 'asc' },
    });

    const uniqueDateStrs = Array.from(
      new Set(allActiveRecords.map((r) => formatCalendarDate(r.date))),
    ).sort();

    const streaks = calculateStreaks(uniqueDateStrs, formatCalendarDate(todayUtc));

    // 3. Active Plans count
    const activePlansCount = await this.prisma.lifePlan.count({
      where: { userId, status: 'ACTIVE', deletedAt: null },
    });

    // 4. Period-over-period comparison (equivalent elapsed window)
    let priorStartDate: Date;
    let priorEndDate: Date;

    if (month !== null) {
      const priorMonth = month === 1 ? 12 : month - 1;
      const priorYear = month === 1 ? year - 1 : year;
      priorStartDate = new Date(Date.UTC(priorYear, priorMonth - 1, 1));
      priorEndDate = new Date(
        Date.UTC(priorYear, priorMonth - 1, Math.min(elapsedDays, new Date(Date.UTC(priorYear, priorMonth, 0)).getUTCDate())),
      );
    } else {
      const priorYear = year - 1;
      priorStartDate = new Date(Date.UTC(priorYear, 0, 1));
      priorEndDate = new Date(Date.UTC(priorYear, 0, elapsedDays));
    }

    const priorRecords = await this.prisma.dailyRecord.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: priorStartDate, lte: priorEndDate },
      },
      select: {
        id: true,
        entries: {
          where: { deletedAt: null },
          select: { id: true },
        },
      },
    });

    let priorTotalEntries = 0;
    let priorRecordedDays = 0;
    for (const rec of priorRecords) {
      if (rec.entries.length > 0) {
        priorRecordedDays++;
        priorTotalEntries += rec.entries.length;
      }
    }

    const priorConsistencyRate = calculateConsistencyRate(priorRecordedDays, elapsedDays);

    const entriesDeltaPct = calculatePeriodDelta(totalEntries, priorRecords.length > 0 ? priorTotalEntries : null);
    const recordedDaysDeltaPct = calculatePeriodDelta(recordedDays, priorRecords.length > 0 ? priorRecordedDays : null);
    const consistencyDeltaPct =
      priorRecords.length > 0 ? Number((consistencyRate - priorConsistencyRate).toFixed(1)) : null;

    return {
      period: { year, month },
      kpis: {
        totalEntries,
        recordedDays,
        elapsedDays,
        consistencyRate,
        currentStreak: streaks.currentStreak,
        longestStreak: streaks.longestStreak,
        activePlansCount,
      },
      deltas: {
        entriesDeltaPct,
        recordedDaysDeltaPct,
        consistencyDeltaPct,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Chronological time series aggregated by daily, weekly, or monthly granularity.
   */
  async getActivitySeries(userId: string, query: ActivitySeriesQueryDto) {
    const startDate = parseCalendarDate(query.startDate);
    const endDate = parseCalendarDate(query.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }

    const granularity = query.granularity || 'daily';

    const records = await this.prisma.dailyRecord.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        date: true,
        entries: {
          where: {
            deletedAt: null,
            ...(query.category ? { category: query.category } : {}),
          },
          select: { id: true, category: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    // Map records by YYYY-MM-DD
    const recordsByDate = new Map<string, Record<ActivityCategory, number>>();
    for (const r of records) {
      const dStr = formatCalendarDate(r.date);
      const catCounts: Record<ActivityCategory, number> = {
        WORK: 0,
        FITNESS: 0,
        LEARNING: 0,
        PROJECT: 0,
        PERSONAL: 0,
      };
      for (const e of r.entries) {
        catCounts[e.category] = (catCounts[e.category] || 0) + 1;
      }
      recordsByDate.set(dStr, catCounts);
    }

    let totalEntries = 0;

    if (granularity === 'daily') {
      const dataPoints: {
        date: string;
        total: number;
        categories: Record<ActivityCategory, number>;
      }[] = [];

      const curr = new Date(startDate);
      while (curr <= endDate) {
        const dStr = formatCalendarDate(curr);
        const catCounts = recordsByDate.get(dStr) || {
          WORK: 0,
          FITNESS: 0,
          LEARNING: 0,
          PROJECT: 0,
          PERSONAL: 0,
        };
        const dayTotal = Object.values(catCounts).reduce((a, b) => a + b, 0);
        totalEntries += dayTotal;

        dataPoints.push({
          date: dStr,
          total: dayTotal,
          categories: catCounts,
        });

        curr.setUTCDate(curr.getUTCDate() + 1);
      }

      return {
        startDate: query.startDate,
        endDate: query.endDate,
        granularity,
        totalEntries,
        dataPoints,
      };
    }

    if (granularity === 'weekly') {
      const weeklyBuckets = new Map<
        string,
        { key: string; total: number; categories: Record<ActivityCategory, number> }
      >();

      const curr = new Date(startDate);
      while (curr <= endDate) {
        const dStr = formatCalendarDate(curr);
        // Find week start date (Monday)
        const dayOfWeek = curr.getUTCDay();
        const diff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
        const weekStart = new Date(curr);
        weekStart.setUTCDate(curr.getUTCDate() + diff);
        const weekKey = formatCalendarDate(weekStart);

        if (!weeklyBuckets.has(weekKey)) {
          weeklyBuckets.set(weekKey, {
            key: weekKey,
            total: 0,
            categories: { WORK: 0, FITNESS: 0, LEARNING: 0, PROJECT: 0, PERSONAL: 0 },
          });
        }

        const bucket = weeklyBuckets.get(weekKey)!;
        const catCounts = recordsByDate.get(dStr);
        if (catCounts) {
          for (const cat of ALL_CATEGORIES) {
            bucket.categories[cat] += catCounts[cat];
            bucket.total += catCounts[cat];
            totalEntries += catCounts[cat];
          }
        }

        curr.setUTCDate(curr.getUTCDate() + 1);
      }

      const dataPoints = Array.from(weeklyBuckets.values()).map((b) => ({
        date: b.key,
        total: b.total,
        categories: b.categories,
      }));

      return {
        startDate: query.startDate,
        endDate: query.endDate,
        granularity,
        totalEntries,
        dataPoints,
      };
    }

    // Monthly granularity
    const monthlyBuckets = new Map<
      string,
      { key: string; total: number; categories: Record<ActivityCategory, number> }
    >();

    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dStr = formatCalendarDate(curr);
      const monthKey = dStr.slice(0, 7); // YYYY-MM

      if (!monthlyBuckets.has(monthKey)) {
        monthlyBuckets.set(monthKey, {
          key: monthKey,
          total: 0,
          categories: { WORK: 0, FITNESS: 0, LEARNING: 0, PROJECT: 0, PERSONAL: 0 },
        });
      }

      const bucket = monthlyBuckets.get(monthKey)!;
      const catCounts = recordsByDate.get(dStr);
      if (catCounts) {
        for (const cat of ALL_CATEGORIES) {
          bucket.categories[cat] += catCounts[cat];
          bucket.total += catCounts[cat];
          totalEntries += catCounts[cat];
        }
      }

      curr.setUTCDate(curr.getUTCDate() + 1);
    }

    const dataPoints = Array.from(monthlyBuckets.values()).map((b) => ({
      date: b.key,
      total: b.total,
      categories: b.categories,
    }));

    return {
      startDate: query.startDate,
      endDate: query.endDate,
      granularity,
      totalEntries,
      dataPoints,
    };
  }

  /**
   * Generates annual calendar heatmap for full 365/366 days.
   */
  async getCalendarHeatmap(userId: string, year: number): Promise<CalendarHeatmapData> {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31));

    const records = await this.prisma.dailyRecord.findMany({
      where: {
        userId,
        deletedAt: null,
        date: { gte: startDate, lte: endDate },
      },
      select: {
        date: true,
        entries: {
          where: { deletedAt: null },
          select: { category: true },
        },
      },
      orderBy: { date: 'asc' },
    });

    const entriesMap = new Map<string, { count: number; categories: Record<string, number> }>();
    for (const r of records) {
      if (r.entries.length > 0) {
        const dStr = formatCalendarDate(r.date);
        const catMap: Record<string, number> = {};
        for (const e of r.entries) {
          catMap[e.category] = (catMap[e.category] || 0) + 1;
        }
        entriesMap.set(dStr, {
          count: r.entries.length,
          categories: catMap,
        });
      }
    }

    return generateCalendarHeatmap(year, entriesMap);
  }

  /**
   * Category distribution and monthly comparison.
   */
  async getCategoryAnalytics(userId: string, query: CategoryAnalyticsQueryDto) {
    const year = query.year ?? new Date().getUTCFullYear();
    const startDate = query.startDate
      ? parseCalendarDate(query.startDate)
      : new Date(Date.UTC(year, 0, 1));
    const endDate = query.endDate
      ? parseCalendarDate(query.endDate)
      : new Date(Date.UTC(year, 11, 31));

    if (startDate > endDate) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }

    const entries = await this.prisma.dailyEntry.findMany({
      where: {
        userId,
        deletedAt: null,
        dailyRecord: {
          deletedAt: null,
          date: { gte: startDate, lte: endDate },
        },
      },
      select: {
        id: true,
        category: true,
        dailyRecord: { select: { date: true } },
      },
    });

    const totalEntries = entries.length;

    // Distribution
    const countsByCategory: Record<ActivityCategory, number> = {
      WORK: 0,
      FITNESS: 0,
      LEARNING: 0,
      PROJECT: 0,
      PERSONAL: 0,
    };

    const monthlyBreakdown = new Map<
      string,
      Record<ActivityCategory, number>
    >();

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const e of entries) {
      countsByCategory[e.category] = (countsByCategory[e.category] || 0) + 1;

      const dateStr = formatCalendarDate(e.dailyRecord.date);
      const monthKey = dateStr.slice(0, 7); // YYYY-MM

      if (!monthlyBreakdown.has(monthKey)) {
        monthlyBreakdown.set(monthKey, {
          WORK: 0,
          FITNESS: 0,
          LEARNING: 0,
          PROJECT: 0,
          PERSONAL: 0,
        });
      }

      const mCounts = monthlyBreakdown.get(monthKey)!;
      mCounts[e.category] = (mCounts[e.category] || 0) + 1;
    }

    const distribution = ALL_CATEGORIES.map((cat) => {
      const count = countsByCategory[cat];
      const percentage = totalEntries > 0 ? Number(((count / totalEntries) * 100).toFixed(1)) : 0;
      return {
        category: cat,
        count,
        percentage,
      };
    });

    const sortedMonthKeys = Array.from(monthlyBreakdown.keys()).sort();
    const monthlyComparison = sortedMonthKeys.map((mKey) => {
      const monthIdx = parseInt(mKey.slice(5, 7), 10) - 1;
      const cats = monthlyBreakdown.get(mKey)!;
      const total = Object.values(cats).reduce((a, b) => a + b, 0);
      return {
        month: mKey,
        monthLabel: monthNames[monthIdx] || mKey,
        categories: cats,
        total,
      };
    });

    return {
      totalEntries,
      distribution,
      monthlyComparison,
    };
  }

  /**
   * Plan analytics with dated cumulative time-series data.
   */
  async getPlanAnalytics(userId: string): Promise<{ plansCount: number; plans: PlanAnalyticsItem[] }> {
    const plans = await this.prisma.lifePlan.findMany({
      where: { userId, deletedAt: null },
      include: {
        entries: {
          where: { deletedAt: null },
          select: {
            planContribution: true,
            dailyRecord: { select: { date: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const analyzedPlans: PlanAnalyticsItem[] = [];

    for (const plan of plans) {
      const contributions = plan.entries.map((e) => ({
        date: formatCalendarDate(e.dailyRecord.date),
        amount: e.planContribution || 0,
      }));

      const planAnalytics = calculatePlanTimeSeries(plan, contributions);
      analyzedPlans.push(planAnalytics);
    }

    return {
      plansCount: analyzedPlans.length,
      plans: analyzedPlans,
    };
  }
}
