import { Drawer, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { ChatMessages } from '@components/chat/ChatMessages'
import { ChatInput } from '@components/chat/ChatInput'
import { useState, useRef, useEffect } from 'react'

interface ChatDrawerProps {
  open: boolean
  onClose: () => void
  chatState: ReturnType<typeof import('@context/useOntologyChat').useOntologyChat>
  width: number
  onWidthChange: (width: number) => void
}

export function ChatDrawer({ open, onClose, chatState, width, onWidthChange }: ChatDrawerProps) {
  const { messages, send, pendingId, connected, clearHistory, selectedTriples } = chatState
  const [isResizing, setIsResizing] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = () => {
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      
      const drawerElement = drawerRef.current
      if (!drawerElement) return
      
      const rect = drawerElement.getBoundingClientRect()
      const newWidth = rect.right - e.clientX
      
      if (newWidth > 300 && newWidth < 800) {
        onWidthChange(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, onWidthChange])

  return (
    <Drawer 
      open={open} 
      anchor="right" 
      variant="persistent"
      ref={drawerRef}
      sx={{ 
        width, 
        flexShrink: 0,
        '& .MuiDrawer-paper': { 
          width, 
          boxSizing: 'border-box',
          bgcolor: '#fbbf24',
          border: '1px solid rgba(45, 79, 75, 0.15)',
          marginTop: '0px',
          height: '100vh',
          pt: '99px',
          position: 'relative',
        },
      }}
    >
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '2px',
          bgcolor: '#fbbf24',
          cursor: 'ew-resize',
          '&:hover': {
            bgcolor: '#2d4f4b',
          },
          transition: 'background-color 0.2s',
        }}
      />
      <Box display="flex" flexDirection="column" height="100%" sx={{ bgcolor: '#ffff' }}>
        <Box sx={{ bgcolor: '#2d4f4b', px: 1.5, borderRadius: 1 }} display="flex" justifyContent="space-between" alignItems="center" borderBottom={1} borderColor="divider">
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fbbf24', fontSize: 20}}>OntoloChat</Typography>
            <Typography variant="caption" sx={{ color: '#fbbf24', fontSize: 14 }}>
              {connected ? 'Connected' : 'Disconnected'} to Service
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: '#fbbf24', fontWeight: 700 }}>
            <CloseIcon fontSize="small" sx={{ fontWeight: 700 }} />
          </IconButton>
        </Box>
        
        <ChatMessages messages={messages} onClearHistory={clearHistory} />
        <ChatInput 
          onSend={send} 
          pending={!!pendingId}
          connected={connected}
          selectedTriples={selectedTriples}
        />
      </Box>
    </Drawer>
  )
}