import {
	Drawer,
	Toolbar,
	List,
	ListItemButton,
	ListItemText,
	Divider,
	Typography,
	Box,
} from '@mui/material'
import { NavLink } from 'react-router-dom'



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
			variant="temporary"
			anchor="left"
			open={open}
			onClose={onClose}
			sx={{
				[`& .MuiDrawer-paper`]: {
					width: DRAWER_WIDTH,
					boxSizing: 'border-box',
					marginTop: '120px',
					height: 'calc(100vh - 120px)',
				},
			}}
		>
			<Box p={2}>
				<Typography variant="h6">Navigation</Typography>
			</Box>
			<Divider />
			{/* Claude sin versjon */}
			<List>
			{/*
				<NavLink to="/graph" style={{ textDecoration: 'none', color: 'inherit' }}>
					<ListItemButton>
						<ListItemText primary="Graph View" />
					</ListItemButton>
				</NavLink>

				<NavLink to="/table" style={{ textDecoration: 'none', color: 'inherit' }}>
					<ListItemButton>
						<ListItemText primary="Table View" />
					</ListItemButton>
				</NavLink>

				<NavLink to="/history" style={{ textDecoration: 'none', color: 'inherit' }}>
					<ListItemButton>
						<ListItemText primary="History" />
					</ListItemButton>
				</NavLink> */}

				{/*chat sin versjon*/}
				
				<NavLink to="/graph" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton selected={isActive} onClick={onClose}>
							<ListItemText primary="Graph View" />
						</ListItemButton>
					)}
				</NavLink>

				<NavLink to="/table" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton selected={isActive} onClick={onClose}>
							<ListItemText primary="Table View" />
						</ListItemButton>
				)}
				</NavLink>

				<NavLink to="/history" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton selected={isActive} onClick={onClose}>
							<ListItemText primary="History" />
						</ListItemButton>
				)}
				</NavLink>
				{/* <ListItemButton>
					<ListItemText primary="Table View" />
				</ListItemButton>
				<ListItemButton>
					<ListItemText primary="Graph View" />
				</ListItemButton>
				<ListItemButton>
					<ListItemText primary="History" />
				</ListItemButton> */}
			</List>
		</Drawer>
	)
}


export { DRAWER_WIDTH }
