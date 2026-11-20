import { apiRequest } from './client';
import { DailyRecordDto, DailyRecordResponse } from '../types/api';

export const dailyRecordsApi = {
  /**
   * Fetch daily record and entries for a specific calendar date (YYYY-MM-DD).
   * Returns null if not found (404).
   */
  async getRecord(date: string): Promise<DailyRecordResponse | null> {
    try {
      return await apiRequest<DailyRecordResponse>(`/daily-records/${date}`, {
        method: 'GET',
      });
    } catch (err: any) {
      if (err.statusCode === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Atomic upsert with optimistic concurrency control.
   */
  async upsertRecord(date: string, dto: DailyRecordDto): Promise<DailyRecordResponse> {
    return apiRequest<DailyRecordResponse>(`/daily-records/${date}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    });
  },
};
