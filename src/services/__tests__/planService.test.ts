import {
  validatePlan,
  calculatePacingFactor,
  calculateExpectedProgress,
  calculatePlanProgress,
  getDaysDifference,
} from '../planService';
import { LifePlan, DailyRecord } from '../../types';

function runTests() {
  console.log('Running Pure Trajectory Engine Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      passed++;
      console.log(`  ✓ ${message}`);
    } else {
      failed++;
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  // Test 1: Date math
  assert(getDaysDifference('2026-11-01', '2026-11-10') === 9, 'getDaysDifference calculates exact day gap');
  assert(getDaysDifference('2026-11-01', '2026-11-01') === 0, 'getDaysDifference handles identical dates');

  // Test 2: Pacing factor curves
  const tMid = 0.5;
  const lin = calculatePacingFactor('linear', tMid);
  const ramp = calculatePacingFactor('ramp_up', tMid);
  const front = calculatePacingFactor('front_loaded', tMid);

  assert(lin === 0.5, 'Linear pacing at t=0.5 is exactly 0.5');
  assert(ramp < lin, `Ramp-up pacing at t=0.5 (${ramp.toFixed(3)}) is slower than linear`);
  assert(front > lin, `Front-loaded pacing at t=0.5 (${front.toFixed(3)}) is faster than linear`);
  assert(calculatePacingFactor('ramp_up', 0) === 0, 'Ramp-up at t=0 is 0');
  assert(calculatePacingFactor('ramp_up', 1) === 1, 'Ramp-up at t=1 is 1');
  assert(calculatePacingFactor('front_loaded', 1) === 1, 'Front-loaded at t=1 is 1');

  // Test 3: Plan validation
  const invalidPlan: Partial<LifePlan> = {
    title: '',
    statement: '',
    targetValue: -5,
  };
  const valResult = validatePlan(invalidPlan);
  assert(!valResult.valid, 'Invalid plan correctly rejected');
  assert(valResult.errors.length >= 3, 'Multiple validation errors identified');

  // Test 4: Expected progress calculation
  const mockPlan: LifePlan = {
    id: 'test-plan-1',
    title: 'Test Plan',
    statement: 'Master backend architectures.',
    category: 'work',
    startDate: '2026-11-01',
    targetDate: '2026-11-21', // 20 days
    unitLabel: 'Sessions',
    targetValue: 100,
    pacingType: 'linear',
    milestones: [
      { id: 'm-1', title: 'Q1', targetPercent: 25, createdAt: '', updatedAt: '' },
      { id: 'm-2', title: 'Q2', targetPercent: 50, createdAt: '', updatedAt: '' },
      { id: 'm-3', title: 'Q3', targetPercent: 75, createdAt: '', updatedAt: '' },
      { id: 'm-4', title: 'Complete', targetPercent: 100, createdAt: '', updatedAt: '' },
    ],
    status: 'active',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  };

  const expMid = calculateExpectedProgress(mockPlan, '2026-11-11'); // 10 days in out of 20 = 50%
  assert(expMid.expectedPercent === 50, 'Linear plan expected percent is 50% at midpoint');
  assert(expMid.expectedValue === 50, 'Linear plan expected value is 50 at midpoint');

  const expBefore = calculateExpectedProgress(mockPlan, '2026-10-25');
  assert(expBefore.expectedPercent === 0, 'Expected percent before start date is 0%');

  const expAfter = calculateExpectedProgress(mockPlan, '2026-12-01');
  assert(expAfter.expectedPercent === 100, 'Expected percent after target date is 100%');

  // Test 5: Progress summary aggregation & milestones
  const mockRecords: Record<string, DailyRecord> = {
    '2026-11-05': {
      id: '2026-11-05',
      date: '2026-11-05',
      work: [
        {
          id: 'w-1',
          date: '2026-11-05',
          organization: 'Helios',
          project: 'Broker',
          tasksPerformed: ['Core'],
          technologiesUsed: [],
          evidenceLinks: [],
          planId: 'test-plan-1',
          planContribution: 30, // cross 25% milestone
          createdAt: '',
          updatedAt: '',
        },
      ],
      fitness: [],
      learning: [],
      projects: [],
      personal: [],
      createdAt: '',
      updatedAt: '',
    },
    '2026-11-10': {
      id: '2026-11-10',
      date: '2026-11-10',
      work: [
        {
          id: 'w-2',
          date: '2026-11-10',
          organization: 'Helios',
          project: 'Broker',
          tasksPerformed: ['Core part 2'],
          technologiesUsed: [],
          evidenceLinks: [],
          planId: 'test-plan-1',
          planContribution: 35, // total 65, cross 50% milestone
          createdAt: '',
          updatedAt: '',
        },
      ],
      fitness: [],
      learning: [],
      projects: [],
      personal: [],
      createdAt: '',
      updatedAt: '',
    },
  };

  const summary = calculatePlanProgress(mockPlan, mockRecords, '2026-11-11');
  assert(summary.actualValue === 65, 'Actual value aggregated accurately to 65');
  assert(summary.actualPercent === 65, 'Actual percent calculated to 65%');
  assert(summary.expectedValue === 50, 'Expected value at 2026-11-11 is 50');
  assert(summary.variancePercent === 15, 'Variance percent is +15%');
  assert(summary.paceStatus === 'ahead', 'Pace status is correctly "ahead"');

  // Milestones
  const m1 = summary.milestones.find((m) => m.targetPercent === 25);
  const m2 = summary.milestones.find((m) => m.targetPercent === 50);
  const m3 = summary.milestones.find((m) => m.targetPercent === 75);

  assert(m1?.isReached === true && m1.reachedDate === '2026-11-05', 'Milestone 25% reached on 2026-11-05');
  assert(m2?.isReached === true && m2.reachedDate === '2026-11-10', 'Milestone 50% reached on 2026-11-10');
  assert(m3?.isReached === false, 'Milestone 75% remains unreached');

  // Chart data
  assert(summary.chartData.length === 21, 'Chart series includes 21 daily data points (20 days span + 1)');
  const futurePoint = summary.chartData.find((p) => p.date === '2026-11-15');
  assert(futurePoint?.actualValue === null, 'Future chart point actualValue is null');
  assert(typeof futurePoint?.expectedValue === 'number', 'Future chart point expectedValue exists');

  // Test 6: Same start and target date (no division by zero)
  const sameDatePlan: LifePlan = {
    ...mockPlan,
    id: 'same-date-plan',
    startDate: '2026-11-10',
    targetDate: '2026-11-10',
    targetValue: 50,
  };
  const expSameBefore = calculateExpectedProgress(sameDatePlan, '2026-11-09');
  const expSameOn = calculateExpectedProgress(sameDatePlan, '2026-11-10');
  const expSameAfter = calculateExpectedProgress(sameDatePlan, '2026-11-11');
  assert(expSameBefore.expectedPercent === 0, 'Same-date plan before date is 0%');
  assert(expSameOn.expectedPercent === 100, 'Same-date plan on target date is 100%');
  assert(expSameAfter.expectedPercent === 100, 'Same-date plan after target date is 100%');

  // Test 7: Entries before plan start date excluded, entries after target date included if <= asOfDate
  const edgeRecords: Record<string, DailyRecord> = {
    // Before start date (should be excluded)
    '2026-10-25': {
      id: '2026-10-25',
      date: '2026-10-25',
      work: [
        {
          id: 'w-pre',
          date: '2026-10-25',
          organization: 'Test',
          project: 'Old',
          tasksPerformed: ['Pre'],
          technologiesUsed: [],
          evidenceLinks: [],
          planId: 'test-plan-1',
          planContribution: 20, // should not count!
          createdAt: '',
          updatedAt: '',
        },
      ],
      fitness: [],
      learning: [],
      projects: [],
      personal: [],
      createdAt: '',
      updatedAt: '',
    },
    // On start date
    '2026-11-01': {
      id: '2026-11-01',
      date: '2026-11-01',
      work: [
        {
          id: 'w-start',
          date: '2026-11-01',
          organization: 'Test',
          project: 'Start',
          tasksPerformed: ['Start'],
          technologiesUsed: [],
          evidenceLinks: [],
          planId: 'test-plan-1',
          planContribution: 10,
          createdAt: '',
          updatedAt: '',
        },
      ],
      fitness: [],
      learning: [],
      projects: [],
      personal: [],
      createdAt: '',
      updatedAt: '',
    },
    // Multiple entries on the same date with missing contribution (default 1)
    '2026-11-08': {
      id: '2026-11-08',
      date: '2026-11-08',
      work: [
        {
          id: 'w-multi-b',
          date: '2026-11-08',
          organization: 'Test',
          project: 'Multi B',
          tasksPerformed: ['B'],
          technologiesUsed: [],
          evidenceLinks: [],
          planId: 'test-plan-1',
          // missing planContribution -> should default to 1
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'w-multi-a',
          date: '2026-11-08',
          organization: 'Test',
          project: 'Multi A',
          tasksPerformed: ['A'],
          technologiesUsed: [],
          evidenceLinks: [],
          planId: 'test-plan-1',
          planContribution: 10,
          createdAt: '',
          updatedAt: '',
        },
      ],
      fitness: [],
      learning: [],
      projects: [],
      personal: [],
      createdAt: '',
      updatedAt: '',
    },
    // Overachievement: Entry after target date (2026-11-25) evaluated on 2026-11-30
    '2026-11-25': {
      id: '2026-11-25',
      date: '2026-11-25',
      work: [
        {
          id: 'w-late-overachieve',
          date: '2026-11-25',
          organization: 'Test',
          project: 'Over',
          tasksPerformed: ['Over'],
          technologiesUsed: [],
          evidenceLinks: [],
          planId: 'test-plan-1',
          planContribution: 95, // 10 + 1 + 10 + 95 = 116 total (> 100 target)
          createdAt: '',
          updatedAt: '',
        },
      ],
      fitness: [],
      learning: [],
      projects: [],
      personal: [],
      createdAt: '',
      updatedAt: '',
    },
  };

  const edgeSummary = calculatePlanProgress(mockPlan, edgeRecords, '2026-11-30');
  assert(edgeSummary.actualValue === 116, `Actual value is 116 (excluded pre-plan entry of 20, included late entry): got ${edgeSummary.actualValue}`);
  assert(edgeSummary.actualPercent === 116, `Overachievement accurately displays 116% without artificial capping: got ${edgeSummary.actualPercent}%`);
  assert(edgeSummary.isComplete === true, 'Plan is marked complete upon reaching >= targetValue');

  // Verify missing contribution defaulted to 1
  const entryMultiB = edgeSummary.linkedEntries.find((e) => e.entryId === 'w-multi-b');
  assert(entryMultiB?.contribution === 1, 'Missing contribution correctly defaulted to 1');

  // Test 8: Editing and removing entries
  const modifiedRecords = { ...edgeRecords };
  delete modifiedRecords['2026-11-25']; // remove late entry
  const modifiedSummary = calculatePlanProgress(mockPlan, modifiedRecords, '2026-11-30');
  assert(modifiedSummary.actualValue === 21, `Removing entry immediately updates actualValue from 116 to 21: got ${modifiedSummary.actualValue}`);
  assert(modifiedSummary.isComplete === false, 'Plan returns to incomplete status when entry is removed');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    throw new Error(`${failed} tests failed!`);
  }
}

runTests();


