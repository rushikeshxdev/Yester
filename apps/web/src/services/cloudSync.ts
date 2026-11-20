/**
 * Yester Sovereign Vault Cloud Sync Service
 * Bridges optimistic client actions with authoritative PostgreSQL persistence.
 */

import { getAccessToken } from '../api/client';
import { dailyRecordsApi } from '../api/dailyRecords.api';
import { entriesApi } from '../api/entries.api';
import { plansApi } from '../api/plans.api';
import { DailyRecord, LifePlan } from '../types';
import {
  CreateEntryDto,
  DailyRecordDto,
  CreatePlanDto,
} from '../types/api';

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function ensureUUID(id: string | undefined): string {
  if (id && UUID_V4_REGEX.test(id)) {
    return id;
  }
  return generateUUID();
}

/**
 * Optimistically syncs a full DailyRecord and all its constituent entries to the cloud.
 */
export async function syncDailyRecordToCloud(record: DailyRecord): Promise<void> {
  if (!getAccessToken()) {
    // Personal mode — local only
    return;
  }

  try {
    const recordUUID = ensureUUID(record.id);

    const recordDto: DailyRecordDto = {
      id: recordUUID,
      headline: record.summary,
      healthData: record.health ? { ...record.health } : undefined,
      reflection: record.reflection ? { ...record.reflection } : undefined,
      createdAt: record.createdAt,
    };

    const serverRecord = await dailyRecordsApi.upsertRecord(record.date, recordDto);

    // Collect all entries across categories
    const allEntries: Array<{
      category: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
      entry: any;
      title: string;
    }> = [];

    (record.work || []).forEach((w) =>
      allEntries.push({
        category: 'WORK',
        entry: w,
        title: w.project || w.tasksPerformed?.[0] || 'Work Activity',
      })
    );
    (record.fitness || []).forEach((f) =>
      allEntries.push({
        category: 'FITNESS',
        entry: f,
        title: `${f.workoutType || 'Workout'} Session`,
      })
    );
    (record.learning || []).forEach((l) =>
      allEntries.push({
        category: 'LEARNING',
        entry: l,
        title: `${l.subject}: ${l.technologyOrConcept}`,
      })
    );
    (record.projects || []).forEach((p) =>
      allEntries.push({
        category: 'PROJECT',
        entry: p,
        title: `${p.projectName}: ${p.objective || 'Progress'}`,
      })
    );
    (record.personal || []).forEach((pe) =>
      allEntries.push({
        category: 'PERSONAL',
        entry: pe,
        title: pe.title || 'Personal Entry',
      })
    );

    // Sync each entry
    for (const item of allEntries) {
      const entryUUID = ensureUUID(item.entry.id);
      const planUUID = item.entry.planId && UUID_V4_REGEX.test(item.entry.planId)
        ? item.entry.planId
        : null;

      const entryDto: CreateEntryDto = {
        id: entryUUID,
        dailyRecordId: serverRecord.id,
        category: item.category,
        title: item.title.slice(0, 255),
        planId: planUUID,
        planContribution: item.entry.planContribution ?? null,
        payload: { ...item.entry },
        createdAt: item.entry.createdAt || new Date().toISOString(),
      };

      try {
        await entriesApi.createEntry(entryDto);
      } catch (err: any) {
        if (err.statusCode === 409) {
          // Entry already exists, update payload and revision
          try {
            await entriesApi.updateEntry(entryUUID, {
              title: entryDto.title,
              category: entryDto.category,
              planId: entryDto.planId,
              planContribution: entryDto.planContribution,
              payload: entryDto.payload,
              expectedRevision: 1,
            });
          } catch {
            // Concurrency or revision mismatch
          }
        }
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Warning: Failed to sync daily record to cloud vault', err);
  }
}

/**
 * Syncs entry deletion to cloud if authenticated.
 */
export async function syncEntryDeleteToCloud(entryId: string): Promise<void> {
  if (!getAccessToken() || !UUID_V4_REGEX.test(entryId)) {
    return;
  }
  try {
    await entriesApi.deleteEntry(entryId);
  } catch (err) {
    console.warn('[CloudSync] Warning: Failed to delete entry on cloud vault', err);
  }
}

/**
 * Syncs life plan creation/update to cloud.
 */
export async function syncPlanToCloud(plan: LifePlan): Promise<void> {
  if (!getAccessToken()) {
    return;
  }
  try {
    const planUUID = ensureUUID(plan.id);
    const dto: CreatePlanDto = {
      id: planUUID,
      title: plan.title,
      statement: plan.statement || undefined,
      category: plan.category.toUpperCase() as any,
      targetValue: plan.targetValue,
      unitLabel: plan.unitLabel || 'units',
      startDate: plan.startDate,
      targetDate: plan.targetDate,
      pacingType: plan.pacingType.toUpperCase() as any,
      createdAt: plan.createdAt,
      milestones: plan.milestones?.map((m) => ({
        id: ensureUUID(m.id),
        title: m.title,
        targetPercent: m.targetPercent,
      })),
    };

    try {
      await plansApi.createPlan(dto);
    } catch (err: any) {
      if (err.statusCode === 409) {
        await plansApi.updatePlan(planUUID, {
          title: dto.title,
          statement: dto.statement,
          category: dto.category,
          targetValue: dto.targetValue,
          unitLabel: dto.unitLabel,
          startDate: dto.startDate,
          targetDate: dto.targetDate,
          pacingType: dto.pacingType,
          status: plan.status.toUpperCase() as any,
          expectedRevision: 1,
        });
      }
    }
  } catch (err) {
    console.warn('[CloudSync] Warning: Failed to sync plan to cloud vault', err);
  }
}

/**
 * Syncs life plan deletion to cloud.
 */
export async function syncPlanDeleteToCloud(planId: string): Promise<void> {
  if (!getAccessToken() || !UUID_V4_REGEX.test(planId)) {
    return;
  }
  try {
    await plansApi.deletePlan(planId);
  } catch (err) {
    console.warn('[CloudSync] Warning: Failed to delete plan on cloud vault', err);
  }
}
