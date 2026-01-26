// src/types/history.ts
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