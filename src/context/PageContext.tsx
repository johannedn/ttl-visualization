import React, { createContext, useContext, useState } from 'react'

interface PageContextValue {
  title: string
  setTitle: (title: string) => void
}

const PageContext = createContext<PageContextValue | null>(null)

export function PageProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState('Unified Ontology Generation for Heterogenous Data')

  return (
    <PageContext.Provider value={{ title, setTitle }}>
      {children}
    </PageContext.Provider>
  )
}

export function usePageTitle() {
  const ctx = useContext(PageContext)
  if (!ctx) throw new Error('usePageTitle must be used inside PageProvider')
  return ctx
}
