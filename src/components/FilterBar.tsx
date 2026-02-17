import { Box, TextField, Autocomplete, Stack, Checkbox, Switch, Typography, Chip } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import { getShortName } from '@utils/ttlParser'

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  
  columnFilters: {
    subject: string[]
    predicate: string[]
    object: string[]
  }
  onColumnFiltersChange: (filters: any) => void
  columnOptions: {
    subject: string[]
    predicate: string[]
    object: string[]
  }
  
  showFullURI?: boolean
  onFullURIChange?: (value: boolean) => void
  
  filteredCount: number
  totalCount: number
  
  optionFilter?: (options: string[], state: any) => string[]
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  columnFilters,
  onColumnFiltersChange,
  columnOptions,
  showFullURI,
  onFullURIChange,
  filteredCount,
  totalCount,
  optionFilter,
}: FilterBarProps) {
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ display: 'flex', flexWrap: 'wrap' }}>
      <TextField
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
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

      {(['subject', 'predicate', 'object'] as const).map(key => (
        <Autocomplete
          key={key}
          multiple
          size="small"
          options={columnOptions[key]}
          value={columnFilters[key]}
          onChange={(_, value) =>
            onColumnFiltersChange({
              ...columnFilters,
              [key]: value,
            })
          }
          getOptionLabel={(option) => getShortName(option)}
          filterSelectedOptions
          filterOptions={optionFilter}
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
            '& .MuiInputBase-input': {
              color: '#2d4f4b',
            },
            '& .MuiInputLabel-root': {
              color: '#2d4f4b',
              '&.Mui-focused': {
                color: '#2d4f4b',
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
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              size="small"
            />
          )}
          renderOption={(props, option, { selected }) => {
            const { key, ...otherProps } = props;
            return (
              <li key={key} {...otherProps}>
                <Checkbox checked={selected} sx={{ mr: 1, color: '#fbbf24' }} />
                {getShortName(option)}
              </li>
            );
          }}
        />
      ))}

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', ml: 'auto' }}>
        {showFullURI !== undefined && onFullURIChange && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" sx={{ fontSize: 14, color: '#2d4f4b', fontWeight: 500 }}>
              Full URIs
            </Typography>
            <Switch 
              checked={showFullURI} 
              onChange={e => onFullURIChange(e.target.checked)}
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
        )}

        <Chip
          label={`${filteredCount} / ${totalCount}`}
          size="small"
          sx={{
            bgcolor: 'rgba(251, 191, 36, 0.2)',
            color: '#f59e0b',
            borderColor: '#fbbf24',
            fontWeight: 600,
          }}
        />
      </Box>
    </Stack>
  )
}