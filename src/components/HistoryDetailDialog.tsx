// src/components/HistoryDetailDialog.tsx
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Grid,
} from '@mui/material';
import { historyService, type HistoryDetail } from '@api/historyService';
import { parseTTL, type Triple } from '@utils/ttlParser';

interface HistoryDetailDialogProps {
  open: boolean;
  versionId: string | null;
  onClose: () => void;
}

export function HistoryDetailDialog({ open, versionId, onClose }: HistoryDetailDialogProps) {
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldTriples, setOldTriples] = useState<Triple[]>([]);
  const [newTriples, setNewTriples] = useState<Triple[]>([]);

  useEffect(() => {
    if (!open || !versionId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await historyService.getHistoryEntry(versionId);
        setDetail(data);

        // Parse old and new ontologies
        if (data.old_ontology) {
          const parsed = await parseTTL(data.old_ontology);
          setOldTriples(parsed);
        } else {
          setOldTriples([]);
        }
        
        if (data.new_ontology) {
          const parsed = await parseTTL(data.new_ontology);
          setNewTriples(parsed);
        } else {
          setNewTriples([]);
        }
      } catch (err) {
        setError('Failed to load history details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, versionId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        History Details: {versionId}
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {detail && !loading && (
          <Box>
            <Box mb={3}>
              <Typography variant="body2" color="text.secondary">
                <strong>Timestamp:</strong> {new Date(detail.timestamp).toLocaleString('no-NO')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>User:</strong> {detail.user}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                <strong>Summary:</strong> {detail.summary}
              </Typography>
            </Box>

            <Grid container spacing={2}>
				<Grid item xs={12}>
					<TableContainer
					component={Paper}
					variant="outlined"
					sx={{
						maxHeight: 500,
						maxWidth: '100%',
						overflowX: 'auto', // Scroll horisontalt om nødvendig
					}}
					>
					<Table size="small" stickyHeader>
						{/* Første rad: Before / After header */}
						<TableHead>
						<TableRow>
							<TableCell colSpan={3} align="center" sx={{ backgroundColor: 'error.light' }}>
							Before (Old)
							</TableCell>
							<TableCell colSpan={3} align="center" sx={{ backgroundColor: 'success.light' }}>
							After (New)
							</TableCell>
						</TableRow>
						{/* Andre rad: kolonneoverskrifter */}
						<TableRow>
							<TableCell sx={{ width: '16.66%', wordBreak: 'break-word' }}>Subject</TableCell>
							<TableCell sx={{ width: '16.66%', wordBreak: 'break-word' }}>Predicate</TableCell>
							<TableCell sx={{ width: '16.66%', wordBreak: 'break-word' }}>Object</TableCell>
							<TableCell sx={{ width: '16.66%', wordBreak: 'break-word' }}>Subject</TableCell>
							<TableCell sx={{ width: '16.66%', wordBreak: 'break-word' }}>Predicate</TableCell>
							<TableCell sx={{ width: '16.66%', wordBreak: 'break-word' }}>Object</TableCell>
						</TableRow>
						</TableHead>

						<TableBody>
						{Array.from({ length: Math.max(oldTriples.length, newTriples.length) }).map((_, idx) => {
							const oldTriple = oldTriples[idx];
							const newTriple = newTriples[idx];

							return (
							<TableRow key={idx}>
								{/* Before */}
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{oldTriple?.subject || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{oldTriple?.predicate || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 250 }}>{oldTriple?.object || ''}</TableCell>

								{/* After */}
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{newTriple?.subject || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{newTriple?.predicate || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 250 }}>{newTriple?.object || ''}</TableCell>
							</TableRow>
							);
						})}
						</TableBody>
					</Table>
					</TableContainer>
				</Grid>
			</Grid>


          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}