import { AppBar, Toolbar, Typography, IconButton, Box, useMediaQuery, useTheme } from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import MenuIcon from '@mui/icons-material/Menu'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import TableChartIcon from '@mui/icons-material/TableChart'
import HistoryIcon from '@mui/icons-material/History'
import { NavLink } from 'react-router-dom'

interface AppHeaderProps {
  onOpenChat: () => void
  onOpenSidebar: () => void
}

export function AppHeader({ onOpenChat, onOpenSidebar }: AppHeaderProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <AppBar 
      position="fixed" 
      onClick={e => e.stopPropagation()} 
      sx={{ 
        zIndex: theme => theme.zIndex.drawer + 1, 
        bgcolor: '#2d4f4b', 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' 
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, md: 120 }, py: { xs: 1, md: 3 } }}>
        {/* Menu button - kun synlig på små skjermer */}
        {isMobile && (
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
        )}
        
        {/* Navigation - venstre side på desktop, skjult på mobil */}
        {!isMobile && (
          <Box sx={{ display: 'flex', gap: 3, mr: 6 }}> {/* ✅ Økt margin-right fra 3 til 6 */}
            <NavLink to="/graph" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.7,
                    transition: 'opacity 0.2s',
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
            
            <NavLink to="/table" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.7,
                    transition: 'opacity 0.2s',
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
                    transition: 'opacity 0.2s',
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
        )}
        
        {/* Overskrift */}
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 700, 
            fontSize: { xs: 20, sm: 24, md: 32 }, 
            color: '#fbbf24',
          }}
        >
          Ontology Studio
        </Typography>

        {/* Spacer - push chat til høyre */}
        <Box sx={{ flexGrow: 1 }} />
        
        {/* Chat - alltid synlig, alltid til høyre */}
        <Box 
          onClick={onOpenChat}
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 0.8 },
          }}
        >
          <ChatIcon sx={{ fontSize: 24, color: '#fbbf24' }} />
          <Typography 
            variant="caption" 
            sx={{ 
              color: '#fbbf24', 
              fontSize: { xs: 14, md: 16 }, 
              mt: 0.5, 
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Chat
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}