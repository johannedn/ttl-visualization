import { Drawer, Toolbar, Box, Typography, TextField, IconButton, CircularProgress } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import * as React from 'react'
import { ontologyService } from '../api/ontologyService'
import { useOntology } from '../context/OntologyContext'


export const CHAT_WIDTH = 320


interface ChatDrawerProps {
	open: boolean
}


export function ChatDrawer({ open }: ChatDrawerProps) {
	const [message, setMessage] = React.useState('')
	const [sending, setSending] = React.useState(false)
	const [error, setError] = React.useState<string | null>(null)

	const { selectedTriples, clearSelection } = useOntology()



	const handleSend = async () => {
		if (!message.trim()) return


		setSending(true)
		setError(null)


		try {
			await ontologyService.updateOntology(
				message,
				selectedTriples
			)
			setMessage('')
		} catch (err) {
			setError('Failed to send message')
		} finally {
			setSending(false)
		}
	}


	return (
		<Drawer
			anchor="right"
			open={open}
			variant="persistent"
			sx={{
				width: CHAT_WIDTH,
				[`& .MuiDrawer-paper`]: {
					width: CHAT_WIDTH,
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'column',
				},
			}}
		>
			<Toolbar />


			{/* Messages area (placeholder) */}
			<Box flexGrow={1} p={2} overflow="auto">
				<Typography variant="body2" color="text.secondary">
					Chat log comes later
				</Typography>
			</Box>
			{/* Input area */}
			<Box p={2} borderTop={1} borderColor="divider">
				{error && (
					<Typography color="error" variant="caption" display="block" mb={1}>
						{error}
					</Typography>
				)}
				<Box display="flex" gap={1}>
					<TextField
						fullWidth
						size="small"
						placeholder="Send feedback to ontologychat..."
						value={message}
						onChange={e => setMessage(e.target.value)}
						onKeyDown={e => {
							if (e.key === 'Enter' && !e.shiftKey) {
								e.preventDefault()
								handleSend()	
							}
							}}
						disabled={sending}
					/>
					<IconButton
						color="primary"
						onClick={handleSend}
						disabled={sending}
					>
						{sending ? <CircularProgress size={20} /> : <SendIcon />}
					</IconButton>
				</Box>
			</Box>
		</Drawer>
	)
}