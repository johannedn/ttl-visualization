import React, { useMemo, useState, useCallback, useEffect } from 'react'
import {
  Box,
  Checkbox,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

import { useOntology } from '@context/OntologyContext'
import { isURI, getShortName, getNamespace } from '@utils/tripleUtils'
import { FilterBar } from './FilterBar'

export function TableView() {
  const { triples, selectedTriples, toggleTriple } = useOntology()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const objectToText = useCallback((v: any) => (typeof v === 'string' ? v : v?.value ?? ''), [])

  const [showFullURI, setShowFullURI] = useState(false)
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(50)
  const [columnFilters, setColumnFilters] = useState({
    subject: [] as string[],
    predicate: [] as string[],
    object: [] as string[],
  })

  const columnOptions = useMemo(() => {
    const filtered = triples.filter((t: any) => {
      const objectValue = objectToText(t.object)
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(t.subject)) return false
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(t.predicate)) return false
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(objectValue)) return false
      return true
    })

    return {
      subject: Array.from(new Set(filtered.map(t => t.subject))).sort(),
      predicate: Array.from(new Set(filtered.map(t => t.predicate))).sort(),
      object: Array.from(new Set(filtered.map(t => objectToText(t.object)))).sort(),
    }
  }, [triples, columnFilters, objectToText])

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
  }, [triples, filter, columnFilters, objectToText])

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
      <FilterBar
        searchTerm={filter}
        onSearchChange={setFilter}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        columnOptions={columnOptions}
        showFullURI={showFullURI}
        onFullURIChange={setShowFullURI}
        filteredCount={filteredTriples.length}
        totalCount={triples.length}
        optionFilter={optionFilter}
      />

      {/* Table */}
      <Paper 
        elevation={0}
        sx={{
          borderRadius: { xs: 2, sm: 3 },
          bgcolor: '#FFFFFF',
          border: '2px solid #fbbf24',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          overflow: 'auto',
          // Horizontal scroll på små skjermer
          overflowX: { xs: 'auto', md: 'visible' },
        }}
      >
        <Table 
          size={isMobile ? 'small' : 'medium'} 
          sx={{ 
            minWidth: { xs: 600, sm: 800, md: 980 }, 
            tableLayout: 'fixed', 
            width: '100%' 
          }}
        >
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
                  width: '33.33%',
                  borderBottom: '2px solid #fbbf24',
                  '&:first-of-type': { width: { xs: '40px', sm: '50px' } },
                },
              }}
            >
              <TableCell padding="checkbox" />
              <TableCell>Subject</TableCell>
              <TableCell>Predicate</TableCell>
              <TableCell>Object</TableCell>
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
                      py: { xs: 1.5, sm: 2 },
                      px: { xs: 1, sm: 2 },
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
                      size={isMobile ? 'small' : 'medium'}
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
                              fontSize: { xs: 14, sm: 15, md: 17 },
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
                              sx={{ 
                                fontSize: { xs: 11, sm: 12, md: 13 }, 
                                wordBreak: 'break-word', 
                                letterSpacing: 0.3, 
                                color: 'rgba(26, 51, 48, 0.6)',
                                display: { xs: 'none', sm: 'block' }, // Skjul namespace på mobil
                              }}
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
      </Paper>

      {/* Pagination */}
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
        rowsPerPageOptions={isMobile ? [50, 100] : [50, 100, 200, 500]}
        sx={{
          borderTop: '1px solid rgba(45, 79, 75, 0.1)',
          bgcolor: '#FFFFFF',
          '& .MuiTablePagination-toolbar': {
            px: { xs: 1, sm: 2 },
            minHeight: { xs: 52, sm: 64 },
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: { xs: 12, sm: 14 },
          },
        }}
      />
    </Box>
  )
}