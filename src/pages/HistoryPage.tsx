// src/pages/HistoryPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
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
  Autocomplete,
  Stack,
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
  const [columnFilters, setColumnFilters] = useState({
    versionId: [] as string[],
    actor: [] as string[],
    summary: [] as string[],
  });

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

  // Column options für Filter
  const columnOptions = useMemo(() => {
    const filtered = history.filter(entry => {
      if (columnFilters.versionId.length > 0 && !columnFilters.versionId.includes(entry.version_id)) return false;
      if (columnFilters.actor.length > 0 && !columnFilters.actor.includes(entry.actor)) return false;
      if (columnFilters.summary.length > 0 && !columnFilters.summary.includes(entry.plan_summary)) return false;
      return true;
    });

    return {
      versionId: Array.from(new Set(filtered.map(e => e.version_id))).sort(),
      actor: Array.from(new Set(filtered.map(e => e.actor))).sort(),
      summary: Array.from(new Set(filtered.map(e => e.plan_summary))).sort(),
    };
  }, [history, columnFilters]);

  // Filter logic
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // Column filters
      if (columnFilters.versionId.length > 0 && !columnFilters.versionId.includes(entry.version_id)) return false;
      if (columnFilters.actor.length > 0 && !columnFilters.actor.includes(entry.actor)) return false;
      if (columnFilters.summary.length > 0 && !columnFilters.summary.includes(entry.plan_summary)) return false;

      // Search term
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
  }, [history, searchTerm, columnFilters]);

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
      maxWidth: { xs: '100%', sm: '95%' },
      mx: 'auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: { xs: 1, sm: 1.5 },
      pb: 3,
      px: { xs: 1, sm: 2, md: 0 },
    }}>
      {/* Filter Bar */}
      <Stack 
        direction="row" 
        spacing={2} 
        alignItems="flex-start" 
        sx={{ display: 'flex', flexWrap: 'wrap' }}
      >
        {/* Search Box */}
        <TextField
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search…"
          size="small"
          sx={{ 
            maxWidth: 300,
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

        {/* Column Filters */}
        <Autocomplete
          multiple
          size="small"
          options={columnOptions.versionId}
          value={columnFilters.versionId}
          onChange={(_, value) =>
            setColumnFilters(prev => ({
              ...prev,
              versionId: value,
            }))
          }
          filterSelectedOptions
          sx={{ 
            flex: 1,
            minWidth: 180,
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
            '& .MuiChip-root': {
              bgcolor: '#fbbf24',
              color: '#2d4f4b',
              fontWeight: 600,
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Version ID"
              placeholder="Filter IDs"
            />
          )}
        />

        <Autocomplete
          multiple
          size="small"
          options={columnOptions.actor}
          value={columnFilters.actor}
          onChange={(_, value) =>
            setColumnFilters(prev => ({
              ...prev,
              actor: value,
            }))
          }
          filterSelectedOptions
          sx={{ 
            flex: 1,
            minWidth: 180,
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
            '& .MuiChip-root': {
              bgcolor: '#fbbf24',
              color: '#2d4f4b',
              fontWeight: 600,
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="User"
              placeholder="Filter users"
            />
          )}
        />

        <Autocomplete
          multiple
          size="small"
          options={columnOptions.summary}
          value={columnFilters.summary}
          onChange={(_, value) =>
            setColumnFilters(prev => ({
              ...prev,
              summary: value,
            }))
          }
          filterSelectedOptions
          sx={{ 
            flex: 1,
            minWidth: 180,
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
            '& .MuiChip-root': {
              bgcolor: '#fbbf24',
              color: '#2d4f4b',
              fontWeight: 600,
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Summary"
              placeholder="Filter summaries"
            />
          )}
        />
      </Stack>

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
        <Paper 
          elevation={0}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            bgcolor: '#FFFFFF',
            border: '2px solid #fbbf24',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'auto',
            overflowX: { xs: 'auto', md: 'visible' },
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    '& th': {
                      fontSize: { xs: 13, sm: 14, md: 16 },
                      fontWeight: 700,
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 1, sm: 2 },
                      bgcolor: '#fafafa',
                      color: '#2d4f4b',
                      letterSpacing: 0.5,
                      textTransform: 'uppercase',
                      borderBottom: '2px solid #fbbf24',
                    },
                  }}
                >
                  <TableCell><strong>Version ID</strong></TableCell>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell><strong>User</strong></TableCell>
                  <TableCell><strong>Summary</strong></TableCell>
                  <TableCell align="center"><strong>See more</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredHistory.map((entry, i) => (
                  <TableRow 
                    key={entry.version_id} 
                    hover
                    sx={{
                      bgcolor: i % 2 === 0 ? '#f5faf9' : '#FFFFFF',
                      '& td': { 
                        py: { xs: 1.5, sm: 2 },
                        px: { xs: 1, sm: 2 },
                        borderBottom: '1px solid rgba(45, 79, 75, 0.1)', 
                        color: '#1a3330',
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
        </Paper>
      )}

      <HistoryDetailDialog
        open={dialogOpen}
        versionId={selectedVersionId}
        onClose={handleCloseDialog}
      />
    </Box>
  );
}