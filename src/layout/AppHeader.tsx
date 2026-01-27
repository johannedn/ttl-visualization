import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import MenuIcon from '@mui/icons-material/Menu'


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
				<MenuIcon sx={{ fontSize: 32 }} />
			</IconButton>
			<Typography variant="body1" sx={{ mr: 3, fontWeight: 600, fontSize: 18, color: '#fbbf24' }}>
				Menu
			</Typography>
			<Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700, fontSize: 32, color: '#fbbf24' }}>
				APE-AI: Unified Ontology Generation for Heterogenous Data Sources
			</Typography>
			<IconButton 
				onClick={onOpenChat}
				sx={{ 
					color: '#fbbf24',
					'&:hover': { bgcolor: 'rgba(251, 191, 36, 0.15)' },
					'&.MuiIconButton-root': { 
						'&:focus': { outline: 'none' },
					}
				}}
				disableRipple
			>
				<ChatIcon sx={{ fontSize: 32 }} />
			</IconButton>
		</Toolbar>
	</AppBar>
)
}