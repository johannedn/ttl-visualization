// src/api/historyService.ts
import apiClient from './axiosClient';

export interface HistoryEntry {
  version_id: string;
  timestamp: string;
  summary: string;
  user: string;
}

export interface HistoryDetail extends HistoryEntry {
  new_ontology?: string;
  old_ontology?: string;
  [key: string]: any;
}

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