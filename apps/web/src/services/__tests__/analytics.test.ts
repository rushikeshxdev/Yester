import { getCategoryColor, getCategoryLabel } from '../../config/categoryTheme';

function runAnalyticsTests() {
  console.log('Running Analytics Theme & Component Logic Tests...');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✓ ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  }

  // 1. Shared Category Theme & Colors
  assert(getCategoryColor('work') === '#FF7138', 'Work category returns Signal Orange #FF7138');
  assert(getCategoryColor('WORK') === '#FF7138', 'Uppercase WORK category returns Signal Orange');
  assert(getCategoryColor('fitness') === '#4A72B2', 'Fitness returns Slate Blue');
  assert(getCategoryColor('learning') === '#3FB950', 'Learning returns Emerald Green');
  assert(getCategoryColor('unknown') === '#8B949E', 'Unknown category gracefully defaults to neutral #8B949E');

  assert(getCategoryLabel('work') === 'Work', 'Work category label is formatted correctly');
  assert(getCategoryLabel('PROJECT') === 'Projects', 'PROJECT category label is Projects');

  // 2. Leap year calculations
  function isLeap(y: number): boolean {
    return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  }
  assert(isLeap(2024) === true, '2024 is a leap year');
  assert(isLeap(2026) === false, '2026 is not a leap year');
  assert(isLeap(2000) === true, '2000 is a leap year (400 rule)');
  assert(isLeap(1900) === false, '1900 is not a leap year (100 rule)');

  // 3. Consistency Rate
  function calcConsistency(active: number, total: number): number {
    if (total <= 0) return 0;
    return Math.min(100, Number(((active / total) * 100).toFixed(1)));
  }
  assert(calcConsistency(142, 365) === 38.9, 'Consistency rate matches 142/365 -> 38.9%');
  assert(calcConsistency(0, 365) === 0, 'Zero active days yields 0%');
  assert(calcConsistency(10, 0) === 0, 'Zero denominator handled safely');

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runAnalyticsTests();
