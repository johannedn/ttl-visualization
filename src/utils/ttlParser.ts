import * as N3 from 'n3';

// Types
export interface RDFTerm {
  kind: 'literal' | 'uri';
  value: string;
  datatype?: string;
  lang?: string;
}

export interface Triple {
  subject: string;
  predicate: string;
  object: string | RDFTerm;
}

// Helper functions for RDF terms
export const getRDFValue = (term: string | RDFTerm): string => {
  return typeof term === 'string' ? term : term.value;
};

export const isRDFTerm = (term: unknown): term is RDFTerm => {
  return (
    typeof term === 'object' &&
    term !== null &&
    'kind' in term &&
    'value' in term
  );
};

export const isURI = (str: unknown): boolean => {
  const value = isRDFTerm(str) ? str.value : str;
  return typeof value === 'string' && (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('urn:')
  );
};

export const getShortName = (uri: string | RDFTerm): string => {
  const uriString = getRDFValue(uri);
  if (!isURI(uriString)) return uriString;
  const parts = uriString.split(/[/#]/);
  return parts[parts.length - 1] || uriString;
};

export const getNamespace = (uri: string | RDFTerm): string => {
  const uriString = getRDFValue(uri);
  if (!isURI(uriString)) return '';
  const last = Math.max(uriString.lastIndexOf('/'), uriString.lastIndexOf('#'));
  return uriString.substring(0, last + 1);
};

// Parser function
export const parseTTL = async (ttlContent: string): Promise<Triple[]> => {
  const parser = new N3.Parser();
  const triples: Triple[] = [];

  return new Promise((resolve, reject) => {
    parser.parse(ttlContent, (error, quad, prefixes) => {
      if (error) {
        reject(error);
        return;
      }
      
      if (quad) {
        const obj = quad.object;
        const object = obj.termType === 'Literal'
          ? {
              kind: 'literal' as const,
              value: obj.value,
              datatype: obj.datatype ? obj.datatype.value : undefined,
              lang: obj.language || undefined,
            }
          : obj.value;

        triples.push({
          subject: quad.subject.value,
          predicate: quad.predicate.value,
          object,
        });
      } else {
        // Parsing ferdig
        resolve(triples);
      }
    });
  });
};