export type ActivityCategory =
  | 'work'
  | 'fitness'
  | 'learning'
  | 'project'
  | 'personal'
  | 'health';

export interface EvidenceLink {
  id: string;
  label: string;
  url: string;
}

export interface WorkEntry {
  id: string;
  date: string; // YYYY-MM-DD
  organization: string;
  project: string;
  role?: string;
  tasksPerformed: string[];
  problemsIdentified?: string;
  rootCauses?: string;
  approachTaken?: string;
  solutionImplemented?: string;
  technicalDecisions?: string;
  technologiesUsed: string[];
  outcomeImpact?: string;
  evidenceLinks: EvidenceLink[];
  whatILearned?: string;
  reflections?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExerciseSet {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weightKg?: number;
}

export interface CardioDetail {
  type: string;
  durationMinutes: number;
  distanceKm?: number;
  heartRateAvg?: number;
}

export interface FitnessEntry {
  id: string;
  date: string; // YYYY-MM-DD
  workoutType: 'Strength' | 'Cardio' | 'HIIT' | 'Mobility' | 'Sports' | 'Recovery';
  muscleGroups: string[];
  exercises: ExerciseSet[];
  cardio?: CardioDetail;
  workoutDurationMinutes: number;
  bodyweightKg?: number;
  personalRecords?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningEntry {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  technologyOrConcept: string;
  learningSource: string; // e.g. Book, Course, RFC, Documentation
  studyDurationMinutes: number;
  notes?: string;
  practicalImplementation?: string;
  problemsSolved?: string[];
  whatIUnderstood?: string;
  whatToImprove?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectEntry {
  id: string;
  date: string; // YYYY-MM-DD
  projectName: string;
  objective: string;
  tasksCompleted: string[];
  technicalImplementation?: string;
  decisions?: string;
  blockers?: string;
  progressPercentage?: number;
  nextSteps?: string;
  repositoryLinks: EvidenceLink[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PersonalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: 'family' | 'friends' | 'experience' | 'milestone' | 'memory' | 'general';
  peopleInvolved?: string[];
  description: string;
  significance?: string;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyHabit {
  id: string;
  name: string;
  completed: boolean;
}

export interface CustomMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
}

export interface HealthEntry {
  id: string;
  date: string; // YYYY-MM-DD
  sleepHours: number;
  sleepQuality?: 'restful' | 'average' | 'disrupted';
  waterIntakeLiters: number;
  habits: DailyHabit[];
  customMetrics?: CustomMetric[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyReflection {
  id: string;
  date: string; // YYYY-MM-DD
  wentWell?: string;
  wentWrong?: string;
  learned?: string;
  shouldImprove?: string;
  prioritiesTomorrow?: string[];
  freeformNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyRecord {
  id: string; // date string or uuid
  date: string; // YYYY-MM-DD
  work: WorkEntry[];
  fitness: FitnessEntry[];
  learning: LearningEntry[];
  projects: ProjectEntry[];
  personal: PersonalEntry[];
  health?: HealthEntry;
  reflection?: DailyReflection;
  summary?: string;
  isSampleData?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  reducedMotion: boolean;
  firstDayOfWeek: 0 | 1; // 0 = Sunday, 1 = Monday
  dateFormat: 'MDY' | 'DMY' | 'YMD';
  hasSeenOnboarding?: boolean;
  sampleDataLoaded?: boolean;
}

export type ScreenMode = 'year' | 'month' | 'calendar' | 'daily' | 'analytics' | 'search';

export interface SearchResultItem {
  id: string;
  date: string;
  category: ActivityCategory | 'reflection' | 'summary';
  title: string;
  subtitle?: string;
  snippet: string;
  tags?: string[];
  entity?: any;
}

export interface CalendarMonthMeta {
  year: number;
  month: number; // 1-12
  monthName: string;
  shortName: string;
  daysCount: number;
  totalRecordsCount: number;
  categoryCounts: Record<ActivityCategory, number>;
  hasActivity: boolean;
}

export interface DayActivitySummary {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  totalEntries: number;
  hasWork: boolean;
  hasFitness: boolean;
  hasLearning: boolean;
  hasProject: boolean;
  hasPersonal: boolean;
  hasHealth: boolean;
  hasReflection: boolean;
  record?: DailyRecord;
}

export interface CategoryMonthlyMetrics {
  category: ActivityCategory;
  categoryLabel: string;
  activeDaysCount: number;
  totalEntriesCount: number;
  metric1: { label: string; value: string | number };
  metric2: { label: string; value: string | number };
  metric3: { label: string; value: string | number };
  trendData: Array<{ date: string; day: number; value: number }>;
}

