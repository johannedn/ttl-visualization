// src/components/TableView.tsx
import React, { useState } from 'react'
import { useOntology } from '@context/OntologyContext'
import { isURI, getShortName, getNamespace } from '@utils/tripleUtils'
import { Checkbox } from '@mui/material'

export function TableView() {
  const { triples, selectedTriples, toggleTriple } = useOntology()

  const [showFullURI, setShowFullURI] = useState(false)
  const [filter, setFilter] = useState('')

  const filteredTriples = triples.filter(t => {
    if (!filter) return true
    const f = filter.toLowerCase()
    return (
      t.subject.toLowerCase().includes(f) ||
      t.predicate.toLowerCase().includes(f) ||
      t.object.toLowerCase().includes(f)
    )
  })

  const isSelected = (t: any) =>
    selectedTriples.some(
      s =>
        s.subject === t.subject &&
        s.predicate === t.predicate &&
        s.object === t.object
    )

  const format = (v: string) => (showFullURI ? v : getShortName(v))

  return (
    <div style={{ width: '100%' }}>
      {/* Controls */}
      <div style={{ marginBottom: 15, display: 'flex', gap: 10, alignItems: 'center' }}>
        <input
          placeholder="Search in triples..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ padding: 8, border: '1px solid #ddd', borderRadius: 4, flex: 1, maxWidth: 400 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <input
            type="checkbox"
            checked={showFullURI}
            onChange={e => setShowFullURI(e.target.checked)}
          />
          Show full URIs
        </label>
        <span style={{ color: '#666' }}>
          Showing {filteredTriples.length} of {triples.length} triples
        </span>
      </div>

      {/* Table */}
      <div style={{ maxHeight: 600, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ position: 'sticky', top: 0, background: '#f5f5f5', zIndex: 1 }}>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: 8 }} />
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Subject</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Predicate</th>
              <th style={{ border: '1px solid #ddd', padding: 8 }}>Object</th>
            </tr>
          </thead>
          <tbody>
            {filteredTriples.map((t, i) => (
              <tr
                key={i}
                onClick={() => toggleTriple(t)}
                style={{
                  background: isSelected(t) ? '#e3f2fd' : i % 2 ? '#f9f9f9' : '#fff',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
              >
                <td>
                  <Checkbox checked={isSelected(t)} />
                </td>

                {[t.subject, t.predicate, t.object].map((v, j) => (
                  <td key={j} title={!showFullURI ? v : ''} style={{ border: '1px solid #ddd', padding: 8, wordBreak: 'break-word' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <strong style={{ fontWeight: isURI(v) ? 500 : 'normal', fontStyle: !isURI(v) ? 'italic' : 'normal' }}>{format(v)}</strong>
                      {!showFullURI && isURI(v) && (
                        <span style={{ fontSize: 11, color: '#888' }}>{getNamespace(v)}</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}