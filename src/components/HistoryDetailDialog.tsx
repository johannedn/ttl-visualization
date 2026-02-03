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
import { historyService } from '@api/historyService';
import type {  HistoryDetail, DiffTriple } from 'types/history';


const termToString = (term: Triple['object'] | undefined): string => {
  if (!term) return '';
  if (typeof term === 'string') return term;
  return term.value;
};

interface HistoryDetailDialogProps {
  open: boolean;
  versionId: string | null;
  onClose: () => void;
}

export function HistoryDetailDialog({ open, versionId, onClose }: HistoryDetailDialogProps) {
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const [oldTriples, setOldTriples] = useState<Triple[]>([]);
  // const [newTriples, setNewTriples] = useState<Triple[]>([]);

  useEffect(() => {
    if (!open || !versionId) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await historyService.getHistoryEntry(versionId);
        setDetail(data);
        setError(null)

      } catch (err) {
        setError('Failed to load history details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, versionId]);

  const removedTriples = detail?.diff?.removed || [];
  const addedTriples = detail?.diff?.added || [];

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
                <strong>Timestamp:</strong> {new Date(detail.created_at * 1000).toLocaleString('no-NO')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>User:</strong> {detail.actor}
              </Typography>
              {detail.instruction && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Request:</strong> {detail.instruction}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" mt={1}>
                <strong>Summary:</strong> {detail.plan_summary}
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
						{Array.from({ length: Math.max(removedTriples.length, addedTriples.length) }).map((_, idx) => {
							const removedTriple = removedTriples[idx];
							const addedTriple = addedTriples[idx];

							return (
							<TableRow key={idx}>
								{/* Before */}
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{removedTriple?.s?.value || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{removedTriple?.p?.value || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 250 }}>{removedTriple?.o?.value || ''}</TableCell>

								{/* After */}
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{addedTriple?.s?.value || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 200 }}>{addedTriple?.p?.value || ''}</TableCell>
								<TableCell sx={{ wordBreak: 'break-word', maxWidth: 250 }}>{addedTriple?.o?.value || ''}</TableCell>
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