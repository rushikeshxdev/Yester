import { BadRequestException } from '@nestjs/common';
import { ActivityCategory, PacingType, PlanStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let mockPrisma: any;

  const mockUserId = 'usr-11111111-2222-3333-4444-555555555555';

  beforeEach(() => {
    mockPrisma = {
      dailyRecord: {
        findMany: jest.fn(),
      },
      dailyEntry: {
        findMany: jest.fn(),
      },
      lifePlan: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    service = new AnalyticsService(mockPrisma as unknown as PrismaService);
  });

  describe('getOverview', () => {
    it('should aggregate records, calculate streaks, and exclude soft-deleted items', async () => {
      // Mock current period records
      mockPrisma.dailyRecord.findMany.mockImplementation((args: any) => {
        // First call: current period records
        if (args.where?.date?.gte && args.select?.entries?.select?.id) {
          return Promise.resolve([
            {
              id: 'rec-1',
              date: new Date(Date.UTC(2026, 10, 1)),
              entries: [
                { id: 'ent-1', category: ActivityCategory.WORK },
                { id: 'ent-2', category: ActivityCategory.FITNESS },
              ],
            },
            {
              id: 'rec-2',
              date: new Date(Date.UTC(2026, 10, 2)),
              entries: [{ id: 'ent-3', category: ActivityCategory.LEARNING }],
            },
          ]);
        }
        // Second call: all active records for streaks
        if (args.where?.entries?.some?.deletedAt === null && !args.where?.date?.gte) {
          return Promise.resolve([
            { date: new Date(Date.UTC(2026, 10, 1)) },
            { date: new Date(Date.UTC(2026, 10, 2)) },
          ]);
        }
        // Third call: prior period records
        return Promise.resolve([]);
      });

      mockPrisma.lifePlan.count.mockResolvedValue(2);

      const res = await service.getOverview(mockUserId, { year: 2026, month: 11 });

      expect(res.period).toEqual({ year: 2026, month: 11 });
      expect(res.kpis.totalEntries).toBe(3);
      expect(res.kpis.recordedDays).toBe(2);
      expect(res.kpis.activePlansCount).toBe(2);

      // Verify Prisma was called with strict tenant isolation and soft-delete filters
      expect(mockPrisma.dailyRecord.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: mockUserId,
            deletedAt: null,
          }),
        }),
      );
    });
  });

  describe('getActivitySeries', () => {
    it('should throw BadRequestException if startDate > endDate', async () => {
      await expect(
        service.getActivitySeries(mockUserId, {
          startDate: '2026-11-20',
          endDate: '2026-11-10',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return zero-filled daily data points for days without entries', async () => {
      mockPrisma.dailyRecord.findMany.mockResolvedValue([
        {
          date: new Date(Date.UTC(2026, 10, 2)),
          entries: [{ id: 'ent-1', category: ActivityCategory.WORK }],
        },
      ]);

      const res = await service.getActivitySeries(mockUserId, {
        startDate: '2026-11-01',
        endDate: '2026-11-03',
        granularity: 'daily',
      });

      expect(res.totalEntries).toBe(1);
      expect(res.dataPoints.length).toBe(3);
      expect(res.dataPoints[0].date).toBe('2026-11-01');
      expect(res.dataPoints[0].total).toBe(0);
      expect(res.dataPoints[1].date).toBe('2026-11-02');
      expect(res.dataPoints[1].total).toBe(1);
      expect(res.dataPoints[2].date).toBe('2026-11-03');
      expect(res.dataPoints[2].total).toBe(0);
    });
  });

  describe('getCalendarHeatmap', () => {
    it('should return full year heatmap with intensity and startWeekday for 2026', async () => {
      mockPrisma.dailyRecord.findMany.mockResolvedValue([
        {
          date: new Date(Date.UTC(2026, 0, 1)),
          entries: [
            { category: ActivityCategory.WORK },
            { category: ActivityCategory.FITNESS },
          ],
        },
      ]);

      const res = await service.getCalendarHeatmap(mockUserId, 2026);

      expect(res.year).toBe(2026);
      expect(res.totalDays).toBe(365);
      expect(res.activeDays).toBe(1);
      expect(res.maxDayEntries).toBe(2);
      expect(res.heatmap.length).toBe(365);
      expect(res.heatmap[0].intensity).toBe(1); // 2 entries -> level 1
    });
  });

  describe('getCategoryAnalytics', () => {
    it('should calculate category distribution without hardcoded colors', async () => {
      mockPrisma.dailyEntry.findMany.mockResolvedValue([
        {
          id: 'e1',
          category: ActivityCategory.WORK,
          dailyRecord: { date: new Date(Date.UTC(2026, 0, 15)) },
        },
        {
          id: 'e2',
          category: ActivityCategory.WORK,
          dailyRecord: { date: new Date(Date.UTC(2026, 0, 16)) },
        },
        {
          id: 'e3',
          category: ActivityCategory.FITNESS,
          dailyRecord: { date: new Date(Date.UTC(2026, 1, 10)) },
        },
      ]);

      const res = await service.getCategoryAnalytics(mockUserId, { year: 2026 });

      expect(res.totalEntries).toBe(3);
      const work = res.distribution.find((d) => d.category === ActivityCategory.WORK);
      expect(work?.count).toBe(2);
      expect(work?.percentage).toBe(66.7);

      const fitness = res.distribution.find((d) => d.category === ActivityCategory.FITNESS);
      expect(fitness?.count).toBe(1);
      expect(fitness?.percentage).toBe(33.3);

      // Ensure no color field exists in backend response
      expect((work as any)?.color).toBeUndefined();

      expect(res.monthlyComparison.length).toBe(2);
      expect(res.monthlyComparison[0].month).toBe('2026-01');
      expect(res.monthlyComparison[0].total).toBe(2);
      expect(res.monthlyComparison[1].month).toBe('2026-02');
      expect(res.monthlyComparison[1].total).toBe(1);
    });
  });

  describe('getPlanAnalytics', () => {
    it('should calculate plan trajectory and dated time-series', async () => {
      mockPrisma.lifePlan.findMany.mockResolvedValue([
        {
          id: 'plan-1',
          title: 'Learn Rust',
          category: ActivityCategory.LEARNING,
          status: PlanStatus.ACTIVE,
          targetValue: 50,
          unitLabel: 'hours',
          startDate: new Date(Date.UTC(2026, 0, 1)),
          targetDate: new Date(Date.UTC(2026, 11, 31)),
          pacingType: PacingType.LINEAR,
          entries: [
            {
              planContribution: 10,
              dailyRecord: { date: new Date(Date.UTC(2026, 0, 15)) },
            },
            {
              planContribution: 15,
              dailyRecord: { date: new Date(Date.UTC(2026, 1, 1)) },
            },
          ],
        },
      ]);

      const res = await service.getPlanAnalytics(mockUserId);

      expect(res.plansCount).toBe(1);
      const plan = res.plans[0];
      expect(plan.id).toBe('plan-1');
      expect(plan.currentValue).toBe(25);
      expect(plan.progressPercent).toBe(50.0);
      expect(plan.timeSeries.length).toBeGreaterThanOrEqual(2);
    });
  });
});
