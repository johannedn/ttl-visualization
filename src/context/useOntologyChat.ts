// src/chat/useOntologyChat.ts
import { useEffect, useRef, useState } from 'react'
import { useOntology } from '@context/OntologyContext'
import type { ChatResponse } from 'types/chat'

export function useOntologyChat() {
  const { selectedTriples } = useOntology()

  const [messages, setMessages] = useState<ChatResponse[]>([])
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const initializedRef = useRef(false)

  useEffect(() => {
    // Unngå dobbel init ved StrictMode
    if (initializedRef.current) return
    initializedRef.current = true

    const ws = new WebSocket('ws://localhost:8000/ws/chat')
    wsRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connection OPEN')
      setConnected(true)
    }

    ws.onmessage = (e) => {
      try {
        const msg: ChatResponse = JSON.parse(e.data)
        if ('pending_id' in msg && msg.pending_id) setPendingId(msg.pending_id)
        setMessages((prev) => [...prev, msg])
      } catch (err) {
        console.error('Failed to parse WebSocket message', err, e.data)
      }
    }

    ws.onerror = (err) => {
      console.error('WebSocket error', err)
    }

    ws.onclose = () => {
      console.log('WebSocket closed')
      wsRef.current = null
      setConnected(false)
    }

    // Cleanup: bare lukke socket hvis den faktisk er åpen
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      wsRef.current = null
      setConnected(false)
    }
  }, [])

  const send = (text: string) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send: WebSocket not open yet')
      return
    }

    if (pendingId) {
      ws.send(JSON.stringify({ type: 'confirm', data: { pending_id: pendingId, reply: text } }))
      setPendingId(null)
    } else {
      ws.send(
        JSON.stringify({
          type: 'chat',
          data: {
            text,
            selected_triples: selectedTriples || null,
          },
        })
      )
    }
  }

  return {
    messages,
    send,
    pendingId,
    connected,
  }
}
