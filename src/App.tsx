import React, { useState, useMemo } from 'react';
import { TableView } from './components/TableView3';
import { GraphView } from './components/GraphView2';
import { useOntology } from './context/OntologyContext';
import './App.css';

// Limit für Performance - nur erste N Triples anzeigen
const DISPLAY_LIMIT = 5000;

function App() {
  const { triples, loading, error } = useOntology();
  const [view, setView] = useState<'graph' | 'table'>('table'); // Default to table (faster)

  // Limit triples für Performance
  const limitedTriples = useMemo(() => {
    if (triples.length <= DISPLAY_LIMIT) return triples;
    return triples.slice(0, DISPLAY_LIMIT);
  }, [triples]);

  const showLimitWarning = triples.length > DISPLAY_LIMIT;

  return (
    <div className="App">
      <h1>Unified Ontology Generation for Heterogenous Data</h1>
      
      {/* View toggle buttons */}
      <div style={{ margin: '20px 0', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => setView('table')}
          style={{ fontWeight: view === 'table' ? 'bold' : 'normal' }}
        >
          Table view
        </button>
        <button 
          onClick={() => setView('graph')}
          style={{ fontWeight: view === 'graph' ? 'bold' : 'normal' }}
        >
          Graph view
        </button>
        {showLimitWarning && (
          <span style={{ color: '#ff9800', fontSize: '14px' }}>
            ⚠️ Showing {DISPLAY_LIMIT.toLocaleString()} of {triples.length.toLocaleString()} triples
          </span>
        )}
      </div>

      {/* Error display */}
      {error && <div style={{ color: 'red', margin: '10px 0', padding: '10px', border: '1px solid red' }}>{error}</div>}

      {/* Display views */}
      {loading && <div style={{ padding: '20px' }}>Ontologie wird geladen...</div>}
      
      {!loading && triples.length > 0 && (
        <>
          {/* Only render the active view - conditional rendering for performance */}
          {view === 'graph' ? (
            <GraphView triples={limitedTriples} />
          ) : (
            <TableView triples={limitedTriples} />
          )}
        </>
      )}
      
      {!loading && triples.length === 0 && !error && (
        <div style={{ padding: '20px' }}>Keine Ontologie geladen</div>
      )}
    </div>
  );
}

export default App;