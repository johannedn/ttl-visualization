// src/context/OntologyContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Triple } from '@utils/ttlParser'
import { parseTTL } from '@utils/ttlParser'
import { ontologyService } from '@api/ontologyService'

interface OntologyContextValue {
  triples: Triple[]
  setTriples: (triples: Triple[]) => void

  selectedTriples: Triple[]
  toggleTriple: (t: Triple) => void
  clearSelection: () => void

  loading: boolean
  error: string | null
  loadFromAPI: () => Promise<void>
  loadFromFile: (content: string) => Promise<void>
}

const OntologyContext = createContext<OntologyContextValue | null>(null)

export function OntologyProvider({ children }: { children: React.ReactNode }) {
  const [triples, setTriples] = useState<Triple[]>([])
  const [selectedTriples, setSelectedTriples] = useState<Triple[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const toggleTriple = (triple: Triple) => {
    setSelectedTriples(prev => {
      const objKey = typeof triple.object === 'string' ? triple.object : triple.object.value
      const exists = prev.some(t => {
        const tObj = typeof t.object === 'string' ? t.object : t.object.value
        return t.subject === triple.subject && t.predicate === triple.predicate && tObj === objKey
      })
      return exists
        ? prev.filter(t => {
            const tObj = typeof t.object === 'string' ? t.object : t.object.value
            return !(t.subject === triple.subject && t.predicate === triple.predicate && tObj === objKey)
          })
        : [...prev, triple]
    })
  }

  const clearSelection = () => setSelectedTriples([])

  const loadFromAPI = async () => {
    setLoading(true)
    setError(null)
    try {
      const ontology = await ontologyService.getLatestOntology()
      const parsed = await parseTTL(ontology.content)
      setTriples(parsed)
    } catch {
      setError('Failed to load ontology from server')
    } finally {
      setLoading(false)
    }
  }

  const loadFromFile = async (content: string) => {
    try {
      setError(null)
      const parsed = await parseTTL(content)
      setTriples(parsed)
    } catch {
      setError('Failed to parse uploaded file')
    }
  }

  // Automatically load the latest ontology from backend on mount
  useEffect(() => {
    let cancelled = false

    const loadOntology = async () => {
      try {
        setError(null)
        const ontology = await ontologyService.getLatestOntology()
        const parsed = await parseTTL(ontology.content)
        if (!cancelled) {
          setTriples(parsed)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error loading ontology from backend:', err)
          setError('Failed to load ontology from backend')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadOntology()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <OntologyContext.Provider
      value={{
        triples,
        setTriples,
        selectedTriples,
        toggleTriple,
        clearSelection,
        loading,
        error,
        loadFromAPI,
        loadFromFile,
      }}
    >
      {children}
    </OntologyContext.Provider>
  )
}

export function useOntology() {
  const ctx = useContext(OntologyContext)
  if (!ctx) throw new Error('useOntology must be used inside OntologyProvider')
  return ctx
}