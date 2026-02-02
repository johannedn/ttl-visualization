// src/api/historyService.ts
import apiClient from './axiosClient';
import type { HistoryEntry, HistoryDetail } from 'types/history';

export const historyService = {
  // GET /api/history - Get all history entries
  getAllHistory: async (): Promise<HistoryEntry[]> => {
    const response = await apiClient.get<HistoryEntry[]>('/api/history');
    return response.data;
  },

  // GET /api/history/{version_id} - Get specific history entry
  getHistoryEntry: async (versionId: string): Promise<HistoryDetail> => {
    const response = await apiClient.get<HistoryDetail>(`/api/history/${versionId}`);
    return response.data;
  },
};