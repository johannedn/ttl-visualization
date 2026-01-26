// src/chat/ChatMessages.tsx
import { Box, Typography, IconButton, Chip } from '@mui/material'
import { Delete as DeleteIcon } from '@mui/icons-material'
import type { ChatResponse } from 'types/chat'

interface ChatMessagesProps {
  messages: ChatResponse[]
  onClearHistory?: () => void
}

export function ChatMessages({ messages, onClearHistory }: ChatMessagesProps) {
  console.log('Rendering messages:', messages)
  
  return (
    <Box flex={1} overflow="auto" p={2} display="flex" flexDirection="column">
      {onClearHistory && messages.length > 0 && (
        <Box display="flex" justifyContent="flex-end" mb={1}>
          <IconButton size="small" onClick={onClearHistory} title="Clear history">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
      
      {messages.length === 0 && (
        <Typography color="text.secondary" textAlign="center" mt={4}>
          No messages yet. Start a conversation!
        </Typography>
      )}
      
      {messages.map((m, i) => {
        console.log(`Message ${i}:`, m)
        
        if (m.type === 'ontology_content') {
          return null
        }

        const text = 'message' in m ? m.message : '(Unknown message)'
        const isUser = 'selected_triples' in m // Bruker-meldinger har selected_triples
        
        return (
          <Box 
            key={i} 
            mb={1.5}
            alignSelf={isUser ? 'flex-end' : 'flex-start'}
            maxWidth="80%"
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: isUser ? 'primary.light' : 'grey.100',
                color: isUser ? 'primary.contrastText' : 'text.primary'
              }}
            >
              <Typography variant="body2">
                {text}
              </Typography>
              
              {/* Vis markerte tripler hvis de finnes */}
              {'selected_triples' in m && m.selected_triples && m.selected_triples.length > 0 && (
                <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Selected triples:
                  </Typography>
                  {m.selected_triples.map((triple, idx) => (
                    <Chip
                      key={idx}
                      label={`${triple.subject} → ${triple.predicate} → ${triple.object}`}
                      size="small"
                      sx={{ 
                        fontSize: '0.7rem',
                        height: 'auto',
                        py: 0.5,
                        '& .MuiChip-label': { whiteSpace: 'normal' }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
            
            {m.type === 'change_applied' && m.version_id && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                Version: {m.version_id}
              </Typography>
            )}
            
            {m.type === 'confirmation_needed' && (
              <Typography variant="caption" color="warning.main" display="block" mt={0.5}>
                Awaiting confirmation
              </Typography>
            )}
          </Box>
        )
      })}
    </Box>
  )
}