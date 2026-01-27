// src/chat/ChatInput.tsx
import { useState } from 'react'
import { Box, Button, TextField, Chip, Typography } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

interface Props {
  onSend: (text: string) => void
  pending: boolean
  connected?: boolean
  selectedTriples?: Array<{
    subject: string
    predicate: string
    object: string
  }> | null
}

export function ChatInput({ onSend, pending, connected = true, selectedTriples }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Box p={1} borderTop={1} borderColor="divider">
      {/* Vis markerte tripler */}
      {selectedTriples && selectedTriples.length > 0 && (
        <Box mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
            Selected triples ({selectedTriples.length}):
          </Typography>
          <Box display="flex" flexDirection="column" gap={0.5}>
            {selectedTriples.map((triple, idx) => (
              <Chip
                key={idx}
                label={`${triple.subject} → ${triple.predicate} → ${triple.object}`}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem',
                  height: 'auto',
                  py: 0.5,
                  '& .MuiChip-label': { 
                    whiteSpace: 'normal',
                    textAlign: 'left'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Input felt */}
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={!connected}
          placeholder={
            !connected 
              ? 'Disconnected - cannot send messages' 
              : pending 
                ? 'Confirm or clarify…' 
                : 'Ask OntoloChat'
          }
          sx={{
            '& .MuiOutlinedInput-root': {
              color: '#2d4f4b',
              '& fieldset': {
                borderColor: 'rgba(45, 79, 75, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(45, 79, 75, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fbbf24',
                borderWidth: 2,
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(45, 79, 75, 0.5)',
              opacity: 1,
            },
          }}
        />
        <Button 
          variant="contained" 
          onClick={handleSend}
          disabled={!value.trim() || !connected}
          sx={{
            bgcolor: '#2d4f4b',
            color: '#fbbf24',
            '&:hover': {
              bgcolor: '#1a3330',
            },
            '&:disabled': {
              bgcolor: 'rgba(45, 79, 75, 0.5)',
              color: 'rgba(251, 191, 36, 0.5)',
            },
            fontWeight: 600,
          }}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  )
}