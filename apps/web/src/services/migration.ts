/**
 * Yester Sovereign Migration Engine
 * Losslessly migrates local browser archive into the user's sovereign PostgreSQL vault.
 * 
 * Invariants:
 * 1. Stable UUIDs & Timestamps preserved.
 * 2. Plans migrated before Daily Records & Entries (relationship preservation).
 * 3. 100% Idempotent & Resumable (tracking set prevents duplicate insertion).
 * 4. Never deletes or mutates source localStorage data.
 * 5. Full audit verification report returned.
 */

import { getAllDailyRecords, getAllPlans } from './storage';
import { plansApi } from '../api/plans.api';
import { dailyRecordsApi } from '../api/dailyRecords.api';
import { entriesApi } from '../api/entries.api';
import {
  CreatePlanDto,
  DailyRecordDto,
  CreateEntryDto,
} from '../types/api';

const MIGRATION_TRACKING_KEY = 'yester_migrated_item_ids_v1';
const ID_MAPPING_KEY = 'yester_migrated_id_mappings_v1';

export interface MigrationItemReport {
  discovered: number;
  imported: number;
  existing: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export interface MigrationReport {
  plans: MigrationItemReport;
  records: MigrationItemReport;
  entries: MigrationItemReport;
  isComplete: boolean;
}

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_V4_REGEX.test(id);
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getTrackingSet(): Set<string> {
  try {
    const raw = localStorage.getItem(MIGRATION_TRACKING_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveTrackingSet(set: Set<string>): void {
  try {
    localStorage.setItem(MIGRATION_TRACKING_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error('Failed to save migration tracking set', e);
  }
}

function getIdMapping(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ID_MAPPING_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveIdMapping(mapping: Record<string, string>): void {
  try {
    localStorage.setItem(ID_MAPPING_KEY, JSON.stringify(mapping));
  } catch (e) {
    console.error('Failed to save migration ID mapping', e);
  }
}

/**
 * Resolves a local entity ID to a valid UUID v4.
 * If already a valid UUID v4, preserves it.
 * If legacy string (e.g. 'plan-sample-1'), creates/retrieves a stable mapped UUID.
 */
function resolveUUID(rawId: string, mapping: Record<string, string>): string {
  if (isValidUUID(rawId)) {
    return rawId;
  }
  if (mapping[rawId]) {
    return mapping[rawId];
  }
  const minted = generateUUID();
  mapping[rawId] = minted;
  saveIdMapping(mapping);
  return minted;
}

/**
 * Scans local storage to inspect discovery counts without modifying anything.
 */
export function inspectLocalArchive(): {
  plansCount: number;
  recordsCount: number;
  entriesCount: number;
} {
  const localPlans = getAllPlans();
  const localRecords = getAllDailyRecords();

  let entriesCount = 0;
  Object.values(localRecords).forEach((rec) => {
    if (!rec) return;
    entriesCount += (rec.work?.length || 0);
    entriesCount += (rec.fitness?.length || 0);
    entriesCount += (rec.learning?.length || 0);
    entriesCount += (rec.projects?.length || 0);
    entriesCount += (rec.personal?.length || 0);
  });

  return {
    plansCount: Object.keys(localPlans).length,
    recordsCount: Object.keys(localRecords).length,
    entriesCount,
  };
}

export type MigrationProgressCallback = (
  phase: 'plans' | 'records' | 'entries',
  current: number,
  total: number,
  currentItemTitle: string,
) => void;

/**
 * Executes a lossless, idempotent migration from local storage to the user's sovereign vault.
 */
export async function executeLocalMigration(
  onProgress?: MigrationProgressCallback,
): Promise<MigrationReport> {
  const trackingSet = getTrackingSet();
  const idMapping = getIdMapping();

  const report: MigrationReport = {
    plans: { discovered: 0, imported: 0, existing: 0, failed: 0, errors: [] },
    records: { discovered: 0, imported: 0, existing: 0, failed: 0, errors: [] },
    entries: { discovered: 0, imported: 0, existing: 0, failed: 0, errors: [] },
    isComplete: false,
  };

  const localPlans = getAllPlans();
  const localRecords = getAllDailyRecords();

  const planList = Object.values(localPlans);
  report.plans.discovered = planList.length;

  // ----------------------------------------------------
  // Phase 1: Migrate Life Plans (Preserve UUIDs & Milestones)
  // ----------------------------------------------------
  for (let i = 0; i < planList.length; i++) {
    const plan = planList[i];
    const planUUID = resolveUUID(plan.id, idMapping);
    onProgress?.('plans', i + 1, planList.length, plan.title);

    if (trackingSet.has(`plan:${planUUID}`)) {
      report.plans.existing++;
      continue;
    }

    try {
      const categoryUpper = (plan.category || 'project').toUpperCase() as any;
      const pacingUpper = (plan.pacingType || 'linear').toUpperCase() as any;

      const planDto: CreatePlanDto = {
        id: planUUID,
        title: plan.title,
        statement: plan.statement || undefined,
        category: categoryUpper,
        targetValue: plan.targetValue,
        unitLabel: plan.unitLabel || 'units',
        startDate: plan.startDate,
        targetDate: plan.targetDate,
        pacingType: pacingUpper,
        createdAt: plan.createdAt || new Date().toISOString(),
        milestones: plan.milestones?.map((m) => ({
          id: resolveUUID(m.id, idMapping),
          title: m.title,
          targetPercent: m.targetPercent,
        })),
      };

      await plansApi.createPlan(planDto);
      trackingSet.add(`plan:${planUUID}`);
      saveTrackingSet(trackingSet);
      report.plans.imported++;
    } catch (err: any) {
      // If 409 conflict, plan already exists in vault
      if (err.statusCode === 409) {
        trackingSet.add(`plan:${planUUID}`);
        saveTrackingSet(trackingSet);
        report.plans.existing++;
      } else {
        report.plans.failed++;
        report.plans.errors.push({ id: plan.id, error: err.message || 'Unknown error' });
      }
    }
  }

  // ----------------------------------------------------
  // Phase 2: Migrate Daily Records (Envelopes)
  // ----------------------------------------------------
  const recordList = Object.values(localRecords);
  report.records.discovered = recordList.length;

  // Map to store record server ID by calendar date (YYYY-MM-DD)
  const dateToRecordIdMap: Record<string, string> = {};

  for (let i = 0; i < recordList.length; i++) {
    const rec = recordList[i];
    if (!rec || !rec.date) continue;

    const recordUUID = resolveUUID(rec.id || rec.date, idMapping);
    dateToRecordIdMap[rec.date] = recordUUID;
    onProgress?.('records', i + 1, recordList.length, `Day: ${rec.date}`);

    if (trackingSet.has(`record:${rec.date}`)) {
      report.records.existing++;
      continue;
    }

    try {
      const recordDto: DailyRecordDto = {
        id: recordUUID,
        headline: rec.summary || rec.reflection?.wentWell || undefined,
        healthData: rec.health ? { ...rec.health } : undefined,
        reflection: rec.reflection ? { ...rec.reflection } : undefined,
        createdAt: rec.createdAt || new Date().toISOString(),
      };

      const serverRecord = await dailyRecordsApi.upsertRecord(rec.date, recordDto);
      dateToRecordIdMap[rec.date] = serverRecord.id;

      trackingSet.add(`record:${rec.date}`);
      saveTrackingSet(trackingSet);
      report.records.imported++;
    } catch (err: any) {
      report.records.failed++;
      report.records.errors.push({ id: rec.date, error: err.message || 'Unknown error' });
    }
  }

  // ----------------------------------------------------
  // Phase 3: Migrate Entries (Linked to Plans & Records)
  // ----------------------------------------------------
  interface UnflattenedEntry {
    date: string;
    category: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
    entry: any;
  }

  const allEntries: UnflattenedEntry[] = [];
  recordList.forEach((r) => {
    if (!r) return;
    (r.work || []).forEach((w) => allEntries.push({ date: r.date, category: 'WORK', entry: w }));
    (r.fitness || []).forEach((f) => allEntries.push({ date: r.date, category: 'FITNESS', entry: f }));
    (r.learning || []).forEach((l) => allEntries.push({ date: r.date, category: 'LEARNING', entry: l }));
    (r.projects || []).forEach((p) => allEntries.push({ date: r.date, category: 'PROJECT', entry: p }));
    (r.personal || []).forEach((pe) => allEntries.push({ date: r.date, category: 'PERSONAL', entry: pe }));
  });

  report.entries.discovered = allEntries.length;

  for (let i = 0; i < allEntries.length; i++) {
    const item = allEntries[i];
    const rawId = item.entry.id || `${item.category.toLowerCase()}-${i}`;
    const entryUUID = resolveUUID(rawId, idMapping);
    const dailyRecordId = dateToRecordIdMap[item.date];

    onProgress?.('entries', i + 1, allEntries.length, item.entry.title || item.category);

    if (trackingSet.has(`entry:${entryUUID}`)) {
      report.entries.existing++;
      continue;
    }

    if (!dailyRecordId) {
      report.entries.failed++;
      report.entries.errors.push({
        id: rawId,
        error: `Parent DailyRecord for date ${item.date} was not established`,
      });
      continue;
    }

    try {
      // Determine title
      let title = item.entry.title;
      if (!title) {
        if (item.category === 'WORK') title = item.entry.project || item.entry.tasksPerformed?.[0] || 'Work Activity';
        else if (item.category === 'FITNESS') title = `${item.entry.workoutType || 'Workout'} Session`;
        else if (item.category === 'LEARNING') title = item.entry.subject || 'Learning Activity';
        else if (item.category === 'PROJECT') title = item.entry.projectName || 'Project Activity';
        else title = 'Personal Entry';
      }

      // Resolve linked plan UUID if present
      let planId: string | null = null;
      if (item.entry.planId) {
        planId = resolveUUID(item.entry.planId, idMapping);
      }

      const entryDto: CreateEntryDto = {
        id: entryUUID,
        dailyRecordId,
        category: item.category,
        title: title.slice(0, 255),
        planId,
        planContribution: item.entry.planContribution ?? null,
        payload: { ...item.entry },
        createdAt: item.entry.createdAt || new Date().toISOString(),
      };

      await entriesApi.createEntry(entryDto);
      trackingSet.add(`entry:${entryUUID}`);
      saveTrackingSet(trackingSet);
      report.entries.imported++;
    } catch (err: any) {
      if (err.statusCode === 409) {
        trackingSet.add(`entry:${entryUUID}`);
        saveTrackingSet(trackingSet);
        report.entries.existing++;
      } else {
        report.entries.failed++;
        report.entries.errors.push({ id: rawId, error: err.message || 'Unknown error' });
      }
    }
  }

  report.isComplete =
    report.plans.failed === 0 &&
    report.records.failed === 0 &&
    report.entries.failed === 0;

  return report;
}
