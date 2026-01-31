import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Box,
  Checkbox,
  Chip,
  Autocomplete,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

import { useOntology } from '@context/OntologyContext'
import { isURI, getShortName, getNamespace } from '@utils/tripleUtils'

export function TableView() {
  const { triples, selectedTriples, toggleTriple } = useOntology()

  const objectToText = useCallback((v: any) => (typeof v === 'string' ? v : v?.value ?? ''), [])

  const [showFullURI, setShowFullURI] = useState(false)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(200)
  const [columnFilters, setColumnFilters] = useState({
    subject: [] as string[],
    predicate: [] as string[],
    object: [] as string[],
  })

  const columnOptions = useMemo(() => {
    // Filter triples based on currently active column filters
    const filtered = triples.filter((t: any) => {
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(t.subject)) return false
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(t.predicate)) return false
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(t.object)) return false
      return true
    })

    return {
      subject: Array.from(new Set(filtered.map(t => t.subject))).sort(),
      predicate: Array.from(new Set(filtered.map(t => t.predicate))).sort(),
      object: Array.from(new Set(filtered.map(t => objectToText(t.object)))).sort(),
    }
  }, [triples, columnFilters])

  const optionFilter = useCallback(
    (options: string[], { inputValue }: { inputValue: string }) => {
      const iv = inputValue.trim()
      if (!iv) return options.slice(0, 50)
      const lower = iv.toLowerCase()
      const out: string[] = []
      for (const opt of options) {
        if (opt.toLowerCase().includes(lower)) {
          out.push(opt)
          if (out.length >= 50) break
        }
      }
      return out
    },
    []
  )

  const filteredTriples = useMemo(() => {
    const subjectSet = columnFilters.subject.length > 0 ? new Set(columnFilters.subject) : null
    const predicateSet = columnFilters.predicate.length > 0 ? new Set(columnFilters.predicate) : null
    const objectSet = columnFilters.object.length > 0 ? new Set(columnFilters.object) : null
    const filterLower = filter.toLowerCase()

    return triples.filter((t: any) => {
      if (filterLower && !(
        t.subject.toLowerCase().includes(filterLower) ||
        t.predicate.toLowerCase().includes(filterLower) ||
        objectToText(t.object).toLowerCase().includes(filterLower)
      )) return false

      if (subjectSet && !subjectSet.has(t.subject)) return false
      if (predicateSet && !predicateSet.has(t.predicate)) return false
      if (objectSet && !objectSet.has(objectToText(t.object))) return false

      return true
    })
  }, [triples, filter, columnFilters])

  const visibleTriples = useMemo(() => {
    const start = page * rowsPerPage
    return filteredTriples.slice(start, start + rowsPerPage)
  }, [filteredTriples, page, rowsPerPage])

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(filteredTriples.length / rowsPerPage) - 1)
    if (page > maxPage) setPage(0)
  }, [filteredTriples.length, rowsPerPage, page])

  const isSelected = (t: any) =>
    selectedTriples.some(
      s => s.subject === t.subject && s.predicate === t.predicate && s.object === t.object
    )

  const formatPrimary = useCallback((v: string) => (showFullURI ? v : getShortName(v)), [showFullURI])
  const containerHeight = 'calc(100vh - 320px)'

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
      {/* Toolbar */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          bgcolor: '#FFFFFF', 
          border: '2px solid #fbbf24',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <TextField
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search triples…"
            size="small"
            fullWidth
            sx={{ 
              maxWidth: { md: 520 },
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

          <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ fontSize: 14, color: '#2d4f4b', fontWeight: 500 }}>
                Full URIs
              </Typography>
              <Switch 
                checked={showFullURI} 
                onChange={e => setShowFullURI(e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#fbbf24',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#fbbf24',
                  },
                }}
              />
            </Stack>

            <Chip
              label={`${filteredTriples.length} / ${triples.length}`}
              size="small"
              sx={{
                bgcolor: 'rgba(251, 191, 36, 0.2)',
                color: '#f59e0b',
                borderColor: '#fbbf24',
                fontWeight: 600,
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'auto',
          height: containerHeight,
          minHeight: containerHeight,
          maxHeight: containerHeight,
          flex: 1,
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
                  fontSize: 16,
                  fontWeight: 700,
                  py: 2,
                  bgcolor: '#fafafa',
                  color: '#2d4f4b',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  width: '33.33%',
                  borderBottom: 'none',
                  position: 'sticky',
                  top: 0,
                  zIndex: 11,
                  '&:first-of-type': { width: '50px' },
                },
              }}
            >
              <TableCell padding="checkbox" />
              <TableCell>Subject</TableCell>
              <TableCell>Predicate</TableCell>
              <TableCell>Object</TableCell>
            </TableRow>

            <TableRow
              sx={{
                '& th': {
                  bgcolor: '#fafafa',
                  borderBottom: '2px solid #fbbf24',
                  py: 1.5,
                  width: '33.33%',
                  position: 'sticky',
                  top: 64,
                  zIndex: 10,
                  '&:first-of-type': { width: '50px' },
                },
              }}
            >
              <TableCell padding="checkbox" />

              {(['subject', 'predicate', 'object'] as const).map(key => (
                <TableCell key={key} sx={{ minWidth: 240 }}>
                  <Autocomplete
                    multiple
                    size="small"
                    options={columnOptions[key]}
                    value={columnFilters[key]}
                    filterOptions={optionFilter}
                    onChange={(_, value) =>
                      setColumnFilters(prev => ({
                        ...prev,
                        [key]: value,
                      }))
                    }
                    disableCloseOnSelect
                    limitTags={1}
                    popupIcon={null}
                    clearIcon={null}
                    ChipProps={{ size: 'small' }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        px: 1,
                        py: 0.25,
                        borderRadius: 1.5,
                        bgcolor: 'background.default',
                      },
                    }}
                    slotProps={{
                      popper: { disablePortal: true },
                      paper: { sx: { maxHeight: 320 } },
                    }}
                    getOptionLabel={option => formatPrimary(option)}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          size="small"
                          checked={selected}
                          sx={{ 
                            mr: 1, 
                            p: 0.25,
                            color: 'rgba(251, 191, 36, 0.6)',
                            '&.Mui-checked': {
                              color: '#f59e0b',
                            },
                            '&:hover': {
                              bgcolor: 'rgba(251, 191, 36, 0.08)',
                            },
                            '& .MuiSvgIcon-root': {
                              color: 'inherit',
                            },
                          }}
                        />
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: isURI(option) ? 600 : 400 }}>
                            {formatPrimary(option)}
                          </Typography>
                          {!showFullURI && isURI(option) && (
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                              {getNamespace(option)}
                            </Typography>
                          )}
                        </Stack>
                      </li>
                    )}
                    renderInput={params => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder={`Filter ${key}`}
                        inputProps={{
                          ...params.inputProps,
                          'aria-label': `${key} filter`,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&.Mui-focused fieldset': {
                              borderColor: '#fbbf24',
                            },
                          },
                        }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.slice(0, 2).map((option, index) => {
                        const tagProps = getTagProps({ index })
                        return (
                          <Chip
                            {...tagProps}
                            key={option}
                            size="small"
                            label={formatPrimary(option)}
                            sx={{ maxWidth: '100%' }}
                          />
                        )
                      })
                    }
                  />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibleTriples.map((t, i) => {
              const selected = isSelected(t)

              return (
                <TableRow
                  key={`${i}-${t.subject}-${t.predicate}-${objectToText(t.object)}`}
                  hover
                  selected={selected}
                  onClick={() => toggleTriple(t)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: (page * rowsPerPage + i) % 2 === 0 ? '#f5faf9' : '#FFFFFF',
                    '& td': { 
                      py: 2, 
                      borderBottom: '1px solid rgba(45, 79, 75, 0.1)', 
                      color: '#1a3330',
                    },
                    '&:hover': {
                      bgcolor: 'rgba(251, 191, 36, 0.12)',
                    },
                    ...(selected && {
                      bgcolor: 'rgba(251, 191, 36, 0.2)',
                      '& td': { borderBottom: '1px solid #fbbf24' },
                    }),
                  }}
                >
                  <TableCell padding="checkbox" onClick={e => e.stopPropagation()}>
                    <Checkbox 
                      checked={selected} 
                      onChange={() => toggleTriple(t)}
                      sx={{
                        color: 'rgba(251, 191, 36, 0.6)',
                        '&.Mui-checked': {
                          color: '#f59e0b',
                        },
                      }}
                    />
                  </TableCell>

                  {[t.subject, t.predicate, objectToText(t.object)].map((v: string, j: number) => {
                    const uri = isURI(v)
                    const displayValue = showFullURI ? v : getShortName(v)
                    return (
                      <TableCell key={j} sx={{ verticalAlign: 'top' }}>
                        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: 17,
                              fontWeight: uri ? 600 : 400,
                              fontStyle: !uri ? 'italic' : 'normal',
                              lineHeight: 1.5,
                              wordBreak: 'break-word',
                              letterSpacing: 0.3,
                              color: '#1a3330',
                            }}
                            title={!showFullURI ? v : ''}
                          >
                            {displayValue}
                          </Typography>

                          {!showFullURI && uri && (
                            <Typography
                              variant="caption"
                              sx={{ fontSize: 13, wordBreak: 'break-word', letterSpacing: 0.3, color: 'rgba(26, 51, 48, 0.6)' }}
                            >
                              {getNamespace(v)}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    )
                  })}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredTriples.length}
        page={page}
        onPageChange={(_, nextPage) => setPage(nextPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10))
          setPage(0)
        }}
        rowsPerPageOptions={[50, 100, 200, 500]}
      />
    </Box>
  )
}