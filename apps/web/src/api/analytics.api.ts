import { apiRequest } from './client';
import {
  AnalyticsOverview,
  ActivitySeriesPoint,
  CalendarHeatmapDay,
  CategoryAnalyticsResponse,
  PlanAnalyticsItem,
} from '../types/api';

export interface OverviewQuery {
  startDate?: string;
  endDate?: string;
}

export interface ActivitySeriesQuery {
  startDate?: string;
  endDate?: string;
  granularity?: 'day' | 'week' | 'month';
}

export interface CategoryQuery {
  startDate?: string;
  endDate?: string;
  granularity?: 'month' | 'week';
}

export const analyticsApi = {
  /**
   * High-level activity KPIs, streaks and period-over-period comparisons.
   */
  async getOverview(query: OverviewQuery = {}): Promise<AnalyticsOverview> {
    const params = new URLSearchParams();
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<AnalyticsOverview>(`/analytics/overview${qs}`, {
      method: 'GET',
    });
  },

  /**
   * Chronological activity time-series curve.
   */
  async getActivitySeries(query: ActivitySeriesQuery = {}): Promise<ActivitySeriesPoint[]> {
    const params = new URLSearchParams();
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    if (query.granularity) params.set('granularity', query.granularity);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<ActivitySeriesPoint[]>(`/analytics/activity-series${qs}`, {
      method: 'GET',
    });
  },

  /**
   * Annual contribution-style calendar heatmap.
   */
  async getCalendarHeatmap(year?: number): Promise<{
    year: number;
    days: CalendarHeatmapDay[];
    startWeekday: number;
    totalActiveDays: number;
    totalEntries: number;
  }> {
    const query = year ? `?year=${year}` : '';
    return apiRequest(`/analytics/calendar-heatmap${query}`, {
      method: 'GET',
    });
  },

  /**
   * Category-wise distribution and monthly trends.
   */
  async getCategoryAnalytics(query: CategoryQuery = {}): Promise<CategoryAnalyticsResponse> {
    const params = new URLSearchParams();
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    if (query.granularity) params.set('granularity', query.granularity);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest<CategoryAnalyticsResponse>(`/analytics/categories${qs}`, {
      method: 'GET',
    });
  },

  /**
   * Life Plan time series and progress summaries.
   */
  async getPlanAnalytics(): Promise<PlanAnalyticsItem[]> {
    return apiRequest<PlanAnalyticsItem[]>('/analytics/plans', {
      method: 'GET',
    });
  },
};
