import { apiRequest } from './client';
import { CreatePlanDto, UpdatePlanDto, LifePlanResponse } from '../types/api';

export const plansApi = {
  /**
   * List all active life plans for the authenticated user with dynamically derived progress.
   */
  async getPlans(): Promise<LifePlanResponse[]> {
    return apiRequest<LifePlanResponse[]>('/plans', {
      method: 'GET',
    });
  },

  /**
   * Get a life plan by ID with complete trajectory analysis, daily chart data, and evaluated milestones.
   */
  async getPlan(id: string, asOfDate?: string): Promise<LifePlanResponse> {
    const query = asOfDate ? `?asOfDate=${asOfDate}` : '';
    return apiRequest<LifePlanResponse>(`/plans/${id}${query}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new life plan with initial milestones.
   */
  async createPlan(dto: CreatePlanDto): Promise<LifePlanResponse> {
    return apiRequest<LifePlanResponse>('/plans', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Atomically update a life plan.
   */
  async updatePlan(id: string, dto: UpdatePlanDto): Promise<LifePlanResponse> {
    return apiRequest<LifePlanResponse>(`/plans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Soft-delete a life plan.
   */
  async deletePlan(id: string, expectedRevision?: number): Promise<{ message: string; id: string }> {
    const query = expectedRevision !== undefined ? `?expectedRevision=${expectedRevision}` : '';
    return apiRequest<{ message: string; id: string }>(`/plans/${id}${query}`, {
      method: 'DELETE',
    });
  },
};
