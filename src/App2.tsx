import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layout/DashboardLayout'
import { TTLUploader } from './components/TTLUploader'
import { GraphViewPage } from './pages/GraphViewPage'
import { TableViewPage } from './pages/TableViewPage'
import { HistoryPage } from './pages/HistoryPage'
import { Box, Button, Typography } from '@mui/material'
import { useOntology } from '@context/OntologyContext'

type LoadMode = 'upload' | 'api'

export default function App() {
  const { triples, loadFromAPI, loadFromFile, loading, error } = useOntology()
  const [loadMode, setLoadMode] = useState<LoadMode>('api')

  // Ved oppstart, hvis API mode, last inn triplene
  useEffect(() => {
    if (loadMode === 'api') {
      loadFromAPI()
    }
  }, [loadMode, loadFromAPI])

  const handleFileLoad = async (content: string) => {
    await loadFromFile(content)
  }

  return (
    <DashboardLayout>
      <Box mb={3}>
        <Typography variant="h5" gutterBottom>
          Unified Ontology Generation for Heterogenous Data
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <Button
            variant={loadMode === 'api' ? 'contained' : 'outlined'}
            onClick={() => setLoadMode('api')}
          >
            Fetch from API
          </Button>
          <Button
            variant={loadMode === 'upload' ? 'contained' : 'outlined'}
            onClick={() => setLoadMode('upload')}
          >
            Upload File
          </Button>
        </Box>

        {loadMode === 'api' ? (
          <Button onClick={loadFromAPI} disabled={loading}>
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

      <Routes>
        <Route path="/" element={<Navigate to="/graph" replace />} />
        <Route path="/graph" element={<GraphViewPage triples={triples} />} />
        <Route path="/table" element={<TableViewPage triples={triples} />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </DashboardLayout>
  )
}
