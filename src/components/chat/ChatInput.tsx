// src/chat/ChatInput.tsx
import { useState } from 'react'
import { Box, Button, TextField, Chip, Typography, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import ClearAllIcon from '@mui/icons-material/ClearAll'

interface Props {
  onSend: (text: string) => void
  pending: boolean
  connected?: boolean
  selectedTriples?: Array<{
    subject: string
    predicate: string
    object: string | { value: string }
  }> | null
  onRemoveTriple?: (index: number) => void
  onClearTriples?: () => void
}

export function ChatInput({ 
  onSend, 
  pending, 
  connected = true, 
  selectedTriples,
  onRemoveTriple,
  onClearTriples 
}: Props) {
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

  const getObjectValue = (obj: string | { value: string }) => {
    return typeof obj === 'string' ? obj : obj.value
  }

  return (
    <Box p={1} borderTop={1} borderColor="divider">
      {/* Vis markerte tripler */}
      {selectedTriples && selectedTriples.length > 0 && (
        <Box mb={1} p={1} bgcolor="grey.50" borderRadius={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Selected triples ({selectedTriples.length}):
            </Typography>
            {onClearTriples && (
              <Button
                size="small"
                onClick={onClearTriples}
                startIcon={<ClearAllIcon fontSize="small" />}
                sx={{
                  fontSize: '0.7rem',
                  py: 0.25,
                  px: 1,
                  minWidth: 'auto',
                  color: '#d32f2f',
                  '&:hover': {
                    bgcolor: 'rgba(211, 47, 47, 0.08)',
                  },
                }}
              >
                Clear all
              </Button>
            )}
          </Box>
          <Box display="flex" flexDirection="column" gap={0.5}>
            {selectedTriples.map((triple, idx) => (
              <Chip
                key={idx}
                label={`${triple.subject} → ${triple.predicate} → ${getObjectValue(triple.object)}`}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={onRemoveTriple ? () => onRemoveTriple(idx) : undefined}
                deleteIcon={
                  <CloseIcon 
                    sx={{ 
                      fontSize: '1rem',
                      '&:hover': { color: '#d32f2f' }
                    }} 
                  />
                }
                sx={{ 
                  fontSize: '0.7rem',
                  height: 'auto',
                  py: 0.5,
                  '& .MuiChip-label': { 
                    whiteSpace: 'normal',
                    textAlign: 'left',
                    pr: onRemoveTriple ? 0.5 : 1,
                  },
                  '& .MuiChip-deleteIcon': {
                    margin: '0 4px 0 -4px',
                  },
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