import {
  DailyRecord,
  UserPreferences,
  WorkEntry,
  FitnessEntry,
  LearningEntry,
  ProjectEntry,
  PersonalEntry,
  HealthEntry,
  DailyReflection,
  LifePlan,
} from '../types';
import { generateSampleRecords, generateSamplePlans } from './sampleData';
import { syncDailyRecordToCloud, syncPlanToCloud, syncPlanDeleteToCloud } from './cloudSync';

const SCHEMA_VERSION = 1;
const STORAGE_KEYS = {
  VERSION: 'yester_schema_version',
  RECORDS: `yester_records_v${SCHEMA_VERSION}`,
  PLANS: `yester_plans_v1`,
  PREFERENCES: `yester_preferences_v${SCHEMA_VERSION}`,
  LEGACY_RECORDS: `life_os_records_v${SCHEMA_VERSION}`,
  LEGACY_PREFERENCES: `life_os_preferences_v${SCHEMA_VERSION}`,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  reducedMotion: false,
  firstDayOfWeek: 1,
  dateFormat: 'MDY',
  sampleDataLoaded: true,
};

type StorageListener = () => void;
const listeners = new Set<StorageListener>();

export function subscribeToStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners(): void {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Storage listener execution failed', e);
    }
  });
}

export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback below
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function migrateRecordsData(records: Record<string, DailyRecord>): { records: Record<string, DailyRecord>; changed: boolean } {
  let changed = false;
  const now = new Date().toISOString();

  for (const [, record] of Object.entries(records)) {
    if (!record) continue;

    const checkEntry = (entry: any, defaultIdPrefix: string) => {
      if (!entry) return;
      if (!entry.id) {
        entry.id = `${defaultIdPrefix}-${generateUUID()}`;
        changed = true;
      }
      if (!entry.createdAt) {
        entry.createdAt = record.createdAt || now;
        changed = true;
      }
      if (!entry.updatedAt) {
        entry.updatedAt = record.updatedAt || now;
        changed = true;
      }
    };

    if (Array.isArray(record.work)) {
      record.work.forEach((w) => checkEntry(w, 'work'));
    }
    if (Array.isArray(record.fitness)) {
      record.fitness.forEach((f) => checkEntry(f, 'fit'));
    }
    if (Array.isArray(record.learning)) {
      record.learning.forEach((l) => checkEntry(l, 'learn'));
    }
    if (Array.isArray(record.projects)) {
      record.projects.forEach((p) => checkEntry(p, 'proj'));
    }
    if (Array.isArray(record.personal)) {
      record.personal.forEach((p) => checkEntry(p, 'pers'));
    }
    if (record.health) {
      checkEntry(record.health, 'health');
      if (Array.isArray(record.health.habits)) {
        record.health.habits.forEach((h) => {
          if (!h.id) {
            h.id = `h-${generateUUID()}`;
            changed = true;
          }
        });
      }
    }
    if (record.reflection) {
      checkEntry(record.reflection, 'refl');
    }
  }

  return { records, changed };
}

// Initialize and ensure storage integrity
export function initStorage(): void {
  try {
    const existingVersion = localStorage.getItem(STORAGE_KEYS.VERSION);
    if (!existingVersion) {
      localStorage.setItem(STORAGE_KEYS.VERSION, String(SCHEMA_VERSION));
    }

    // Migrate preferences from legacy if present
    const rawPrefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    const legacyPrefs = localStorage.getItem(STORAGE_KEYS.LEGACY_PREFERENCES);
    if (!rawPrefs) {
      if (legacyPrefs) {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, legacyPrefs);
      } else {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(DEFAULT_PREFERENCES));
      }
    }

    // Migrate records from legacy if present, else seed realistic demonstration data
    const rawRecords = localStorage.getItem(STORAGE_KEYS.RECORDS);
    const legacyRecords = localStorage.getItem(STORAGE_KEYS.LEGACY_RECORDS);
    if (!rawRecords) {
      if (legacyRecords) {
        localStorage.setItem(STORAGE_KEYS.RECORDS, legacyRecords);
      } else {
        const sample = generateSampleRecords();
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(sample));
      }
    }

    // Perform idempotent schema migration to ensure all entries have stable UUIDs & timestamps
    const currentRecords = getAllDailyRecords();
    const { records: migratedRecords, changed } = migrateRecordsData(currentRecords);
    if (changed) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(migratedRecords));
    }

    // Initialize plans storage key
    const rawPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
    let parsedPlans: Record<string, LifePlan> | null = null;
    try {
      if (rawPlans) parsedPlans = JSON.parse(rawPlans);
    } catch {
      parsedPlans = null;
    }
    const prefs = getUserPreferences();
    if (!parsedPlans || Object.keys(parsedPlans).length === 0) {
      if (prefs.sampleDataLoaded) {
        const samplePlans = generateSamplePlans();
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(samplePlans));
      } else {
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify({}));
      }
    }
  } catch (error) {
    console.error('Failed to initialize storage:', error);
  }
}

export function getUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
  try {
    const current = getUserPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updated));
    notifyListeners();
    return updated;
  } catch (err) {
    console.error('Failed to save preferences:', err);
    return DEFAULT_PREFERENCES;
  }
}

export function getAllDailyRecords(): Record<string, DailyRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse daily records from storage:', err);
    return {};
  }
}

export function getDailyRecord(dateKey: string): DailyRecord | null {
  const all = getAllDailyRecords();
  return all[dateKey] || null;
}

export function getOrCreateDailyRecord(dateKey: string): DailyRecord {
  const existing = getDailyRecord(dateKey);
  if (existing) return existing;

  const newRecord: DailyRecord = {
    id: dateKey,
    date: dateKey,
    work: [],
    fitness: [],
    learning: [],
    projects: [],
    personal: [],
    isSampleData: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return newRecord;
}

export function saveDailyRecord(record: DailyRecord): void {
  try {
    const all = getAllDailyRecords();
    const updatedRecord: DailyRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    };
    all[record.date] = updatedRecord;
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(all));
    notifyListeners();
    syncDailyRecordToCloud(updatedRecord);
  } catch (err) {
    console.error('Failed to save daily record:', err);
  }
}

export function deleteDailyRecord(dateKey: string): void {
  try {
    const all = getAllDailyRecords();
    if (all[dateKey]) {
      delete all[dateKey];
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(all));
      notifyListeners();
    }
  } catch (err) {
    console.error('Failed to delete daily record:', err);
  }
}

// Specific entry helpers
export function addOrUpdateWorkEntry(dateKey: string, entry: WorkEntry): void {
  const record = getOrCreateDailyRecord(dateKey);
  const existingIndex = record.work.findIndex((w) => w.id === entry.id);
  if (existingIndex >= 0) {
    record.work[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    record.work.push({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  record.isSampleData = false;
  saveDailyRecord(record);
}

export function deleteWorkEntry(dateKey: string, entryId: string): void {
  const record = getDailyRecord(dateKey);
  if (!record) return;
  record.work = record.work.filter((w) => w.id !== entryId);
  saveDailyRecord(record);
}

export function addOrUpdateFitnessEntry(dateKey: string, entry: FitnessEntry): void {
  const record = getOrCreateDailyRecord(dateKey);
  const existingIndex = record.fitness.findIndex((f) => f.id === entry.id);
  if (existingIndex >= 0) {
    record.fitness[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    record.fitness.push({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  record.isSampleData = false;
  saveDailyRecord(record);
}

export function deleteFitnessEntry(dateKey: string, entryId: string): void {
  const record = getDailyRecord(dateKey);
  if (!record) return;
  record.fitness = record.fitness.filter((f) => f.id !== entryId);
  saveDailyRecord(record);
}

export function addOrUpdateLearningEntry(dateKey: string, entry: LearningEntry): void {
  const record = getOrCreateDailyRecord(dateKey);
  const existingIndex = record.learning.findIndex((l) => l.id === entry.id);
  if (existingIndex >= 0) {
    record.learning[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    record.learning.push({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  record.isSampleData = false;
  saveDailyRecord(record);
}

export function deleteLearningEntry(dateKey: string, entryId: string): void {
  const record = getDailyRecord(dateKey);
  if (!record) return;
  record.learning = record.learning.filter((l) => l.id !== entryId);
  saveDailyRecord(record);
}

export function addOrUpdateProjectEntry(dateKey: string, entry: ProjectEntry): void {
  const record = getOrCreateDailyRecord(dateKey);
  const existingIndex = record.projects.findIndex((p) => p.id === entry.id);
  if (existingIndex >= 0) {
    record.projects[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    record.projects.push({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  record.isSampleData = false;
  saveDailyRecord(record);
}

export function deleteProjectEntry(dateKey: string, entryId: string): void {
  const record = getDailyRecord(dateKey);
  if (!record) return;
  record.projects = record.projects.filter((p) => p.id !== entryId);
  saveDailyRecord(record);
}

export function addOrUpdatePersonalEntry(dateKey: string, entry: PersonalEntry): void {
  const record = getOrCreateDailyRecord(dateKey);
  const existingIndex = record.personal.findIndex((p) => p.id === entry.id);
  if (existingIndex >= 0) {
    record.personal[existingIndex] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    record.personal.push({ ...entry, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  record.isSampleData = false;
  saveDailyRecord(record);
}

export function deletePersonalEntry(dateKey: string, entryId: string): void {
  const record = getDailyRecord(dateKey);
  if (!record) return;
  record.personal = record.personal.filter((p) => p.id !== entryId);
  saveDailyRecord(record);
}

export function updateHealthEntry(dateKey: string, entry: HealthEntry): void {
  const record = getOrCreateDailyRecord(dateKey);
  record.health = { ...entry, updatedAt: new Date().toISOString() };
  record.isSampleData = false;
  saveDailyRecord(record);
}

export function updateDailyReflection(dateKey: string, reflection: DailyReflection): void {
  const record = getOrCreateDailyRecord(dateKey);
  record.reflection = { ...reflection, updatedAt: new Date().toISOString() };
  record.isSampleData = false;
  saveDailyRecord(record);
}

// ---------------------------------------------------------
// Life Plans Operations
// ---------------------------------------------------------

export function getAllPlans(): Record<string, LifePlan> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse plans from storage:', err);
    return {};
  }
}

export function getPlanById(id: string): LifePlan | null {
  const all = getAllPlans();
  return all[id] || null;
}

export function savePlan(plan: LifePlan): LifePlan {
  try {
    const all = getAllPlans();
    const now = new Date().toISOString();
    const existing = all[plan.id];
    const updatedPlan: LifePlan = {
      ...plan,
      id: plan.id || `plan-${generateUUID()}`,
      createdAt: existing ? existing.createdAt : (plan.createdAt || now),
      updatedAt: now,
    };
    all[updatedPlan.id] = updatedPlan;
    localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(all));
    notifyListeners();
    syncPlanToCloud(updatedPlan);
    return updatedPlan;
  } catch (err) {
    console.error('Failed to save plan:', err);
    return plan;
  }
}

export function archivePlan(id: string): void {
  const plan = getPlanById(id);
  if (!plan) return;
  savePlan({ ...plan, status: 'archived' });
}

export function completePlan(id: string): void {
  const plan = getPlanById(id);
  if (!plan) return;
  savePlan({ ...plan, status: 'completed' });
}

export function deletePlan(id: string): void {
  try {
    const all = getAllPlans();
    if (all[id]) {
      delete all[id];
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(all));
      notifyListeners();
      syncPlanDeleteToCloud(id);
    }
  } catch (err) {
    console.error('Failed to delete plan:', err);
  }
}

// Sample and Data Management
export function loadDemonstrationData(): void {
  const sample = generateSampleRecords();
  const all = getAllDailyRecords();
  const merged = { ...all, ...sample };
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(merged));

  const samplePlans = generateSamplePlans();
  const allPlans = getAllPlans();
  const mergedPlans = { ...allPlans, ...samplePlans };
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(mergedPlans));

  saveUserPreferences({ sampleDataLoaded: true });
  notifyListeners();
}

export function clearDemonstrationData(): void {
  const all = getAllDailyRecords();
  const filtered: Record<string, DailyRecord> = {};
  for (const [date, record] of Object.entries(all)) {
    if (!record.isSampleData) {
      filtered[date] = record;
    }
  }
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(filtered));

  const samplePlanIds = new Set([
    'plan-backend-eng',
    'plan-marathon',
    'plan-distributed-learning',
    'plan-completed-rust',
    'plan-archived-french',
  ]);
  const allPlans = getAllPlans();
  const filteredPlans: Record<string, LifePlan> = {};
  for (const [id, plan] of Object.entries(allPlans)) {
    if (!samplePlanIds.has(id)) {
      filteredPlans[id] = plan;
    }
  }
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(filteredPlans));

  saveUserPreferences({ sampleDataLoaded: false });
  notifyListeners();
}

export function clearAllUserData(): void {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify({}));
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify({}));
  saveUserPreferences({ sampleDataLoaded: false });
  notifyListeners();
}

export function exportBackupJSON(): string {
  const allRecords = getAllDailyRecords();
  const allPlans = getAllPlans();
  const prefs = getUserPreferences();
  const backup = {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    preferences: prefs,
    records: allRecords,
    plans: allPlans,
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data && typeof data === 'object' && data.records && typeof data.records === 'object') {
      const { records: migratedRecords } = migrateRecordsData(data.records);
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(migratedRecords));
      if (data.preferences && typeof data.preferences === 'object') {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
      }
      if (data.plans && typeof data.plans === 'object') {
        localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(data.plans));
      }
      notifyListeners();
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to import backup JSON:', err);
    return false;
  }
}

