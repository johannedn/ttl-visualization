import React, { useState, useMemo } from 'react';
import type { Triple } from '../utils/ttlParser';

interface TableViewProps {
  triples: Triple[];
}

// Hjelpefunksjoner
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

const getNamespace = (uri: string): string => {
  if (isURI(uri)) {
    const lastSlash = Math.max(uri.lastIndexOf('/'), uri.lastIndexOf('#'));
    return uri.substring(0, lastSlash + 1);
  }
  return '';
};

const TableViewComponent: React.FC<TableViewProps> = ({ triples }) => {
  const [showFullURI, setShowFullURI] = useState(false);
  const [filter, setFilter] = useState('');

  // Filtrer triples basert på søk - memoized for performance
  const filteredTriples = useMemo(() => {
    if (!filter) return triples;
    const searchLower = filter.toLowerCase();
    return triples.filter(triple =>
      triple.subject.toLowerCase().includes(searchLower) ||
      triple.predicate.toLowerCase().includes(searchLower) ||
      triple.object.toLowerCase().includes(searchLower)
    );
  }, [triples, filter]);

  const formatValue = (value: string, isFullURI: boolean) => {
    if (isFullURI) {
      return value;
    }
    return getShortName(value);
  };

  return (
    <div style={{ width: '100%', padding: '0' }}>
      {/* Kontroller */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search in triples..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            flex: 1,
            maxWidth: '400px'
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <input
            type="checkbox"
            checked={showFullURI}
            onChange={(e) => setShowFullURI(e.target.checked)}
          />
          Show full URIs
        </label>
        <span style={{ color: '#666' }}>
          Show {filteredTriples.length} of {triples.length} triples
        </span>
      </div>

      {/* Tabell */}
      <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead style={{ 
            position: 'sticky', 
            top: 0, 
            backgroundColor: '#f5f5f5',
            zIndex: 1
          }}>
            <tr>
              <th style={{ 
                border: '1px solid #ddd', 
                padding: '10px',
                textAlign: 'left',
                fontWeight: 'bold'
              }}>
                Subject
              </th>
              <th style={{ 
                border: '1px solid #ddd', 
                padding: '10px',
                textAlign: 'left',
                fontWeight: 'bold'
              }}>
                Predicate
              </th>
              <th style={{ 
                border: '1px solid #ddd', 
                padding: '10px',
                textAlign: 'left',
                fontWeight: 'bold'
              }}>
                Object
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredTriples.map((triple, index) => (
              <tr 
                key={index}
                style={{ 
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f4f8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#fff' : '#f9f9f9';
                }}
              >
                <td 
                  style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px',
                    wordBreak: 'break-word',
                    maxWidth: '300px'
                  }}
                  title={showFullURI ? '' : triple.subject}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: isURI(triple.subject) ? '500' : 'normal' }}>
                      {formatValue(triple.subject, showFullURI)}
                    </span>
                    {!showFullURI && isURI(triple.subject) && (
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        {getNamespace(triple.subject)}
                      </span>
                    )}
                  </div>
                </td>
                <td 
                  style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px',
                    wordBreak: 'break-word',
                    maxWidth: '200px',
                    color: '#0066cc'
                  }}
                  title={showFullURI ? '' : triple.predicate}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: '500' }}>
                      {formatValue(triple.predicate, showFullURI)}
                    </span>
                    {!showFullURI && isURI(triple.predicate) && (
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        {getNamespace(triple.predicate)}
                      </span>
                    )}
                  </div>
                </td>
                <td 
                  style={{ 
                    border: '1px solid #ddd', 
                    padding: '8px',
                    wordBreak: 'break-word',
                    maxWidth: '300px'
                  }}
                  title={showFullURI ? '' : triple.object}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ 
                      fontWeight: isURI(triple.object) ? '500' : 'normal',
                      fontStyle: !isURI(triple.object) ? 'italic' : 'normal'
                    }}>
                      {formatValue(triple.object, showFullURI)}
                    </span>
                    {!showFullURI && isURI(triple.object) && (
                      <span style={{ fontSize: '11px', color: '#888' }}>
                        {getNamespace(triple.object)}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const TableView = React.memo(TableViewComponent);