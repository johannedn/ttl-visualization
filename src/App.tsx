import React, { useState } from 'react';
import { TTLUploader } from './components/TTLUploader';
import { TableView } from './components/TableView3';
import { GraphView } from './components/GraphView2';
import type { Triple } from './utils/ttlParser';
import { parseTTL } from './utils/ttlParser';
import { ontologyService } from './api/ontologyService';
import './App.css';

type LoadMode = 'upload' | 'api';

function App() {
  const [triples, setTriples] = useState<Triple[]>([]);
  const [view, setView] = useState<'graph' | 'table'>('graph');
  const [loadMode, setLoadMode] = useState<LoadMode>('api');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file upload
  const handleFileLoad = async (content: string) => {
    try {
      setError(null);
      console.log('=== Uploaded TTL File ===');
      console.log(content);
      console.log('=========================');
      
      const parsed = await parseTTL(content);
      setTriples(parsed);
    } catch (error) {
      console.error('Error parsing TTL:', error);
      setError('Failed to parse uploaded file');
    }
  };

  // Fetch from API
  const handleFetchFromAPI = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const ontology = await ontologyService.getLatestOntology();
      
      console.log('=== Fetched TTL File from API ===');
      console.log(ontology.content);
      console.log('=================================');
      
      const parsed = await parseTTL(ontology.content);
      setTriples(parsed);
    } catch (err) {
      console.error('Error fetching/parsing ontology:', err);
      setError('Failed to load ontology from server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Unified Ontology Generation for Heterogenous Data</h1>
      
      {/* Mode selector */}
      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Load Ontology:</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            onClick={() => setLoadMode('api')}
            style={{ 
              fontWeight: loadMode === 'api' ? 'bold' : 'normal',
              backgroundColor: loadMode === 'api' ? '#4CAF50' : '#f0f0f0'
            }}
          >
            Fetch from API
          </button>
          <button 
            onClick={() => setLoadMode('upload')}
            style={{ 
              fontWeight: loadMode === 'upload' ? 'bold' : 'normal',
              backgroundColor: loadMode === 'upload' ? '#4CAF50' : '#f0f0f0'
            }}
          >
            Upload File
          </button>
        </div>

        {/* Show appropriate interface based on mode */}
        {loadMode === 'api' ? (
          <div>
            <button onClick={handleFetchFromAPI} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Latest Ontology'}
            </button>
          </div>
        ) : (
          <TTLUploader onFileLoad={handleFileLoad} />
        )}
      </div>

      {/* Error display */}
      {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}
      
      {/* View toggle buttons */}
      <div style={{ margin: '20px 0' }}>
        <button onClick={() => setView('graph')}>Graph view</button>
        <button onClick={() => setView('table')}>Table view</button>
      </div>

      {/* Display views */}
      {loading && <div>Loading ontology...</div>}
      
      {!loading && triples.length > 0 && (
        <>
          {view === 'graph' ? (
            <GraphView triples={triples} />
          ) : (
            <TableView triples={triples} />
          )}
        </>
      )}
      
      {!loading && triples.length === 0 && !error && (
        <div>No ontology loaded yet</div>
      )}
    </div>
  );
}

export default App;