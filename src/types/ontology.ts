export interface OntologyResponse {
  filename: string;
  content: string;
  created_at: number;
  description?: string;
}

export interface OntologyRequest {
  prompt: string;
}