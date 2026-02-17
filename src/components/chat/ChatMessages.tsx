import { Box, Typography, IconButton, Chip, Avatar } from '@mui/material'
import { useEffect, useRef } from 'react'
import { Delete as DeleteIcon } from '@mui/icons-material'
import PersonIcon from '@mui/icons-material/Person'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import type { ChatResponse } from 'types/chat'


function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderMarkdown(text: string): string {
  let escaped = escapeHtml(text)
  escaped = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  const lines = escaped.split(/\n/)
  let html = ''

  for (const line of lines) {
    const listMatch = line.match(/^\s*-\s+(.*)$/)
    const orderedMatch = line.match(/^\s*(\d+)[.)]\s+(.*)$/)

    if (listMatch) {
      html += `<div class="md-ul-item">• ${listMatch[1]}</div>`
      continue
    }

    if (orderedMatch) {
      html += `<div class="md-ol-item"><span class="md-ol-num">${orderedMatch[1]}.</span> ${orderedMatch[2]}</div>`
      continue
    }

    if (line.trim() == '') {
      html += '<br>'
    } else {
      html += `${line}<br>`
    }
  }

  return html.replace(/<br>$/, '')
}

interface ChatMessagesProps {
  messages: ChatResponse[]
  onClearHistory?: () => void
}

export function ChatMessages({ messages, onClearHistory }: ChatMessagesProps) {

  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages])
  
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
        
        if (m.type === 'ontology_content') {
          return null
        }

        const text = 'message' in m ? m.message : '(Unknown message)'
        const isUser = 'selected_triples' in m // Bruker-meldinger har selected_triples
        
        return (
          <Box 
            key={i} 
            mb={1.5}
            display="flex"
            gap={1}
            justifyContent={isUser ? 'flex-end' : 'flex-start'}
            maxWidth="100%"
          >
            {!isUser && (
              <Avatar sx={{ bgcolor: '#2d4f4b', width: 32, height: 32 }}>
                <SmartToyIcon sx={{ fontSize: 20, color: '#fbbf24' }} />
              </Avatar>
            )}
            <Box maxWidth="80%">
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: isUser ? 'rgba(45, 79, 75, 0.1)' : '#f5faf9',
                  border: isUser ? '1px solid rgba(45, 79, 75, 0.2)' : 'none',
                  color: '#2d4f4b',
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  overflow: 'hidden'
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    '& .md-ol-item': { marginTop: 0.5 },
                    '& .md-ol-num': { fontWeight: 700, marginRight: '6px' },
                    '& .md-ul-item': { marginTop: 0.5 }
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
                />
                
                {'selected_triples' in m && m.selected_triples && m.selected_triples.length > 0 && (
                  <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Selected triples:
                    </Typography>
                    {m.selected_triples.map((triple, idx) => (
                      <Chip
                        key={idx}
                        label={`${triple.subject} → ${triple.predicate} → ${typeof triple.object === 'string' ? triple.object : triple.object.value}`}
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
            {isUser && (
              <Avatar sx={{ bgcolor: '#fbbf24', width: 32, height: 32 }}>
                <PersonIcon sx={{ fontSize: 20, color: '#2d4f4b' }} />
              </Avatar>
            )}
          </Box>
        )
      })}
      <div ref={bottomRef} />
    </Box>
  )
}