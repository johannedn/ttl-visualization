// src/chat/ChatDrawer.tsx
import { Drawer, Toolbar } from '@mui/material'
import { useOntologyChat } from '@context/useOntologyChat'
import { ChatMessages } from '@components/chat/ChatMessages'
import { ChatInput } from '@components/chat/ChatInput'

export function ChatDrawer({ open }: { open: boolean }) {
  const { messages, send, pendingId } = useOntologyChat()

  return (
    <Drawer open={open} anchor="right" variant="persistent">
      <Toolbar />
      <ChatMessages messages={messages} />
      <ChatInput onSend={send} pending={!!pendingId} />
    </Drawer>
  )
}
