import React, { useState } from 'react';
import { TTLUploader } from './components/TTLUploader';
import { TableView } from './components/TableView3';
import { GraphView} from './components/GraphView2';
import type { Triple } from './utils/ttlParser';
import {parseTTL} from './utils/ttlParser';
import './App.css';

function App() {
  const [triples, setTriples] = useState<Triple[]>([]);
  const [view, setView] = useState<'graph' | 'table'>('graph');

  const handleFileLoad = async (content: string) => {
    try {
      const parsed = await parseTTL(content);
      setTriples(parsed);
    } catch (error) {
      console.error('Feil ved parsing av TTL:', error);
    }
  };

  return (
    <div className="App">
      <h1>Unified Ontology Generation for Heterogenous Data </h1>
      <TTLUploader onFileLoad={handleFileLoad} />
      
      <div style={{ margin: '20px 0' }}>
        <button onClick={() => setView('graph')}>Graph view</button>
        <button onClick={() => setView('table')}>Table view</button>
      </div>

      {triples.length > 0 && (
        <>
          {view === 'graph' ? (
            <GraphView triples={triples} />
          ) : (
            <TableView triples={triples} />
          )}
        </>
      )}
    </div>
  );
}

export default App;