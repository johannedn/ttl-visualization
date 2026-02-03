import { useEffect, useRef, useState } from 'react'
import { useOntology } from '@context/OntologyContext'
import { parseTTL } from '@utils/ttlParser'
import type { ChatResponse } from 'types/chat'

export function useOntologyChat() {
  const { selectedTriples, setTriples, clearSelection, setSelectedTriples } = useOntology()

  const [messages, setMessages] = useState<ChatResponse[]>([])
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const ws = new WebSocket('ws://localhost:8000/ws/chat')
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
      // Hent ontology ved oppstart
      ws.send(JSON.stringify({ type: 'get_ontology' }))
    }

    ws.onmessage = async (e) => {
      const msg: ChatResponse = JSON.parse(e.data)

      if ('pending_id' in msg && msg.pending_id) setPendingId(msg.pending_id)
      
      // Legg til melding i historikk (unntatt ontology_content)
      if (msg.type !== 'ontology_content') {
        setMessages((prev) => {
          const updated = [...prev, msg]
          return updated
        })
      }

      // Hent oppdatert ontology når endring er applisert
      if (msg.type === 'change_applied') {
        ws.send(JSON.stringify({ type: 'get_ontology' }))
      }

      // Parse og oppdater ontology når vi får ontology_content
      if (msg.type === 'ontology_content' && msg.content) {
        try {
          const parsed = await parseTTL(msg.content)
          setTriples(parsed)
        } catch (err) {
          console.error('Failed to parse ontology:', err)
          // Legg til error melding i chat
          setMessages((prev) => [...prev, {
            type: 'error',
            message: `Failed to parse ontology: ${err instanceof Error ? err.message : 'Unknown error'}`
          }])
        }
      }
    }

    ws.onerror = (err) => console.error('WebSocket error:', err)
    ws.onclose = () => {
      setConnected(false)
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      setConnected(false)
    }
  }, [setTriples])

  const send = (text: string) => {
    const ws = wsRef.current
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }

    // selectedTriples er allerede i riktig format
    const userMessage: ChatResponse = {
      type: 'answer',
      message: text,
      selected_triples: selectedTriples
    }
    setMessages((prev) => [...prev, userMessage])
    
    const chatPayload = {
      type: 'chat',
      data: {
        text,
        selected_triples: selectedTriples || null,
        pending_id: pendingId || null
      }
    }
    ws.send(JSON.stringify(chatPayload))
    if (pendingId) setPendingId(null)
    
    clearSelection()
  }

  const removeTripleAt = (index: number) => {
    setSelectedTriples(prev => prev.filter((_, i) => i !== index))
  }

  const clearHistory = () => {
    setMessages([])
  }

  return { 
    messages, 
    send, 
    pendingId, 
    connected, 
    clearHistory, 
    selectedTriples,
    removeTripleAt,    
    clearSelection      
  }
}