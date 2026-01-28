import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { DashboardLayout } from './layout/DashboardLayout'
import { TTLUploader } from './components/TTLUploader'
import { GraphViewPage } from './pages/GraphViewPage'
import { GraphViewV2Page } from './pages/GraphViewV2Page'
import { GraphViewFullscreenPage } from './pages/GraphViewFullscreenPage'
import { TableViewPage } from './pages/TableViewPage'
import { HistoryPage } from './pages/HistoryPage'
import { useOntology } from '@context/OntologyContext'
import { usePageTitle } from '@context/PageContext'

type LoadMode = 'upload' | 'api'

export default function App() {
  const { triples, loadFromAPI, loadFromFile, loading, error } = useOntology()
  const { title } = usePageTitle()
  const [loadMode, setLoadMode] = useState<LoadMode>('api')

  const handleFileLoad = async (content: string) => {
    await loadFromFile(content)
  }

  return (
    <DashboardLayout>
      <Box 
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          px: 3,
          mt: 8,
          mb: 3,
        }}
      >
        <Typography 
          variant="h3" 
          gutterBottom
          sx={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: 0.5,
            color: '#1a3330',
            fontFamily: "'Segoe UI', 'Roboto', 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif",
          }}
        >
          {title}
        </Typography>
      </Box>

      <Routes>
        <Route path="/" element={<Navigate to="/graph" replace />} />
        <Route path="/graph" element={<GraphViewPage triples={triples} />} />
        <Route path="/graph-fullscreen" element={<GraphViewFullscreenPage triples={triples} />} />
        <Route path="/graph-v2" element={<GraphViewV2Page triples={triples} />} />
        <Route path="/table" element={<TableViewPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>

      <Box mt={4} p={3} sx={{ bgcolor: 'rgba(255, 255, 255, 0.7)', borderRadius: 2 }}>
        <Box display="flex" gap={2} mb={2}>
          <Button
            variant={loadMode === 'api' ? 'contained' : 'outlined'}
            onClick={() => setLoadMode('api')}
            sx={{
              bgcolor: loadMode === 'api' ? '#fbbf24' : 'transparent',
              color: loadMode === 'api' ? '#2d4f4b' : '#fbbf24',
              borderColor: '#fbbf24',
              '&:hover': {
                bgcolor: loadMode === 'api' ? '#f59e0b' : 'rgba(251, 191, 36, 0.1)',
                borderColor: '#fbbf24',
              },
            }}
          >
            Fetch from API
          </Button>
          <Button
            variant={loadMode === 'upload' ? 'contained' : 'outlined'}
            onClick={() => setLoadMode('upload')}
            sx={{
              bgcolor: loadMode === 'upload' ? '#fbbf24' : 'transparent',
              color: loadMode === 'upload' ? '#2d4f4b' : '#fbbf24',
              borderColor: '#fbbf24',
              '&:hover': {
                bgcolor: loadMode === 'upload' ? '#f59e0b' : 'rgba(251, 191, 36, 0.1)',
                borderColor: '#fbbf24',
              },
            }}
          >
            Upload File
          </Button>
        </Box>

        {loadMode === 'api' ? (
          <Button 
            onClick={loadFromAPI} 
            disabled={loading}
            variant="contained"
            sx={{
              bgcolor: '#fbbf24',
              color: '#2d4f4b',
              '&:hover': {
                bgcolor: '#f59e0b',
              },
              '&:disabled': {
                bgcolor: 'rgba(251, 191, 36, 0.3)',
                color: 'rgba(45, 79, 75, 0.5)',
              },
            }}
          >
            {loading ? 'Loading…' : 'Fetch Latest Ontology'}
          </Button>
        ) : (
          <TTLUploader onFileLoad={handleFileLoad} />
        )}

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
      </Box>
    </DashboardLayout>
  )
}
