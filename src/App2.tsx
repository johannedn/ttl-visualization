import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './layout/DashboardLayout'
import { TTLUploader } from './components/TTLUploader'
import { parseTTL } from './utils/ttlParser'
import type { Triple } from './utils/ttlParser'
import { ontologyService } from './api/ontologyService'
import { GraphViewPage } from './pages/GraphViewPage'
import { TableViewPage } from './pages/TableViewPage'
import { HistoryPage } from './pages/HistoryPage'
import { Box, Button, Typography } from '@mui/material'


type LoadMode = 'upload' | 'api'


export default function App() {
	const [triples, setTriples] = useState<Triple[]>([])
	const [loadMode, setLoadMode] = useState<LoadMode>('api')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)


	const handleFileLoad = async (content: string) => {
		try {
			setError(null)
			const parsed = await parseTTL(content)
			setTriples(parsed)
		} catch {
			setError('Failed to parse uploaded file')
		}
	}
	const handleFetchFromAPI = async () => {
		setLoading(true)
		setError(null)
		try {
			const ontology = await ontologyService.getLatestOntology()
			const parsed = await parseTTL(ontology.content)
			setTriples(parsed)
		} catch {
			setError('Failed to load ontology from server')
		} finally {
			setLoading(false)
		}
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
					<Button onClick={handleFetchFromAPI} disabled={loading}>
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