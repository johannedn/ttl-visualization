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

export function SideNav() {
	return (
		<Drawer
			variant="permanent"
			sx={{
			width: DRAWER_WIDTH,
			[`& .MuiDrawer-paper`]: {
			width: DRAWER_WIDTH,
			boxSizing: 'border-box',
			},
			}}
			open
		>
			<Toolbar>
				<Typography variant="h6">My App</Typography>
			</Toolbar>
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
						<ListItemButton selected={isActive}>
							<ListItemText primary="Graph View" />
						</ListItemButton>
					)}
				</NavLink>

				<NavLink to="/table" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton selected={isActive}>
							<ListItemText primary="Table View" />
						</ListItemButton>
				)}
				</NavLink>

				<NavLink to="/history" style={linkStyle}>
					{({ isActive }) => (
						<ListItemButton selected={isActive}>
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
