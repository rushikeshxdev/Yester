/**
 * Yester Sovereign Vault API Type Definitions
 * Maps strictly to NestJS REST controllers and Prisma entities.
 */

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string | null;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: number;
}

export interface ApiErrorPayload {
  statusCode: number;
  message: string | string[];
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
  timestamp?: string;
  path?: string;
}

export class ApiError extends Error {
  statusCode: number;
  error?: string;
  detail?: string;
  validationErrors?: Record<string, string[]>;

  constructor(payload: ApiErrorPayload) {
    const msg = Array.isArray(payload.message)
      ? payload.message.join(', ')
      : payload.message || payload.detail || payload.error || 'Request failed';
    super(msg);
    this.name = 'ApiError';
    this.statusCode = payload.statusCode;
    this.error = payload.error;
    this.detail = payload.detail;
    this.validationErrors = payload.errors;
  }
}

export interface DailyRecordDto {
  id?: string;
  headline?: string;
  healthData?: Record<string, any>;
  reflection?: Record<string, any>;
  expectedRevision?: number;
  createdAt?: string;
}

export interface DailyEntryResponse {
  id: string;
  userId: string;
  dailyRecordId: string;
  category: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
  title: string;
  planId: string | null;
  planContribution: number | null;
  payload: Record<string, any>;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface DailyRecordResponse {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  headline: string | null;
  healthData: Record<string, any> | null;
  reflection: Record<string, any> | null;
  revision: number;
  createdAt: string;
  updatedAt: string;
  entries: DailyEntryResponse[];
}

export interface CreateEntryDto {
  id?: string;
  dailyRecordId: string;
  category: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
  title: string;
  planId?: string | null;
  planContribution?: number | null;
  payload?: Record<string, any>;
  createdAt?: string;
}

export interface UpdateEntryDto {
  title?: string;
  category?: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
  planId?: string | null;
  planContribution?: number | null;
  payload?: Record<string, any>;
  expectedRevision: number;
}

export interface MilestoneResponse {
  id: string;
  planId: string;
  title: string;
  targetPercent: number;
  targetValue: number;
  isReached: boolean;
  reachedDate: string | null;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface LifePlanResponse {
  id: string;
  userId: string;
  title: string;
  statement: string | null;
  category: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
  targetValue: number;
  unitLabel: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  pacingType: 'LINEAR' | 'RAMP_UP' | 'FRONT_LOADED';
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  revision: number;
  createdAt: string;
  updatedAt: string;
  milestones: MilestoneResponse[];
  derived?: {
    currentContribution: number;
    completionPercent: number;
    expectedContribution: number;
    expectedPercent: number;
    paceStatus: 'AHEAD' | 'ON_PACE' | 'BEHIND';
    remainingValue: number;
    daysRemaining: number;
    daysElapsed: number;
  };
}

export interface CreateMilestoneDto {
  id?: string;
  title: string;
  targetPercent: number;
}

export interface CreatePlanDto {
  id?: string;
  title: string;
  statement?: string;
  category: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
  targetValue: number;
  unitLabel?: string;
  startDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  pacingType?: 'LINEAR' | 'RAMP_UP' | 'FRONT_LOADED';
  milestones?: CreateMilestoneDto[];
  createdAt?: string;
}

export interface UpdatePlanDto {
  title?: string;
  statement?: string;
  category?: 'WORK' | 'FITNESS' | 'LEARNING' | 'PROJECT' | 'PERSONAL';
  targetValue?: number;
  unitLabel?: string;
  startDate?: string;
  targetDate?: string;
  pacingType?: 'LINEAR' | 'RAMP_UP' | 'FRONT_LOADED';
  status?: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  expectedRevision: number;
}

// Analytics responses
export interface AnalyticsOverview {
  totalActiveDays: number;
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  activeLifePlans: number;
  consistencyRate: number;
  previousPeriod: {
    totalActiveDays: number;
    totalEntries: number;
    consistencyRate: number;
  };
}

export interface ActivitySeriesPoint {
  date: string;
  entriesCount: number;
  workCount: number;
  fitnessCount: number;
  learningCount: number;
  projectCount: number;
  personalCount: number;
}

export interface CalendarHeatmapDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface CategoryDistribution {
  category: string;
  count: number;
  percentage: number;
}

export interface CategoryComparisonPeriod {
  period: string; // YYYY-MM or YYYY-WW
  WORK: number;
  FITNESS: number;
  LEARNING: number;
  PROJECT: number;
  PERSONAL: number;
}

export interface CategoryAnalyticsResponse {
  distribution: CategoryDistribution[];
  trends: CategoryComparisonPeriod[];
}

export interface PlanDatedProgressPoint {
  date: string;
  actualCumulative: number;
  expectedCumulative: number;
  targetValue: number;
  status: string;
}

export interface PlanAnalyticsItem {
  id: string;
  title: string;
  category: string;
  targetValue: number;
  unitLabel: string;
  currentValue: number;
  currentPercent: number;
  paceStatus: 'AHEAD' | 'ON_PACE' | 'BEHIND';
  timeSeries: PlanDatedProgressPoint[];
}
