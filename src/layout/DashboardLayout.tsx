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
	const [sidebarHoverTimeout, setSidebarHoverTimeout] = React.useState<NodeJS.Timeout | null>(null)
	const [chatWidth, setChatWidth] = React.useState(420)
	const chatState = useOntologyChat() // Initialiser chat hook her

	const handleSidebarMouseEnter = () => {
		if (sidebarHoverTimeout) clearTimeout(sidebarHoverTimeout)
		setSidebarOpen(true)
	}

	const handleSidebarMouseLeave = () => {
		const timeout = setTimeout(() => {
			setSidebarOpen(false)
		}, 150)
		setSidebarHoverTimeout(timeout)
	}

	return (
		<Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
			<CssBaseline />

			<Box onMouseEnter={handleSidebarMouseEnter} onMouseLeave={handleSidebarMouseLeave} sx={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
				<AppHeader onOpenChat={() => setChatOpen(prev => !prev)} onOpenSidebar={() => setSidebarOpen(prev => !prev)} />
				<SideNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
			</Box>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
					bgcolor: '#f5faf9',
				}}
			>
				<Toolbar sx={{ minHeight: 120 }} />
				<Box
					sx={{
						flexGrow: 1,
						overflow: 'auto',
						pb: 3,
					}}
				>
					{children}
				</Box>
			</Box>

			{chatOpen && <ChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} chatState={chatState} width={chatWidth} onWidthChange={setChatWidth} />}
		</Box>
	)
}