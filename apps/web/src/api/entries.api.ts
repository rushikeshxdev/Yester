import { apiRequest } from './client';
import { CreateEntryDto, UpdateEntryDto, DailyEntryResponse } from '../types/api';

export const entriesApi = {
  /**
   * Fetch an entry by ID.
   */
  async getEntry(id: string): Promise<DailyEntryResponse> {
    return apiRequest<DailyEntryResponse>(`/entries/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new granular daily entry.
   */
  async createEntry(dto: CreateEntryDto): Promise<DailyEntryResponse> {
    return apiRequest<DailyEntryResponse>('/entries', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Atomically update an entry with optimistic concurrency control.
   */
  async updateEntry(id: string, dto: UpdateEntryDto): Promise<DailyEntryResponse> {
    return apiRequest<DailyEntryResponse>(`/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  },

  /**
   * Soft-delete an entry.
   */
  async deleteEntry(id: string, expectedRevision?: number): Promise<{ message: string; id: string }> {
    const query = expectedRevision !== undefined ? `?expectedRevision=${expectedRevision}` : '';
    return apiRequest<{ message: string; id: string }>(`/entries/${id}${query}`, {
      method: 'DELETE',
    });
  },
};
