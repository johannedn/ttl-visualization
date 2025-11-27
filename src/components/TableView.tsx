import React from 'react';
import type { Triple } from '../utils/ttlParser';

interface TableViewProps {
  triples: Triple[];
}

export const TableView: React.FC<TableViewProps> = ({ triples }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Subject</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Predicate</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Object</th>
          </tr>
        </thead>
        <tbody>
          {triples.map((triple, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{triple.subject}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{triple.predicate}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{triple.object}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};