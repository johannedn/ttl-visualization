// src/components/TableViewCompact.tsx
import React, { useState } from 'react';
import type { Triple } from '../utils/ttlParser';

interface TableViewCompactProps {
  triples: Triple[];
}

const isURI = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('urn:');
};

const getShortName = (uri: string): string => {
  if (isURI(uri)) {
    const parts = uri.split(/[/#]/);
    return parts[parts.length - 1] || uri;
  }
  return uri;
};

export const TableView: React.FC<TableViewCompactProps> = ({ triples }) => {
  const [filter, setFilter] = useState('');

  const filteredTriples = triples.filter(triple => {
    if (!filter) return true;
    const searchLower = filter.toLowerCase();
    return (
      getShortName(triple.subject).toLowerCase().includes(searchLower) ||
      getShortName(triple.predicate).toLowerCase().includes(searchLower) ||
      getShortName(triple.object).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Søk..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            width: '100%',
            maxWidth: '400px'
          }}
        />
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '13px'
        }}>
          <thead style={{ 
            position: 'sticky', 
            top: 0, 
            backgroundColor: '#2c3e50',
            color: 'white',
            zIndex: 1
          }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>Subject</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Predicate</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Object</th>
            </tr>
          </thead>
          <tbody>
            {filteredTriples.map((triple, index) => (
              <tr 
                key={index}
                style={{ 
                  borderBottom: '1px solid #ecf0f1',
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa'
                }}
              >
                <td 
                  style={{ padding: '10px' }}
                  title={triple.subject}
                >
                  <code style={{ 
                    backgroundColor: '#e8f4f8', 
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '12px'
                  }}>
                    {getShortName(triple.subject)}
                  </code>
                </td>
                <td 
                  style={{ padding: '10px', color: '#3498db' }}
                  title={triple.predicate}
                >
                  <strong>{getShortName(triple.predicate)}</strong>
                </td>
                <td 
                  style={{ padding: '10px' }}
                  title={triple.object}
                >
                  {isURI(triple.object) ? (
                    <code style={{ 
                      backgroundColor: '#e8f4f8', 
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '12px'
                    }}>
                      {getShortName(triple.object)}
                    </code>
                  ) : (
                    <em style={{ color: '#7f8c8d' }}>{triple.object}</em>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};