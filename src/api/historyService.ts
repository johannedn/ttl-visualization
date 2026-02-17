import apiClient from './axiosClient';
import type { HistoryEntry, HistoryDetail } from 'types/history';

export const historyService = {
  getAllHistory: async (): Promise<HistoryEntry[]> => {
    const response = await apiClient.get<HistoryEntry[]>('/api/history');
    return response.data;
  },

  getHistoryEntry: async (versionId: string): Promise<HistoryDetail> => {
    const response = await apiClient.get<HistoryDetail>(`/api/history/${versionId}`);
    return response.data;
  },
};