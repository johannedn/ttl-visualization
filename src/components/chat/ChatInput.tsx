// src/chat/ChatInput.tsx
import { useState } from 'react'
import { Box, Button, TextField, Chip, Typography } from '@mui/material'

interface Props {
  onSend: (text: string) => void
  pending: boolean
  selectedTriples?: Array<{
    subject: string
    predicate: string
    object: string
  }> | null
}

export function ChatInput({ onSend, pending, selectedTriples }: Props) {
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
          placeholder={pending ? 'Confirm or clarify…' : 'Ask about ontology…'}
        />
        <Button 
          variant="contained" 
          onClick={handleSend}
          disabled={!value.trim()}
        >
          Send
        </Button>
      </Box>
    </Box>
  )
}