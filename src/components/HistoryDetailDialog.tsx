import { useEffect, useState } from 'react';
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
} from '@mui/material';
import { historyService } from '@api/historyService';
import type { HistoryDetail } from 'types/history';

interface HistoryDetailDialogProps {
  open: boolean;
  versionId: string | null;
  onClose: () => void;
}

export function HistoryDetailDialog({ open, versionId, onClose }: HistoryDetailDialogProps) {
  const [detail, setDetail] = useState<HistoryDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xl" 
      fullWidth
      PaperProps={{
        sx: {
          width: '95vw',
          maxWidth: '1600px',
          height: '90vh',
          borderRadius: 3,
          border: '2px solid #fbbf24',
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: '#2d4f4b', 
        color: '#fbbf24',
        fontSize: 24,
        fontWeight: 700,
        py: 2.5,
      }}>
        History Details: {versionId}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 3, bgcolor: '#f5faf9' }}>
        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress sx={{ color: '#fbbf24' }} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {detail && !loading && (
          <Box>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                border: '1px solid #fbbf24',
              }}
            >
              <Typography variant="body1" sx={{ mb: 1, color: '#1a3330' }}>
                <strong style={{ color: '#2d4f4b' }}>Timestamp:</strong> {new Date(detail.created_at * 1000).toLocaleString('no-NO')}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, color: '#1a3330' }}>
                <strong style={{ color: '#2d4f4b' }}>User:</strong> {detail.actor}
              </Typography>
              {detail.instruction && (
                <Typography variant="body1" sx={{ mb: 1, color: '#1a3330' }}>
                  <strong style={{ color: '#2d4f4b' }}>Request:</strong> {detail.instruction}
                </Typography>
              )}
              <Typography variant="body1" sx={{ color: '#1a3330' }}>
                <strong style={{ color: '#2d4f4b' }}>Summary:</strong> {detail.plan_summary}
              </Typography>
            </Paper>

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{
                maxHeight: 'calc(90vh - 350px)',
                bgcolor: '#FFFFFF',
                border: '2px solid #fbbf24',
                borderRadius: 2,
                '&::-webkit-scrollbar': {
                  width: '12px',
                  height: '12px',
                },
                '&::-webkit-scrollbar-track': {
                  bgcolor: '#f5f5f5',
                  borderRadius: 3,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(45, 79, 75, 0.3)',
                  borderRadius: 3,
                  border: '2px solid #f5f5f5',
                  '&:hover': {
                    bgcolor: 'rgba(45, 79, 75, 0.5)',
                  },
                },
              }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell 
                      colSpan={3} 
                      align="center" 
                      sx={{ 
                        bgcolor: 'rgba(239, 68, 68, 0.15)',
                        borderRight: '2px solid #fbbf24',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#dc2626',
                        py: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      Before (Removed)
                    </TableCell>
                    <TableCell 
                      colSpan={3} 
                      align="center" 
                      sx={{ 
                        bgcolor: 'rgba(34, 197, 94, 0.15)',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#16a34a',
                        py: 1.5,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      After (Added)
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ 
                      width: '16.66%', 
                      bgcolor: '#fafafa',
                      color: '#2d4f4b',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      py: 1.5,
                    }}>
                      Subject
                    </TableCell>
                    <TableCell sx={{ 
                      width: '16.66%', 
                      bgcolor: '#fafafa',
                      color: '#2d4f4b',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      py: 1.5,
                    }}>
                      Predicate
                    </TableCell>
                    <TableCell sx={{ 
                      width: '16.66%', 
                      bgcolor: '#fafafa',
                      color: '#2d4f4b',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      borderRight: '2px solid #fbbf24',
                      py: 1.5,
                    }}>
                      Object
                    </TableCell>
                    <TableCell sx={{ 
                      width: '16.66%', 
                      bgcolor: '#fafafa',
                      color: '#2d4f4b',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      py: 1.5,
                    }}>
                      Subject
                    </TableCell>
                    <TableCell sx={{ 
                      width: '16.66%', 
                      bgcolor: '#fafafa',
                      color: '#2d4f4b',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      py: 1.5,
                    }}>
                      Predicate
                    </TableCell>
                    <TableCell sx={{ 
                      width: '16.66%', 
                      bgcolor: '#fafafa',
                      color: '#2d4f4b',
                      fontWeight: 600,
                      fontSize: 12,
                      textTransform: 'uppercase',
                      py: 1.5,
                    }}>
                      Object
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {Array.from({ length: Math.max(removedTriples.length, addedTriples.length) }).map((_, idx) => {
                    const removedTriple = removedTriples[idx];
                    const addedTriple = addedTriples[idx];

                    return (
                      <TableRow 
                        key={idx}
                        sx={{
                          bgcolor: idx % 2 === 0 ? '#FFFFFF' : '#f5faf9',
                          '&:hover': {
                            bgcolor: 'rgba(251, 191, 36, 0.08) !important',
                          },
                        }}
                      >
                        <TableCell sx={{ 
                          wordBreak: 'break-word',
                          fontSize: 13,
                          color: '#1a3330',
                          py: 1.5,
                          bgcolor: removedTriple ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                        }}>
                          {removedTriple?.s?.value || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          wordBreak: 'break-word',
                          fontSize: 13,
                          color: '#1a3330',
                          py: 1.5,
                          bgcolor: removedTriple ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                        }}>
                          {removedTriple?.p?.value || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          wordBreak: 'break-word',
                          fontSize: 13,
                          color: '#1a3330',
                          borderRight: '2px solid #fbbf24',
                          py: 1.5,
                          bgcolor: removedTriple ? 'rgba(239, 68, 68, 0.05)' : 'transparent',
                        }}>
                          {removedTriple?.o?.value || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          wordBreak: 'break-word',
                          fontSize: 13,
                          color: '#1a3330',
                          py: 1.5,
                          bgcolor: addedTriple ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                        }}>
                          {addedTriple?.s?.value || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          wordBreak: 'break-word',
                          fontSize: 13,
                          color: '#1a3330',
                          py: 1.5,
                          bgcolor: addedTriple ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                        }}>
                          {addedTriple?.p?.value || ''}
                        </TableCell>
                        <TableCell sx={{ 
                          wordBreak: 'break-word',
                          fontSize: 13,
                          color: '#1a3330',
                          py: 1.5,
                          bgcolor: addedTriple ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                        }}>
                          {addedTriple?.o?.value || ''}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2.5, bgcolor: '#fafafa', borderTop: '2px solid #fbbf24' }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            bgcolor: '#2d4f4b',
            color: '#fbbf24',
            fontWeight: 600,
            px: 4,
            py: 1,
            '&:hover': {
              bgcolor: '#1a3330',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}