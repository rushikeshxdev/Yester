/**
 * Storage & Migration Verification Test Suite
 * Tests Phase 15.2: Plan persistence, legacy schema migration,
 * backup export/import, storage resilience, and subscriber notifications.
 */

// Simple in-memory LocalStorage mock for Node.js runtime
class MockLocalStorage {
  private store: Map<string, string> = new Map();
  public shouldThrowOnSet = false;

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.shouldThrowOnSet) {
      throw new Error('QuotaExceededError: The quota has been exceeded.');
    }
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

// Inject global localStorage
const mockStorage = new MockLocalStorage();
(globalThis as any).localStorage = mockStorage;

import {
  initStorage,
  getAllPlans,
  getPlanById,
  savePlan,
  archivePlan,
  completePlan,
  deletePlan,
  getAllDailyRecords,
  saveDailyRecord,
  subscribeToStorage,
  exportBackupJSON,
  importBackupJSON,
} from '../storage';
import { LifePlan } from '../../types';

function runStorageTests() {
  console.log('Running Storage & Migration Engine Tests...');
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

  // Clear mock store
  mockStorage.clear();

  // Test 1: Storage Initialization
  initStorage();
  const initialPlans = getAllPlans();
  assert(typeof initialPlans === 'object', 'initStorage initializes plans store');

  // Test 2: Subscriber Notifications
  let notificationCount = 0;
  const unsubscribe = subscribeToStorage(() => {
    notificationCount++;
  });

  // Test 3: Creating Plans
  const newPlan: LifePlan = {
    id: 'test-p1',
    title: 'Master Go Concurrency',
    statement: 'Build robust concurrent services using CSP primitives.',
    category: 'learning',
    startDate: '2026-11-01',
    targetDate: '2027-02-01',
    unitLabel: 'Chapters & Labs',
    targetValue: 40,
    pacingType: 'ramp_up',
    milestones: [
      { id: 'm-1', title: 'CSP Fundamentals', targetPercent: 25, createdAt: '', updatedAt: '' },
      { id: 'm-2', title: 'Work Pools & Pipelines', targetPercent: 50, createdAt: '', updatedAt: '' },
      { id: 'm-3', title: 'Distributed Mutexes', targetPercent: 75, createdAt: '', updatedAt: '' },
      { id: 'm-4', title: 'High-Volume Production Server', targetPercent: 100, createdAt: '', updatedAt: '' },
    ],
    status: 'active',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-01T10:00:00.000Z',
  };

  const saved = savePlan(newPlan);
  assert(saved.id === 'test-p1', 'Plan saved with ID intact');
  assert(notificationCount === 1, 'Subscriber received notification on plan save');

  const loaded = getPlanById('test-p1');
  assert(loaded !== null && loaded.title === 'Master Go Concurrency', 'getPlanById loads saved plan accurately');

  // Test 4: Updating Plans
  const originalCreated = saved.createdAt;
  const updatedPlan = savePlan({
    ...saved,
    targetValue: 50,
  });
  assert(updatedPlan.targetValue === 50, 'Plan target value updated to 50');
  assert(updatedPlan.createdAt === originalCreated, 'Plan createdAt preserved across updates');
  assert(notificationCount === 2, 'Subscriber received notification on plan update');

  // Test 5: Archiving Plans
  archivePlan('test-p1');
  const archived = getPlanById('test-p1');
  assert(archived?.status === 'archived', 'archivePlan changes status to "archived"');
  assert(notificationCount === 3, 'Subscriber notified on archive');

  // Test 6: Completing Plans
  completePlan('test-p1');
  const completed = getPlanById('test-p1');
  assert(completed?.status === 'completed', 'completePlan changes status to "completed"');
  assert(notificationCount === 4, 'Subscriber notified on complete');

  // Test 7: Deleting Plans (Historical daily entries preserved)
  deletePlan('test-p1');
  assert(getPlanById('test-p1') === null, 'deletePlan removes plan from storage');
  assert(notificationCount === 5, 'Subscriber notified on delete');

  // Unsubscribe listener
  unsubscribe();
  savePlan(newPlan);
  assert(notificationCount === 5, 'Unsubscribed listener does not trigger further callbacks');

  // Test 8: Legacy Daily Entry Migration (Idempotent UUID & Timestamp backfilling)
  mockStorage.clear();
  const legacyRecordsJson = JSON.stringify({
    '2026-11-05': {
      id: '2026-11-05',
      date: '2026-11-05',
      work: [
        {
          // Missing id, createdAt, updatedAt
          date: '2026-11-05',
          organization: 'Legacy Corp',
          project: 'Old DB',
          tasksPerformed: ['Refactor'],
          technologiesUsed: [],
          evidenceLinks: [],
        },
      ],
      fitness: [
        {
          // Existing ID and timestamp should be preserved
          id: 'preserved-fit-id',
          date: '2026-11-05',
          workoutType: 'Strength',
          muscleGroups: [],
          workoutDurationMinutes: 30,
          exercises: [],
          createdAt: '2026-11-05T08:00:00.000Z',
          updatedAt: '2026-11-05T08:00:00.000Z',
        },
      ],
      learning: [],
      projects: [],
      personal: [],
      health: {
        // Missing id
        date: '2026-11-05',
        sleepHours: 8,
        waterIntakeLiters: 2,
        habits: [
          { name: 'Morning Walk', completed: true }, // missing id
        ],
      },
    },
  });

  mockStorage.setItem('yester_records_v1', legacyRecordsJson);
  initStorage();

  const recordsAfterMigration = getAllDailyRecords();
  const dayRec = recordsAfterMigration['2026-11-05'];
  const legacyWork = dayRec.work[0];
  const preservedFit = dayRec.fitness[0];

  assert(typeof legacyWork.id === 'string' && legacyWork.id.length > 0, 'Legacy work entry backfilled with stable UUID');
  assert(typeof legacyWork.createdAt === 'string', 'Legacy work entry backfilled with createdAt timestamp');
  assert(typeof legacyWork.updatedAt === 'string', 'Legacy work entry backfilled with updatedAt timestamp');
  assert(preservedFit.id === 'preserved-fit-id', 'Existing entry ID strictly preserved without overwrite');
  assert(preservedFit.createdAt === '2026-11-05T08:00:00.000Z', 'Existing createdAt strictly preserved');
  assert(typeof dayRec.health?.id === 'string', 'Legacy health entry assigned stable UUID');
  assert(typeof dayRec.health?.habits[0].id === 'string', 'Legacy habit item assigned stable UUID');

  // Test 9: Repeated Migration is Idempotent
  const workIdBefore = legacyWork.id;
  initStorage();
  const recordsAfterSecondRun = getAllDailyRecords();
  assert(
    recordsAfterSecondRun['2026-11-05'].work[0].id === workIdBefore,
    'Repeated migration is strictly idempotent; does not re-generate IDs'
  );

  // Test 10: Malformed JSON resilience
  mockStorage.setItem('yester_records_v1', 'MALFORMED_JSON_STRING{{{');
  const safeRecords = getAllDailyRecords();
  assert(typeof safeRecords === 'object' && Object.keys(safeRecords).length === 0, 'Malformed records storage returns empty object safely');

  mockStorage.setItem('yester_plans_v1', 'MALFORMED_PLANS_JSON{{{');
  const safePlans = getAllPlans();
  assert(typeof safePlans === 'object' && Object.keys(safePlans).length === 0, 'Malformed plans storage returns empty object safely');

  // Test 11: Backup Export & Import (Round-trip)
  mockStorage.clear();
  initStorage();
  savePlan(newPlan);
  saveDailyRecord({
    id: '2026-11-10',
    date: '2026-11-10',
    work: [],
    fitness: [],
    learning: [],
    projects: [],
    personal: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const exportedJSON = exportBackupJSON();
  const parsedExport = JSON.parse(exportedJSON);
  assert(parsedExport.version === 1, 'Backup JSON contains schema version 1');
  assert(parsedExport.records !== undefined, 'Backup JSON contains daily records');
  assert(parsedExport.plans !== undefined, 'Backup JSON contains plans');
  assert(parsedExport.plans['test-p1'] !== undefined, 'Backup JSON contains saved plan "test-p1"');

  // Import into a cleared storage
  mockStorage.clear();
  const importSuccess = importBackupJSON(exportedJSON);
  assert(importSuccess === true, 'importBackupJSON successfully restores backup');
  assert(getPlanById('test-p1')?.title === 'Master Go Concurrency', 'Restored backup preserves plans correctly');
  assert(getAllDailyRecords()['2026-11-10'] !== undefined, 'Restored backup preserves daily records');

  // Test 12: Old Backup Compatibility (No plans field in backup)
  const legacyBackupJSON = JSON.stringify({
    version: 1,
    exportedAt: '2025-01-01T00:00:00Z',
    records: {
      '2025-01-01': {
        id: '2025-01-01',
        date: '2025-01-01',
        work: [],
        fitness: [],
        learning: [],
        projects: [],
        personal: [],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    },
    // No plans field!
  });

  const legacyImportResult = importBackupJSON(legacyBackupJSON);
  assert(legacyImportResult === true, 'Older backup without plans imported successfully without error');

  // Test 13: Invalid Imported Data Handling
  const badImport = importBackupJSON('{"someRandomInvalidJson": 123}');
  assert(badImport === false, 'Invalid backup structure safely rejected');

  // Test 14: Storage Quota Failure Handling
  mockStorage.shouldThrowOnSet = true;
  // Should catch and not crash
  const quotaPlanResult = savePlan({ ...newPlan, id: 'quota-test' });
  assert(quotaPlanResult !== null, 'QuotaExceeded handled safely without uncaught exception');
  mockStorage.shouldThrowOnSet = false;

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    throw new Error(`${failed} tests failed!`);
  }
}

runStorageTests();
