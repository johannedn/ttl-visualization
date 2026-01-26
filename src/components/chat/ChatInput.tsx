// src/chat/ChatInput.tsx
import { useState } from 'react'
import { Box, Button, TextField } from '@mui/material'

interface Props {
  onSend: (text: string) => void
  pending: boolean
}

export function ChatInput({ onSend, pending }: Props) {
  const [value, setValue] = useState('')

  const handleSend = () => {
    if (!value.trim()) return
    onSend(value)
    setValue('')
  }

  return (
    <Box display="flex" gap={1} p={1}>
      <TextField
        fullWidth
        size="small"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={pending ? 'Confirm or clarify…' : 'Ask about ontology…'}
      />
      <Button variant="contained" onClick={handleSend}>
        Send
      </Button>
    </Box>
  )
}
