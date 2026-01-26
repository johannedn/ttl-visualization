// src/chat/ChatMessages.tsx
import { Box } from '@mui/material'
import type { ChatResponse } from './chatTypes'

export function ChatMessages({ messages }: { messages: ChatResponse[] }) {
  return (
    <Box flex={1} overflow="auto" p={2}>
      {messages.map((m, i) => (
        <Box key={i} mb={1}>
          {m.message}
        </Box>
      ))}
    </Box>
  )
}
