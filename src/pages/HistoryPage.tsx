import { useEffect, useState, useMemo } from 'react';
import {
  Box,
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
  TextField,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { historyService } from '@api/historyService';
import type { HistoryEntry } from 'types/history';
import { HistoryDetailDialog } from '@components/HistoryDetailDialog';
import { usePageTitle } from '@context/PageContext';

export function HistoryPage() {
  const { setTitle } = usePageTitle()
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setTitle('Ontology Change History')
  }, [setTitle])

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await historyService.getAllHistory();
        const sorted = data.sort((a, b) => 
          b.created_at - a.created_at
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

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      if (searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          entry.version_id.toLowerCase().includes(lowerSearch) ||
          entry.actor.toLowerCase().includes(lowerSearch) ||
          entry.plan_summary.toLowerCase().includes(lowerSearch)
        );
      }
      return true;
    });
  }, [history, searchTerm]);

  const handleViewDetails = (versionId: string) => {
    setSelectedVersionId(versionId);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedVersionId(null);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '95%',
      mx: 'auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 1.5,
      position: 'relative',
    }}>
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          bgcolor: '#FFFFFF', 
          border: '2px solid #fbbf24',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}>
        <TextField
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search history entries…"
          size="small"
          fullWidth
          sx={{ 
            maxWidth: 520,
            '& .MuiOutlinedInput-root': {
              color: '#2d4f4b',
              '& fieldset': {
                borderColor: 'rgba(45, 79, 75, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(45, 79, 75, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#fbbf24',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'rgba(45, 79, 75, 0.5)',
              opacity: 1,
            },
          }}
          InputProps={{
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1, color: 'rgba(45, 79, 75, 0.7)' }}>
                <SearchIcon fontSize="small" />
              </Box>
            ),
          }}
        />
      </Paper>

      {loading && (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && history.length === 0 && (
        <Alert severity="info">No history entries found</Alert>
      )}

      {!loading && !error && filteredHistory.length === 0 && history.length > 0 && (
        <Alert severity="info">No matching history entries found</Alert>
      )}

      {!loading && !error && filteredHistory.length > 0 && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            height: 'calc(100vh - 320px)',
            bgcolor: '#FFFFFF',
            border: '2px solid #fbbf24',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
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
            '&::-webkit-scrollbar-corner': {
              bgcolor: '#f5f5f5',
              borderRadius: 3,
            },
          }}
        >
          <Table stickyHeader size="medium" sx={{ minWidth: 980, tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow
                sx={{
                  '& th': {
                    bgcolor: '#fafafa',
                    borderBottom: '2px solid #fbbf24',
                    py: 2,
                    px: 2,
                    position: 'sticky',
                    top: 0,
                    zIndex: 11,
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#2d4f4b',
                    letterSpacing: 0.5,
                    textTransform: 'uppercase',
                  },
                }}
              >
                <TableCell sx={{ width: '20%' }}>Version ID</TableCell>
                <TableCell sx={{ width: '20%' }}>Timestamp</TableCell>
                <TableCell sx={{ width: '15%' }}>User</TableCell>
                <TableCell sx={{ width: '35%' }}>Summary</TableCell>
                <TableCell align="center" sx={{ width: '10%' }}>See more</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHistory.map((entry, i) => (
                <TableRow 
                  key={entry.version_id} 
                  hover
                  sx={{
                    bgcolor: i % 2 === 0 ? '#FFFFFF' : '#f5faf9',
                    '&:hover': {
                      bgcolor: 'rgba(251, 191, 36, 0.08) !important',
                    },
                    '& td': { 
                      py: 1.5,
                      px: 2,
                      borderBottom: '1px solid rgba(224, 224, 224, 1)', 
                      color: '#1a3330',
                      fontSize: 14,
                    },
                  }}
                >
                  <TableCell>{entry.version_id}</TableCell>
                  <TableCell>
                    {new Date(entry.created_at * 1000).toLocaleString('no-NO')}
                  </TableCell>
                  <TableCell>{entry.actor}</TableCell>
                  <TableCell>{entry.plan_summary}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(entry.version_id)}
                      title="View details"
                      sx={{
                        color: '#2d4f4b',
                        '&:hover': { 
                          bgcolor: 'rgba(45, 79, 75, 0.1)',
                          color: '#1a3330',
                        },
                        '&:focus': {
                          outline: '2px solid #fbbf24',
                          outlineOffset: '2px',
                        }
                      }}
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