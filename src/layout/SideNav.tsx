import {
	Drawer,
	Toolbar,
	List,
	ListItemButton,
	ListItemText,
	Divider,
	Typography,
	Box,
	ListItemIcon,
} from '@mui/material'
import { NavLink } from 'react-router-dom'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import TableChartIcon from '@mui/icons-material/TableChart'
import HistoryIcon from '@mui/icons-material/History'



const DRAWER_WIDTH = 240

const linkStyle = {
	textDecoration: 'none',
	color: 'inherit',
}

interface SideNavProps {
	open: boolean
	onClose: () => void
}

export function SideNav({ open, onClose }: SideNavProps) {
	return (
		<Drawer
			variant="persistent"
			anchor="left"
			open={open}
			onClose={onClose}
			onClick={e => e.stopPropagation()}
			sx={{
				[`& .MuiDrawer-paper`]: {
					width: DRAWER_WIDTH,
					boxSizing: 'border-box',
					marginTop: '120px',
					height: 'auto',
				},
			}}
		>
			{/* Claude sin versjon */}
			<List>
				<NavLink to="/graph" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton 
							selected={isActive} 
							onClick={onClose}
							sx={{
								color: '#2d4f4b',
								'&:hover': {
									bgcolor: 'rgba(251, 191, 36, 0.2)',
								},
								...(isActive && {
									bgcolor: 'rgba(251, 191, 36, 0.3)',
									borderLeft: '4px solid #fbbf24',
									pl: 1.5,
								}),
							}}
						>
							<ListItemIcon sx={{ color: '#2d4f4b', minWidth: 40 }}>
								<AccountTreeIcon />
							</ListItemIcon>
							<ListItemText 
								primary="Graph View" 
								sx={{ '& .MuiTypography-root': { fontWeight: 700, color: '#2d4f4b' } }}
							/>
						</ListItemButton>
					)}
				</NavLink>

				<NavLink to="/table" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton 
							selected={isActive} 
							onClick={onClose}
							sx={{
								color: '#2d4f4b',
								'&:hover': {
									bgcolor: 'rgba(251, 191, 36, 0.2)',
								},
								...(isActive && {
									bgcolor: 'rgba(251, 191, 36, 0.3)',
									borderLeft: '4px solid #fbbf24',
									pl: 1.5,
								}),
							}}
						>
							<ListItemIcon sx={{ color: '#2d4f4b', minWidth: 40 }}>
								<TableChartIcon />
							</ListItemIcon>
							<ListItemText 
								primary="Table View" 
								sx={{ '& .MuiTypography-root': { fontWeight: 700, color: '#2d4f4b' } }}
							/>
						</ListItemButton>
					)}
				</NavLink>

				<NavLink to="/history" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton 
							selected={isActive} 
							onClick={onClose}
							sx={{
								color: '#2d4f4b',
								'&:hover': {
									bgcolor: 'rgba(251, 191, 36, 0.2)',
								},
								...(isActive && {
									bgcolor: 'rgba(251, 191, 36, 0.3)',
									borderLeft: '4px solid #fbbf24',
									pl: 1.5,
								}),
							}}
						>
							<ListItemIcon sx={{ color: '#2d4f4b', minWidth: 40 }}>
								<HistoryIcon />
							</ListItemIcon>
							<ListItemText 
								primary="History" 
								sx={{ '& .MuiTypography-root': { fontWeight: 700, color: '#2d4f4b' } }}
							/>
						</ListItemButton>
					)}
				</NavLink>
			</List>
		</Drawer>
	)
}


export { DRAWER_WIDTH }
