export function createOntologyChatSocket(
  onMessage: (data: any) => void
) {
  const ws = new WebSocket('ws://localhost:8000/ws/chat')

  ws.onmessage = e => {
    onMessage(JSON.parse(e.data))
  }

  return ws
}
