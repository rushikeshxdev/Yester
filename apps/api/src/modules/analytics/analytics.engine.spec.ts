import { ActivityCategory, PacingType, PlanStatus } from '@prisma/client';
import {
  calculateConsistencyRate,
  calculatePeriodDelta,
  calculatePlanTimeSeries,
  calculateStreaks,
  generateCalendarHeatmap,
  getIntensityLevel,
  isLeapYear,
} from './analytics.engine';

describe('AnalyticsEngine', () => {
  describe('calculateStreaks', () => {
    it('should return zeroes when date list is empty', () => {
      const res = calculateStreaks([]);
      expect(res).toEqual({ currentStreak: 0, longestStreak: 0, activeDays: 0 });
    });

    it('should compute current streak when user logged today', () => {
      const dates = ['2026-11-18', '2026-11-19', '2026-11-20'];
      const res = calculateStreaks(dates, '2026-11-20');
      expect(res.currentStreak).toBe(3);
      expect(res.longestStreak).toBe(3);
      expect(res.activeDays).toBe(3);
    });

    it('should preserve streak with grace period when user logged yesterday but not today yet', () => {
      const dates = ['2026-11-17', '2026-11-18', '2026-11-19'];
      const res = calculateStreaks(dates, '2026-11-20');
      expect(res.currentStreak).toBe(3);
      expect(res.longestStreak).toBe(3);
      expect(res.activeDays).toBe(3);
    });

    it('should reset current streak to 0 if last log was 2+ days ago', () => {
      const dates = ['2026-11-15', '2026-11-16', '2026-11-17'];
      const res = calculateStreaks(dates, '2026-11-20');
      expect(res.currentStreak).toBe(0);
      expect(res.longestStreak).toBe(3);
      expect(res.activeDays).toBe(3);
    });

    it('should correctly determine longest streak across historical gaps', () => {
      const dates = [
        '2026-01-01',
        '2026-01-02',
        '2026-01-03',
        '2026-01-04',
        '2026-01-05', // 5-day streak
        '2026-02-10', // gap
        '2026-02-11', // 2-day streak
        '2026-03-01',
        '2026-03-02',
        '2026-03-03', // 3-day streak
      ];
      const res = calculateStreaks(dates, '2026-03-03');
      expect(res.currentStreak).toBe(3);
      expect(res.longestStreak).toBe(5);
      expect(res.activeDays).toBe(10);
    });
  });

  describe('calculateConsistencyRate', () => {
    it('should return 0 when elapsed days is zero or negative', () => {
      expect(calculateConsistencyRate(5, 0)).toBe(0);
      expect(calculateConsistencyRate(5, -1)).toBe(0);
    });

    it('should calculate accurate percentage rounded to 1 decimal place', () => {
      expect(calculateConsistencyRate(10, 20)).toBe(50.0);
      expect(calculateConsistencyRate(1, 3)).toBe(33.3);
      expect(calculateConsistencyRate(365, 365)).toBe(100.0);
    });
  });

  describe('calculatePeriodDelta', () => {
    it('should return null when prior is null (baseline)', () => {
      expect(calculatePeriodDelta(50, null)).toBeNull();
    });

    it('should handle zero prior gracefully', () => {
      expect(calculatePeriodDelta(10, 0)).toBe(100);
      expect(calculatePeriodDelta(0, 0)).toBe(0);
    });

    it('should return accurate positive and negative deltas', () => {
      expect(calculatePeriodDelta(120, 100)).toBe(20.0);
      expect(calculatePeriodDelta(80, 100)).toBe(-20.0);
    });
  });

  describe('isLeapYear and generateCalendarHeatmap', () => {
    it('should recognize leap years correctly', () => {
      expect(isLeapYear(2024)).toBe(true);
      expect(isLeapYear(2025)).toBe(false);
      expect(isLeapYear(2026)).toBe(false);
      expect(isLeapYear(2000)).toBe(true);
      expect(isLeapYear(1900)).toBe(false);
    });

    it('should generate a 365-day heatmap for 2026 with correct start weekday and week index', () => {
      const entriesMap = new Map<string, { count: number; categories: Record<string, number> }>();
      entriesMap.set('2026-01-01', { count: 3, categories: { WORK: 2, FITNESS: 1 } });
      entriesMap.set('2026-01-02', { count: 8, categories: { WORK: 5, LEARNING: 3 } });

      const res = generateCalendarHeatmap(2026, entriesMap);

      expect(res.year).toBe(2026);
      expect(res.totalDays).toBe(365);
      expect(res.activeDays).toBe(2);
      expect(res.maxDayEntries).toBe(8);
      // Jan 1, 2026 is a Thursday (4)
      expect(res.startWeekday).toBe(4);
      expect(res.totalWeeks).toBe(53);

      const day1 = res.heatmap[0];
      expect(day1.date).toBe('2026-01-01');
      expect(day1.weekday).toBe(4);
      expect(day1.intensity).toBe(2); // 3 entries -> level 2
      expect(day1.count).toBe(3);

      const day2 = res.heatmap[1];
      expect(day2.date).toBe('2026-01-02');
      expect(day2.weekday).toBe(5);
      expect(day2.intensity).toBe(4); // 8 entries -> level 4 (7+)

      expect(res.weekdayDistribution['Thu']).toBe(3);
      expect(res.weekdayDistribution['Fri']).toBe(8);
    });

    it('should generate 366 days for leap year 2024', () => {
      const res = generateCalendarHeatmap(2024, new Map());
      expect(res.totalDays).toBe(366);
      expect(res.heatmap.length).toBe(366);
      expect(res.heatmap[59].date).toBe('2024-02-29'); // Leap day present!
    });
  });

  describe('calculatePlanTimeSeries', () => {
    it('should calculate cumulative progress and trajectory points', () => {
      const plan = {
        id: 'plan-1',
        title: 'Read 24 Books',
        category: ActivityCategory.LEARNING,
        status: PlanStatus.ACTIVE,
        targetValue: 24,
        unitLabel: 'books',
        startDate: new Date(Date.UTC(2026, 0, 1)),
        targetDate: new Date(Date.UTC(2026, 11, 31)),
        pacingType: PacingType.LINEAR,
      };

      const contributions = [
        { date: '2026-01-15', amount: 2 },
        { date: '2026-02-01', amount: 3 },
      ];

      const item = calculatePlanTimeSeries(plan, contributions, '2026-02-15');

      expect(item.id).toBe('plan-1');
      expect(item.currentValue).toBe(5);
      expect(item.targetValue).toBe(24);
      expect(item.progressPercent).toBe(20.8); // 5 / 24 * 100 = 20.83%
      expect(item.timeSeries.length).toBeGreaterThanOrEqual(3);

      // Verify cumulative progression in time series
      const point1 = item.timeSeries.find((p) => p.date === '2026-01-15');
      expect(point1?.actualCumulative).toBe(2);

      const point2 = item.timeSeries.find((p) => p.date === '2026-02-01');
      expect(point2?.actualCumulative).toBe(5);
    });
  });

  describe('getIntensityLevel', () => {
    it('should map count to 0-4 intensity scale', () => {
      expect(getIntensityLevel(0)).toBe(0);
      expect(getIntensityLevel(1)).toBe(1);
      expect(getIntensityLevel(2)).toBe(1);
      expect(getIntensityLevel(3)).toBe(2);
      expect(getIntensityLevel(4)).toBe(2);
      expect(getIntensityLevel(5)).toBe(3);
      expect(getIntensityLevel(6)).toBe(3);
      expect(getIntensityLevel(7)).toBe(4);
      expect(getIntensityLevel(15)).toBe(4);
    });
  });
});
