// src/types/history.ts
export interface HistoryEntry {
  version_id: string;
  created_at: number;
  plan_summary: string;
  actor: string;
  parent_version_id?: string | null;
}

export interface RDFTerm {
  kind: string;
  value: string;
  datatype?: string | null;
  lang?: string | null;
}

export interface DiffTriple {
  s: RDFTerm;
  p: RDFTerm;
  o: RDFTerm;
}

export interface HistoryDetail extends HistoryEntry {
  instruction?: string;
  diff?: {
    added: DiffTriple[];
    removed: DiffTriple[];
  };
  new_ontology?: string;
  old_ontology?: string;
  [key: string]: any;
}