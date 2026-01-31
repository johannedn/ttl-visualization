import * as N3 from 'n3';

export interface Triple {
  subject: string;
  predicate: string;
  object: string | {
    kind: 'literal';
    value: string;
    datatype?: string;
    lang?: string;
  };
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
        const obj = quad.object;
        const object = obj.termType === 'Literal'
          ? {
              kind: 'literal',
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