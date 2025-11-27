import * as N3 from 'n3';

export interface Triple {
  subject: string;
  predicate: string;
  object: string;
}

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
        triples.push({
          subject: quad.subject.value,
          predicate: quad.predicate.value,
          object: quad.object.value,
        });
      } else {
        // Parsing ferdig
        resolve(triples);
      }
    });
  });
};