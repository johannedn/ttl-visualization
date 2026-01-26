import * as React from 'react'
import { Box, CssBaseline, Toolbar } from '@mui/material'
import { AppHeader } from './AppHeader'
import { SideNav, DRAWER_WIDTH } from './SideNav'
import { ChatDrawer } from './ChatDrawer'
import { useOntologyChat } from '@context/useOntologyChat'

interface DashboardLayoutProps {
	children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	const [chatOpen, setChatOpen] = React.useState(false)
	const chatState = useOntologyChat() // Initialiser chat hook her

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />

			<AppHeader onOpenChat={() => setChatOpen(prev => !prev)} />
			<SideNav />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					pt: 3,
					pr: 3,
					pb: 3,
					pl: 3,
				}}
			>
				<Toolbar />
				{children}
			</Box>

			<ChatDrawer open={chatOpen} chatState={chatState} />
		</Box>
	)
}