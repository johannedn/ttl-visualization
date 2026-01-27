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
	const [sidebarOpen, setSidebarOpen] = React.useState(false)
	const [chatWidth, setChatWidth] = React.useState(420)
	const chatState = useOntologyChat() // Initialiser chat hook her

	return (
		<Box sx={{ display: 'flex' }}>
			<CssBaseline />

			<AppHeader onOpenChat={() => setChatOpen(prev => !prev)} onOpenSidebar={() => setSidebarOpen(prev => !prev)} />
			<SideNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					pt: 3,
					pr: 3,
					pb: 3,
					pl: 3,
					bgcolor: '#f5faf9',
					minHeight: '100vh',
					transition: 'flex-basis 0.1s ease-out',
				}}
			>
				<Toolbar sx={{ minHeight: 120 }} />
				{children}
			</Box>

			{chatOpen && <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} chatState={chatState} width={chatWidth} onWidthChange={setChatWidth} />}
		</Box>
	)
}