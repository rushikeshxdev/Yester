/**
 * Sovereign Vault Local-to-Cloud Lossless Migration Tests
 */

import {
  inspectLocalArchive,
  executeLocalMigration,
} from '../migration';
import { DailyRecord, LifePlan } from '../../types';

// Mock localStorage in test environment
const mockStore = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = {
    getItem: (key: string) => mockStore.get(key) || null,
    setItem: (key: string, value: string) => mockStore.set(key, value),
    removeItem: (key: string) => mockStore.delete(key),
    clear: () => mockStore.clear(),
    key: (index: number) => Array.from(mockStore.keys())[index] || null,
    length: mockStore.size,
  } as any;
}

const STORAGE_KEYS = {
  RECORDS: 'yester_records_v1',
  PLANS: 'yester_plans_v1',
};

async function runTests() {
  console.log('Running Sovereign Migration Engine Tests...');
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

  const originalFetch = globalThis.fetch;

  try {
    // ----------------------------------------------------
    // Seed Realistic Local Test Data
    // ----------------------------------------------------
    mockStore.clear();

    const planId = 'c7a4b82d-4190-4e3f-a65c-9c1c110284e1'; // Valid UUID v4
    const testPlans: Record<string, LifePlan> = {
      [planId]: {
        id: planId,
        title: 'Master Systems Engineering',
        statement: 'Deep work on kernel and network protocols',
        category: 'learning',
        startDate: '2026-11-01',
        targetDate: '2026-12-31',
        targetValue: 100,
        unitLabel: 'Hours',
        pacingType: 'linear',
        status: 'active',
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-01T10:00:00.000Z',
        milestones: [
          {
            id: 'd8b5c93e-5201-4f4a-b76d-0d2d221395f2',
            title: '50% Core Milestones',
            targetPercent: 50,
            createdAt: '2026-11-01T10:00:00.000Z',
            updatedAt: '2026-11-01T10:00:00.000Z',
          },
        ],
      },
    };

    const entryId1 = 'e9c6d04f-6312-405b-a87e-1e3e332406a3'; // Valid UUID v4
    const testRecords: Record<string, DailyRecord> = {
      '2026-11-18': {
        id: '2026-11-18', // Date string format
        date: '2026-11-18',
        summary: 'Architected sovereign migration engine',
        createdAt: '2026-11-18T08:30:00.000Z',
        updatedAt: '2026-11-18T22:00:00.000Z',
        work: [
          {
            id: entryId1,
            date: '2026-11-18',
            organization: 'Personal',
            project: 'Sovereign Vault',
            tasksPerformed: ['Implemented token queue and refresh flow'],
            technologiesUsed: ['TypeScript', 'Jest', 'NestJS'],
            evidenceLinks: [],
            planId, // linked to plan
            planContribution: 4,
            createdAt: '2026-11-18T09:00:00.000Z',
            updatedAt: '2026-11-18T18:00:00.000Z',
          },
        ],
        fitness: [],
        learning: [],
        projects: [],
        personal: [],
      },
    };

    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(testPlans));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(testRecords));

    // ----------------------------------------------------
    // Test 1: inspectLocalArchive
    // ----------------------------------------------------
    const inspection = inspectLocalArchive();
    assert(inspection.plansCount === 1, 'Discovered exactly 1 local plan');
    assert(inspection.recordsCount === 1, 'Discovered exactly 1 local record');
    assert(inspection.entriesCount === 1, 'Discovered exactly 1 local entry');

    // ----------------------------------------------------
    // Test 2: Migration Sequence & Payload Verification
    // ----------------------------------------------------
    const callSequence: string[] = [];
    const payloadsCaptured: Record<string, any> = {};

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const body = init?.body ? JSON.parse(String(init.body)) : null;

      if (url.includes('/plans') && init?.method === 'POST') {
        callSequence.push('POST_PLAN');
        payloadsCaptured['plan'] = body;
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: body.id, ...body }),
        } as any;
      }

      if (url.includes('/daily-records/') && init?.method === 'PUT') {
        callSequence.push('PUT_RECORD');
        payloadsCaptured['record'] = body;
        return {
          ok: true,
          status: 200,
          json: async () => ({ id: body.id || 'server-rec-uuid', ...body }),
        } as any;
      }

      if (url.includes('/entries') && init?.method === 'POST') {
        callSequence.push('POST_ENTRY');
        payloadsCaptured['entry'] = body;
        return {
          ok: true,
          status: 201,
          json: async () => ({ id: body.id, ...body }),
        } as any;
      }

      return { ok: true, status: 200, json: async () => ({}) } as any;
    };

    const report1 = await executeLocalMigration();

    // Verify ordering: Plans first -> Records second -> Entries third
    assert(callSequence[0] === 'POST_PLAN', 'Plans are migrated FIRST (relationship dependency order)');
    assert(callSequence[1] === 'PUT_RECORD', 'Daily records are migrated SECOND');
    assert(callSequence[2] === 'POST_ENTRY', 'Entries are migrated THIRD (linking dailyRecordId and planId)');

    // Verify payload integrity
    assert(payloadsCaptured['plan'].id === planId, 'Existing plan UUID v4 preserved');
    assert(payloadsCaptured['plan'].createdAt === '2026-11-01T10:00:00.000Z', 'Plan original createdAt preserved');
    assert(payloadsCaptured['entry'].id === entryId1, 'Entry UUID v4 preserved');
    assert(payloadsCaptured['entry'].createdAt === '2026-11-18T09:00:00.000Z', 'Entry original createdAt preserved');
    assert(payloadsCaptured['entry'].planId === planId, 'Entry correctly links to preserved plan UUID');

    // Verify verification report
    assert(report1.plans.imported === 1, 'Report records 1 plan imported');
    assert(report1.records.imported === 1, 'Report records 1 record imported');
    assert(report1.entries.imported === 1, 'Report records 1 entry imported');
    assert(report1.isComplete === true, 'Migration marked as complete with zero failures');

    // ----------------------------------------------------
    // Test 3: Idempotency & Re-running (No duplicates)
    // ----------------------------------------------------
    callSequence.length = 0;
    const report2 = await executeLocalMigration();

    assert(callSequence.length === 0, 'Re-running migration makes ZERO duplicate network requests');
    assert(report2.plans.existing === 1, 'Re-run reports plan as already existing');
    assert(report2.records.existing === 1, 'Re-run reports daily record as already existing');
    assert(report2.entries.existing === 1, 'Re-run reports entry as already existing');

    // ----------------------------------------------------
    // Test 4: Source Preservation (Never delete local data)
    // ----------------------------------------------------
    const postMigrationPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
    const postMigrationRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);

    assert(postMigrationPlans !== null && JSON.parse(postMigrationPlans)[planId], 'Local plans storage remained completely preserved');
    assert(postMigrationRecords !== null && JSON.parse(postMigrationRecords)['2026-11-18'], 'Local daily records remained completely preserved');

    console.log(`\nMigration Engine Tests Finished: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
