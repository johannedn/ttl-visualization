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
const DEFAULT_LOCAL_ONTOLOGY = import.meta.env.VITE_LOCAL_ONTOLOGY || '/assets/dev-ontology.ttl'

export function OntologyProvider({ children }: { children: React.ReactNode }) {
  const [triples, setTriples] = useState<Triple[]>([])
  const [selectedTriples, setSelectedTriples] = useState<Triple[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleTriple = (triple: Triple) => {
    setSelectedTriples(prev => {
      const exists = prev.some(
        t => t.subject === triple.subject && t.predicate === triple.predicate && t.object === triple.object
      )
      return exists ? prev.filter(t => !(t.subject === triple.subject && t.predicate === triple.predicate && t.object === triple.object)) : [...prev, triple]
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

  useEffect(() => {
    if (!import.meta.env.DEV) return
    if (triples.length > 0) return

    let cancelled = false
    const loadLocal = async () => {
      setLoading(true)
      try {
        const res = await fetch(DEFAULT_LOCAL_ONTOLOGY)
        if (!res.ok) throw new Error(`Failed to fetch ${DEFAULT_LOCAL_ONTOLOGY}`)
        const ttl = await res.text()
        const parsed = await parseTTL(ttl)
        if (!cancelled && triples.length === 0) {
          setTriples(parsed)
        }
      } catch (err) {
        console.warn('No local ontology loaded from assets', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLocal()
    return () => {
      cancelled = true
    }
  }, [triples.length])

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