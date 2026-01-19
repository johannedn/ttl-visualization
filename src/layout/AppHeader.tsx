import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'


interface AppHeaderProps {
	onOpenChat: () => void
}


export function AppHeader({ onOpenChat }: AppHeaderProps) {
	return (
	<AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
		<Toolbar>
			<Typography variant="h6" sx={{ flexGrow: 1 }}>
				APE-AI: Unified Ontology Generation for Heterogenous Data Sources
			</Typography>
			<IconButton color="inherit" onClick={onOpenChat}>
				<ChatIcon />
			</IconButton>
		</Toolbar>
	</AppBar>
)
}