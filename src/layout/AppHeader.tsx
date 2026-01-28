import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import MenuIcon from '@mui/icons-material/Menu'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import TableChartIcon from '@mui/icons-material/TableChart'
import HistoryIcon from '@mui/icons-material/History'
import { NavLink } from 'react-router-dom'


interface AppHeaderProps {
	onOpenChat: () => void
	onOpenSidebar: () => void
}


export function AppHeader({ onOpenChat, onOpenSidebar }: AppHeaderProps) {
	return (
	<AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1, bgcolor: '#2d4f4b', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}>
		<Toolbar sx={{ minHeight: 120, py: 3 }}>
			<IconButton 
				onClick={onOpenSidebar} 
				sx={{ 
					mr: 1,
					color: '#fbbf24',
					'&:hover': { bgcolor: 'rgba(251, 191, 36, 0.15)' },
					'&.MuiIconButton-root': { 
						'&:focus': { outline: 'none' },
					}
				}}
				disableRipple
			>
				<MenuIcon sx={{ fontSize: 24 }} />
			</IconButton>
			<Typography variant="body1" sx={{ mr: 3, fontWeight: 600, fontSize: 16, color: '#fbbf24' }}>
				Menu
			</Typography>
			<Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, fontSize: 32, color: '#fbbf24' }}>
				Ontology Studio
			</Typography>
			
			{/* Navigation */}
			<Box sx={{ display: 'flex', gap: 3, mr: 3 }}>
				<NavLink to="/graph" style={{ textDecoration: 'none' }}>
					{({ isActive }) => (
						<Box 
							sx={{ 
								display: 'flex', 
								flexDirection: 'column', 
								alignItems: 'center',
								cursor: 'pointer',
								opacity: isActive ? 1 : 0.7,
								'&:hover': { opacity: 1 },
							}}
						>
							<AccountTreeIcon sx={{ fontSize: 24, color: '#fbbf24' }} />
							<Typography variant="caption" sx={{ color: '#fbbf24', fontSize: 16, mt: 0.5, fontWeight: 600 }}>
								Graph
							</Typography>
						</Box>
					)}
				</NavLink>
				
				<NavLink to="/graph-v2" style={{ textDecoration: 'none' }}>
					{({ isActive }) => (
						<Box 
							sx={{ 
								display: 'flex', 
								flexDirection: 'column', 
								alignItems: 'center',
								cursor: 'pointer',
								opacity: isActive ? 1 : 0.7,
								'&:hover': { opacity: 1 },
							}}
						>
							<BubbleChartIcon sx={{ fontSize: 24, color: '#fbbf24' }} />
							<Typography variant="caption" sx={{ color: '#fbbf24', fontSize: 16, mt: 0.5, fontWeight: 600 }}>
								Graph V2
							</Typography>
						</Box>
					)}
				</NavLink>
				
				<NavLink to="/table" style={{ textDecoration: 'none' }}>
					{({ isActive }) => (
						<Box 
							sx={{ 
								display: 'flex', 
								flexDirection: 'column', 
								alignItems: 'center',
								cursor: 'pointer',
								opacity: isActive ? 1 : 0.7,
								'&:hover': { opacity: 1 },
							}}
						>
							<TableChartIcon sx={{ fontSize: 24, color: '#fbbf24' }} />
							<Typography variant="caption" sx={{ color: '#fbbf24', fontSize: 16, mt: 0.5, fontWeight: 600 }}>
								Table
							</Typography>
						</Box>
					)}
				</NavLink>
				
				<NavLink to="/history" style={{ textDecoration: 'none' }}>
					{({ isActive }) => (
						<Box 
							sx={{ 
								display: 'flex', 
								flexDirection: 'column', 
								alignItems: 'center',
								cursor: 'pointer',
								opacity: isActive ? 1 : 0.7,
								'&:hover': { opacity: 1 },
							}}
						>
							<HistoryIcon sx={{ fontSize: 24, color: '#fbbf24' }} />
							<Typography variant="caption" sx={{ color: '#fbbf24', fontSize: 16, mt: 0.5, fontWeight: 600 }}>
								History
							</Typography>
						</Box>
					)}
				</NavLink>
			</Box>
			
			<Box 
				onClick={onOpenChat}
				sx={{ 
					display: 'flex', 
					flexDirection: 'column', 
					alignItems: 'center',
					cursor: 'pointer',
					'&:hover': { opacity: 0.8 },
				}}
			>
				<ChatIcon sx={{ fontSize: 24, color: '#fbbf24' }} />
				<Typography variant="caption" sx={{ color: '#fbbf24', fontSize: 16, mt: 0.5, fontWeight: 600 }}>
					Chat
				</Typography>
			</Box>
		</Toolbar>
	</AppBar>
)
}