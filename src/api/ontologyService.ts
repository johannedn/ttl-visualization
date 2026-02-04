import apiClient from './axiosClient';
import type { OntologyResponse, OntologyRequest } from '../types/ontology';
import type { Triple } from '../utils/ttlParser';

export const ontologyService = {
  // GET /api/ontologies - Get all ontologies
  getAllOntologies: async (): Promise<OntologyResponse[]> => {
    const response = await apiClient.get<OntologyResponse[]>('/api/ontologies');
    return response.data;
  },

  // GET /api/ontologies/latest - Get latest ontology
  getLatestOntology: async (): Promise<OntologyResponse> => {
    const response = await apiClient.get<OntologyResponse>('/api/ontologies/latest');
    return response.data;
  },

  // // POST /api/ontologies - Create/update ontology
  updateOntology: async (
    prompt: string,
    triples: Triple[]
  ): Promise<OntologyResponse> => {
    const response = await apiClient.post(
      '/api/ontologies',
      { prompt, triples }
    )
    return response.data
  },

};