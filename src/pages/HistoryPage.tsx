// src/pages/HistoryPage.tsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { historyService, type HistoryEntry } from '@api/historyService';
import { HistoryDetailDialog } from '@components/HistoryDetailDialog';
import { usePageTitle } from '@context/PageContext';

export function HistoryPage() {
  const { setTitle } = usePageTitle()
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setTitle('Ontology Change History')
  }, [setTitle])

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await historyService.getAllHistory();
        // Sort by timestamp descending (newest first)
        const sorted = data.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setHistory(sorted);
      } catch (err) {
        setError('Failed to load history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleViewDetails = (versionId: string) => {
    setSelectedVersionId(versionId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVersionId(null);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Version History
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && history.length === 0 && (
        <Alert severity="info">No history entries found</Alert>
      )}

      {!loading && !error && history.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Version ID</strong></TableCell>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>User</strong></TableCell>
                <TableCell><strong>Summary</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((entry) => (
                <TableRow key={entry.version_id} hover>
                  <TableCell>{entry.version_id}</TableCell>
                  <TableCell>
                    {new Date(entry.timestamp).toLocaleString('no-NO')}
                  </TableCell>
                  <TableCell>{entry.user}</TableCell>
                  <TableCell>{entry.summary}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(entry.version_id)}
                      title="View details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <HistoryDetailDialog
        open={dialogOpen}
        versionId={selectedVersionId}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}