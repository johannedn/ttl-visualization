import { useEffect, useRef, useState } from 'react'
import { useOntology } from '@context/OntologyContext'
import { parseTTL } from '@utils/ttlParser'
import type { ChatResponse } from 'types/chat'


export function useOntologyChat() {
  const { selectedTriples, setTriples, clearSelection } = useOntology()

  const [messages, setMessages] = useState<ChatResponse[]>([])
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    console.log('Initializing WebSocket connection...')
    const ws = new WebSocket('ws://localhost:8000/ws/chat')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setConnected(true)
      // Hent ontology ved oppstart
      console.log('Fetching initial ontology...')
      ws.send(JSON.stringify({ type: 'get_ontology' }))
    }

    ws.onmessage = async (e) => {
      const msg: ChatResponse = JSON.parse(e.data)
      console.log('Received message:', msg)
      console.log('Message type:', msg.type)
      console.log('Message content:', JSON.stringify(msg, null, 2))
      
      if ('pending_id' in msg && msg.pending_id) setPendingId(msg.pending_id)
      
      // Legg til melding i historikk (unntatt ontology_content)
      if (msg.type !== 'ontology_content') {
        setMessages((prev) => {
          const updated = [...prev, msg]
          console.log('All messages:', updated)
          return updated
        })
      }

      // Hent oppdatert ontology når endring er applisert
      if (msg.type === 'change_applied') {
        console.log('Change applied, fetching updated ontology...')
        ws.send(JSON.stringify({ type: 'get_ontology' }))
      }

      // Parse og oppdater ontology når vi får ontology_content
      if (msg.type === 'ontology_content' && msg.content) {
        console.log('Received ontology content, parsing...')
        try {
          const parsed = await parseTTL(msg.content)
          console.log(`Parsed ontology: ${parsed.length} triples`)
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
      console.log('WebSocket closed')
      setConnected(false)
    }

    return () => {
      console.log('Cleaning up WebSocket')
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      setConnected(false)
    }
  }, [setTriples])

  const send = (text: string) => {
    const ws = wsRef.current
    console.log('send() called, ws:', ws, 'readyState:', ws?.readyState)
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log('WebSocket not ready')
      return
    }

    console.log('Sending:', text, 'pendingId:', pendingId, 'selected triples:', selectedTriples)
    console.log('selected_triples payload:', JSON.stringify(selectedTriples, null, 2))
    
    // selectedTriples er allerede i riktig format
    const userMessage: ChatResponse = {
      type: 'answer',
      message: text,
      selected_triples: selectedTriples
    }
    setMessages((prev) => [...prev, userMessage])
    
    if (pendingId) {
      const confirmPayload = { type: 'confirm', data: { pending_id: pendingId, reply: text } }
      console.log('Sending confirmation:', JSON.stringify(confirmPayload, null, 2))
      ws.send(JSON.stringify(confirmPayload))
      setPendingId(null)
    } else {
      const chatPayload = { type: 'chat', data: { text, selected_triples: selectedTriples || null } }
      console.log('Sending chat message:', JSON.stringify(chatPayload, null, 2))
      ws.send(JSON.stringify(chatPayload))
    }
    
    // Fjern selected triples etter sending
    clearSelection()
  }

  const clearHistory = () => {
    setMessages([])
  }

  return { messages, send, pendingId, connected, clearHistory, selectedTriples }
}