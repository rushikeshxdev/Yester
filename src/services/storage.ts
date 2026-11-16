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
} from '../types';
import { generateSampleRecords } from './sampleData';

const SCHEMA_VERSION = 1;
const STORAGE_KEYS = {
  VERSION: 'yester_schema_version',
  RECORDS: `yester_records_v${SCHEMA_VERSION}`,
  PREFERENCES: `yester_preferences_v${SCHEMA_VERSION}`,
  LEGACY_RECORDS: `life_os_records_v${SCHEMA_VERSION}`,
  LEGACY_PREFERENCES: `life_os_preferences_v${SCHEMA_VERSION}`,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  reducedMotion: false,
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

// Sample and Data Management
export function loadDemonstrationData(): void {
  const sample = generateSampleRecords();
  const all = getAllDailyRecords();
  const merged = { ...all, ...sample };
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(merged));
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
  saveUserPreferences({ sampleDataLoaded: false });
  notifyListeners();
}

export function clearAllUserData(): void {
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify({}));
  saveUserPreferences({ sampleDataLoaded: false });
  notifyListeners();
}

export function exportBackupJSON(): string {
  const allRecords = getAllDailyRecords();
  const prefs = getUserPreferences();
  const backup = {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    preferences: prefs,
    records: allRecords,
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (data && typeof data === 'object' && data.records) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(data.records));
      if (data.preferences) {
        localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
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

