import { useEffect, useRef, useState } from 'react'
import { useOntology } from '@context/OntologyContext'
import type { ChatResponse } from 'types/chat'

export function useOntologyChat() {
  const { selectedTriples, setTriples, clearSelection, setSelectedTriples, loadFromAPI } = useOntology()

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
    }

    ws.onmessage = async (e) => {
      const msg: ChatResponse = JSON.parse(e.data)

      // ✅ Ignore ontology_content messages completely
      if (msg.type === 'ontology_content') {
        console.log('Ignoring WebSocket ontology_content message')
        return
      }

      if ('pending_id' in msg && msg.pending_id) setPendingId(msg.pending_id)
      
      // Add message to history
      setMessages((prev) => [...prev, msg])

      // Fetch updated ontology when change is applied
      if (msg.type === 'change_applied') {
        try {
          await loadFromAPI() // ✅ Use HTTP GET instead of WebSocket
        } catch (err) {
          console.error('Failed to reload ontology:', err)
          setMessages((prev) => [...prev, {
            type: 'error',
            message: `Failed to reload ontology: ${err instanceof Error ? err.message : 'Unknown error'}`
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
  }, [loadFromAPI])

  const send = (text: string) => {
    const ws = wsRef.current
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return
    }

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