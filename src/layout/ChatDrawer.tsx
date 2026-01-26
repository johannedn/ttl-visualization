// src/chat/ChatDrawer.tsx
import { Drawer, Toolbar, Box, Typography } from '@mui/material'
import { ChatMessages } from '@components/chat/ChatMessages'
import { ChatInput } from '@components/chat/ChatInput'

interface ChatDrawerProps {
  open: boolean
  chatState: ReturnType<typeof import('@context/useOntologyChat').useOntologyChat>
}

export function ChatDrawer({ open, chatState }: ChatDrawerProps) {
  const { messages, send, pendingId, connected, clearHistory, selectedTriples } = chatState

  return (
    <Drawer 
      open={open} 
      anchor="right" 
      variant="persistent"
      sx={{ width: 400, '& .MuiDrawer-paper': { width: 400 } }}
    >
      <Toolbar />
      <Box display="flex" flexDirection="column" height="100%">
        <Box p={2} borderBottom={1} borderColor="divider">
          <Typography variant="h6">Ontology Chat</Typography>
          <Typography variant="caption" color={connected ? 'success.main' : 'error.main'}>
            {connected ? 'Connected' : 'Disconnected'}
          </Typography>
        </Box>
        
        <ChatMessages messages={messages} onClearHistory={clearHistory} />
        <ChatInput 
          onSend={send} 
          pending={!!pendingId}
          selectedTriples={selectedTriples}
        />
      </Box>
    </Drawer>
  )
}