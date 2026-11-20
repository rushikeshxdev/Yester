import { ActivityCategory, PacingType } from '@prisma/client';
import {
  calculateExpectedProgress,
  calculatePacingFactor,
  derivePlanTrajectory,
  getDaysDifference,
} from './trajectory.engine';

describe('TrajectoryEngine (Pure Math & Milestone Evaluation)', () => {
  describe('getDaysDifference', () => {
    it('should calculate exact day difference between two dates', () => {
      expect(getDaysDifference('2026-11-01', '2026-11-21')).toBe(20);
      expect(getDaysDifference('2026-11-01', '2026-11-01')).toBe(0);
    });
  });

  describe('calculatePacingFactor', () => {
    it('should calculate linear pacing factor: f(t) = t', () => {
      expect(calculatePacingFactor(PacingType.LINEAR, 0)).toBe(0);
      expect(calculatePacingFactor(PacingType.LINEAR, 0.5)).toBe(0.5);
      expect(calculatePacingFactor(PacingType.LINEAR, 1)).toBe(1);
    });

    it('should calculate ramp-up pacing factor: f(t) = t^1.4 (slower start)', () => {
      expect(calculatePacingFactor(PacingType.RAMP_UP, 0)).toBe(0);
      const factor = calculatePacingFactor(PacingType.RAMP_UP, 0.5);
      expect(factor).toBeCloseTo(0.3789, 3);
      expect(factor).toBeLessThan(0.5);
      expect(calculatePacingFactor(PacingType.RAMP_UP, 1)).toBe(1);
    });

    it('should calculate front-loaded pacing factor: f(t) = 1 - (1-t)^1.4 (faster start)', () => {
      expect(calculatePacingFactor(PacingType.FRONT_LOADED, 0)).toBe(0);
      const factor = calculatePacingFactor(PacingType.FRONT_LOADED, 0.5);
      expect(factor).toBeCloseTo(0.6211, 3);
      expect(factor).toBeGreaterThan(0.5);
      expect(calculatePacingFactor(PacingType.FRONT_LOADED, 1)).toBe(1);
    });
  });

  describe('calculateExpectedProgress', () => {
    it('should return 0 before startDate and 100% at/after targetDate', () => {
      const before = calculateExpectedProgress(
        100,
        '2026-11-01',
        '2026-11-21',
        PacingType.LINEAR,
        '2026-10-31',
      );
      expect(before.expectedValue).toBe(0);
      expect(before.expectedPercent).toBe(0);

      const after = calculateExpectedProgress(
        100,
        '2026-11-01',
        '2026-11-21',
        PacingType.LINEAR,
        '2026-11-25',
      );
      expect(after.expectedValue).toBe(100);
      expect(after.expectedPercent).toBe(100);
    });

    it('should return 50% at midpoint for linear pacing', () => {
      const mid = calculateExpectedProgress(
        100,
        '2026-11-01',
        '2026-11-21',
        PacingType.LINEAR,
        '2026-11-11',
      );
      expect(mid.expectedValue).toBe(50);
      expect(mid.expectedPercent).toBe(50);
    });
  });

  describe('derivePlanTrajectory', () => {
    const plan = {
      id: 'plan-1',
      targetValue: 100,
      startDate: '2026-11-01',
      targetDate: '2026-11-21',
      pacingType: PacingType.LINEAR,
      milestones: [
        { id: 'm-1', title: '25% Base', targetPercent: 25 },
        { id: 'm-2', title: '50% Halfway', targetPercent: 50 },
        { id: 'm-3', title: '75% Stretch', targetPercent: 75 },
      ],
    };

    it('should aggregate contributions and evaluate dynamic milestones chronologically', () => {
      const entries = [
        {
          id: 'e-pre',
          date: '2026-10-30', // Before plan start -> excluded
          category: ActivityCategory.PROJECT,
          title: 'Prep work',
          planContribution: 10,
        },
        {
          id: 'e-1',
          date: '2026-11-05',
          category: ActivityCategory.PROJECT,
          title: 'Foundation sprint',
          planContribution: 30, // Reaches 25% milestone
        },
        {
          id: 'e-2',
          date: '2026-11-10',
          category: ActivityCategory.PROJECT,
          title: 'Core engine',
          planContribution: 35, // Cumulative = 65 -> reaches 50% milestone
        },
      ];

      // Evaluate as of 2026-11-11 (midpoint, expected = 50)
      const result = derivePlanTrajectory(plan, entries, '2026-11-11');

      expect(result.actualValue).toBe(65);
      expect(result.actualPercent).toBe(65);
      expect(result.expectedValue).toBe(50);
      expect(result.variancePercent).toBe(15);
      expect(result.paceStatus).toBe('ahead');

      // Milestone 1 (25% = 25 units)
      const m1 = result.milestones.find((m) => m.id === 'm-1');
      expect(m1?.isReached).toBe(true);
      expect(m1?.reachedDate).toBe('2026-11-05');
      expect(m1?.reachedValue).toBe(30);

      // Milestone 2 (50% = 50 units)
      const m2 = result.milestones.find((m) => m.id === 'm-2');
      expect(m2?.isReached).toBe(true);
      expect(m2?.reachedDate).toBe('2026-11-10');
      expect(m2?.reachedValue).toBe(65);

      // Milestone 3 (75% = 75 units)
      const m3 = result.milestones.find((m) => m.id === 'm-3');
      expect(m3?.isReached).toBe(false);
      expect(m3?.reachedDate).toBeUndefined();

      // Chart data validation (21 daily data points from Nov 1 to Nov 21)
      expect(result.chartData.length).toBe(21);
      const pastPoint = result.chartData.find((p) => p.date === '2026-11-10');
      expect(pastPoint?.actualValue).toBe(65);

      const futurePoint = result.chartData.find((p) => p.date === '2026-11-15');
      expect(futurePoint?.actualValue).toBeNull(); // Future point has null actualValue
      expect(futurePoint?.expectedValue).toBeDefined();
    });

    it('should correctly default planContribution to 1 when omitted or null', () => {
      const entries = [
        {
          id: 'e-default',
          date: '2026-11-05',
          category: ActivityCategory.FITNESS,
          title: 'Daily run',
          planContribution: null,
        },
      ];

      const result = derivePlanTrajectory(plan, entries, '2026-11-11');
      expect(result.actualValue).toBe(1);
    });
  });
});
