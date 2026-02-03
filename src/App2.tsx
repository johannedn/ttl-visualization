import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { DashboardLayout } from './layout/DashboardLayout'
import { TTLUploader } from './components/TTLUploader'
import { GraphViewPage } from './pages/GraphViewPage'
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
        <Route path="/table" element={<TableViewPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </DashboardLayout>
  )
}
