// src/components/GraphViewV2.tsx
import React, { useMemo, useState } from 'react';
import { Box, Paper, TextField, Autocomplete, Stack, Checkbox, Button } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ForceGraph2D from 'react-force-graph-2d';

// Farben für die Kategorien
const CATEGORY_COLORS = {
  subject: '#4CAF50',    // Grün
  predicate: '#FF9800',  // Orange
  object: '#2196F3',     // Blau
};
import type { Triple } from '../utils/ttlParser';

interface Node {
  id: string;
  name: string;
  val: number;
  category?: 'subject' | 'predicate' | 'object';
  state?: 'normal' | 'selected';
}

interface Link {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface GraphViewProps {
  triples: Triple[];
}

export const GraphViewV2: React.FC<GraphViewProps> = ({ triples }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    subject: [] as string[],
    predicate: [] as string[],
    object: [] as string[],
  });

  // Navigation States
  const [navLevel, setNavLevel] = useState<0 | 1 | 2>(0); // 0 = Categories, 1 = Entities, 2 = Connections
  const [selectedCategory, setSelectedCategory] = useState<'subject' | 'predicate' | 'object' | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // Column Options für Filter - mit kurzen Namen
  const columnOptions = useMemo(() => {
    const filtered = triples.filter((t: any) => {
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(t.subject)) return false
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(t.predicate)) return false
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(t.object)) return false
      return true
    })

    return {
      subject: Array.from(new Set(filtered.map(t => t.subject))).sort().slice(0, 50),
      predicate: Array.from(new Set(filtered.map(t => t.predicate))).sort().slice(0, 50),
      object: Array.from(new Set(filtered.map(t => t.object))).sort().slice(0, 50),
    }
  }, [triples, columnFilters]);

  // Filter-Logik
  const filteredTriples = useMemo(() => {
    return triples.filter((t: any) => {
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(t.subject)) return false
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(t.predicate)) return false
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(t.object)) return false
      if (searchTerm && !t.subject.includes(searchTerm) && !t.predicate.includes(searchTerm) && !t.object.includes(searchTerm)) return false
      return true
    })
  }, [triples, columnFilters, searchTerm]);

  // Berechne für Level 0: Category Counts
  const categoryCounts = useMemo(() => {
    const subjects = new Set<string>();
    const predicates = new Set<string>();
    const objects = new Set<string>();

    filteredTriples.forEach((t: any) => {
      subjects.add(t.subject);
      predicates.add(t.predicate);
      if (isURI(t.object)) {
        objects.add(t.object);
      }
    });

    return {
      subject: subjects.size,
      predicate: predicates.size,
      object: objects.size,
    };
  }, [filteredTriples]);

  // Berechne für Level 1: Alle Entities einer Kategorie
  const categoryEntities = useMemo(() => {
    if (!selectedCategory) return [];

    const entities = new Set<string>();
    filteredTriples.forEach((t: any) => {
      if (selectedCategory === 'subject') {
        entities.add(t.subject);
      } else if (selectedCategory === 'predicate') {
        entities.add(t.predicate);
      } else if (selectedCategory === 'object' && isURI(t.object)) {
        entities.add(t.object);
      }
    });

    return Array.from(entities)
      .filter(e => searchTerm === '' || getShortName(e).toLowerCase().includes(searchTerm.toLowerCase()))
      .sort();
  }, [selectedCategory, filteredTriples, searchTerm]);

  // Berechne für Level 2: Graph mit einer Entity und ihren Verbindungen
  const entityConnectionsGraph = useMemo<GraphData>(() => {
    if (!selectedEntity || !selectedCategory) return { nodes: [], links: [] };

    const nodeMap = new Map<string, Node>();
    const links: Link[] = [];

    filteredTriples.forEach((triple) => {
      if (selectedCategory === 'subject' && triple.subject === selectedEntity) {
        // Subject Entity → zeige ihre Prädikate und Objekte
        addNodeToMap(nodeMap, selectedEntity, 'subject', 'selected');
        addNodeToMap(nodeMap, triple.predicate, 'predicate');
        
        if (isURI(triple.object)) {
          addNodeToMap(nodeMap, triple.object, 'object');
          links.push({
            source: selectedEntity,
            target: triple.predicate,
            label: 'predicate',
          });
          links.push({
            source: triple.predicate,
            target: triple.object,
            label: 'has object',
          });
        }
      } else if (selectedCategory === 'predicate' && triple.predicate === selectedEntity) {
        // Predicate Entity → zeige Subject und Object
        addNodeToMap(nodeMap, triple.subject, 'subject');
        addNodeToMap(nodeMap, selectedEntity, 'predicate', 'selected');
        
        if (isURI(triple.object)) {
          addNodeToMap(nodeMap, triple.object, 'object');
        }
        
        links.push({
          source: triple.subject,
          target: selectedEntity,
          label: 'uses',
        });
        
        if (isURI(triple.object)) {
          links.push({
            source: selectedEntity,
            target: triple.object,
            label: 'connects to',
          });
        }
      } else if (selectedCategory === 'object' && triple.object === selectedEntity && isURI(triple.object)) {
        // Object Entity → zeige Subject und Predicate
        addNodeToMap(nodeMap, triple.subject, 'subject');
        addNodeToMap(nodeMap, triple.predicate, 'predicate');
        addNodeToMap(nodeMap, selectedEntity, 'object', 'selected');
        
        links.push({
          source: triple.subject,
          target: triple.predicate,
          label: 'has',
        });
        links.push({
          source: triple.predicate,
          target: selectedEntity,
          label: 'leads to',
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: links,
    };
  }, [selectedEntity, selectedCategory, filteredTriples]);

  return (
    <Box 
      sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        px: 3,
        position: 'relative',
      }}
    >
      {/* Filter Bar */}
      <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ display: 'flex', flexWrap: 'wrap' }}>
        {navLevel > 0 && (
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              if (navLevel === 2) {
                setNavLevel(1);
                setSelectedEntity(null);
              } else if (navLevel === 1) {
                setNavLevel(0);
                setSelectedCategory(null);
              }
            }}
            sx={{ color: '#2d4f4b', fontWeight: 600 }}
          >
            Back
          </Button>
        )}

        {/* Search Box */}
        {(navLevel > 0 || true) && (
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
        )}

        {/* Column Filters - auf allen levels */}
        {(['subject', 'predicate', 'object'] as const).map(key => (
          <Autocomplete
            key={key}
            multiple
            size="small"
            options={columnOptions[key]}
            value={columnFilters[key]}
            onChange={(_, value) =>
              setColumnFilters(prev => ({
                ...prev,
                [key]: value,
              }))
            }
            getOptionLabel={(option) => getShortName(option)}
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
            renderOption={(props, option, { selected }) => (
              <li {...props}>
                <Checkbox checked={selected} sx={{ mr: 1, color: '#fbbf24' }} />
                {getShortName(option)}
              </li>
            )}
          />
        ))}
      </Stack>

      {/* Level 0: Category Bubbles */}
      {navLevel === 0 && (
        <Paper 
          elevation={0}
          sx={{ 
            width: '100%',
            height: 'calc(100vh - 340px)',
            border: '2px solid #fbbf24',
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          {(['subject', 'predicate', 'object'] as const).map(category => (
            <Box
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setNavLevel(1);
              }}
              sx={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: CATEGORY_COLORS[category],
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: `0 8px 20px ${CATEGORY_COLORS[category]}80`,
                },
              }}
            >
              <Box sx={{ fontSize: 32, fontWeight: 700, color: '#FFFFFF' }}>
                {categoryCounts[category]}
              </Box>
              <Box sx={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', mt: 1 }}>
                {category.toUpperCase()}
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {/* Level 1: Entities as Bubbles */}
      {navLevel === 1 && selectedCategory && (
        <Paper 
          elevation={0}
          sx={{ 
            width: '100%',
            height: 'calc(100vh - 340px)',
            border: '2px solid #fbbf24',
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'auto',
            p: 4,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignContent: 'flex-start',
          }}
        >
          {categoryEntities.map(entity => (
            <Box
              key={entity}
              onClick={() => {
                setSelectedEntity(entity);
                setNavLevel(2);
              }}
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                bgcolor: CATEGORY_COLORS[selectedCategory],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                p: 2,
                textAlign: 'center',
                '&:hover': {
                  transform: 'scale(1.15)',
                  boxShadow: `0 8px 20px ${CATEGORY_COLORS[selectedCategory]}80`,
                },
              }}
            >
              <Box sx={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF', wordBreak: 'break-word' }}>
                {getShortName(entity)}
              </Box>
            </Box>
          ))}
        </Paper>
      )}

      {/* Level 2: Entity Connections Graph + Card */}
      {navLevel === 2 && selectedEntity && (
        <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
          {/* Graph */}
          <Paper 
            elevation={0}
            sx={{ 
              flex: 1,
              height: 'calc(100vh - 340px)',
              border: '2px solid #fbbf24',
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              overflow: 'hidden',
            }}
          >
            <ForceGraph2D
              graphData={entityConnectionsGraph}
              nodeLabel="name"
              linkLabel="label"
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Sans-Serif`;
                
                const nodeSize = node.state === 'selected' ? 12 : 8;
                
                // Node zeichnen mit Kategorie-Farbe
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
                ctx.fillStyle = node.category ? CATEGORY_COLORS[node.category] : '#999';
                ctx.fill();
                
                if (hoveredNode === node.id) {
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, nodeSize + 3, 0, 2 * Math.PI);
                  ctx.strokeStyle = '#fbbf24';
                  ctx.lineWidth = 2 / globalScale;
                  ctx.stroke();
                }
                
                // Label
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#2d4f4b';
                ctx.font = `bold ${fontSize}px Sans-Serif`;
                ctx.fillText(label, node.x, node.y + nodeSize + 12);
              }}
              onNodeHover={(node: any) => {
                setHoveredNode(node ? node.id : null);
              }}
            />
          </Paper>

          {/* Entity Card */}
          <Paper
            elevation={0}
            sx={{
              width: 320,
              height: 'calc(100vh - 340px)',
              border: '2px solid #fbbf24',
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              p: 2,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ fontSize: 16, fontWeight: 700, color: '#2d4f4b', mb: 2, pb: 2, borderBottom: '2px solid #fbbf24' }}>
              {getShortName(selectedEntity)}
            </Box>
            
            <Box sx={{ fontSize: 12, fontWeight: 600, color: '#2d4f4b', mt: 2, mb: 1 }}>Als Subject:</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
              {filteredTriples
                .filter(t => t.subject === selectedEntity)
                .slice(0, 10)
                .map((triple, idx) => (
                  <Box key={idx} sx={{ fontSize: 11, color: '#555', bgcolor: 'rgba(251, 191, 36, 0.1)', p: 1, borderRadius: 1, fontFamily: 'monospace' }}>
                    <Box sx={{ fontWeight: 600, color: '#2d4f4b' }}>{getShortName(triple.predicate)}</Box>
                    <Box sx={{ color: '#666', mt: 0.5 }}>{getShortName(triple.object)}</Box>
                  </Box>
                ))}
              {filteredTriples.filter(t => t.subject === selectedEntity).length > 10 && (
                <Box sx={{ fontSize: 10, color: '#999', mt: 1 }}>+{filteredTriples.filter(t => t.subject === selectedEntity).length - 10} more...</Box>
              )}
            </Box>

            <Box sx={{ fontSize: 12, fontWeight: 600, color: '#2d4f4b', mt: 2, mb: 1 }}>Als Object:</Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {filteredTriples
                .filter(t => t.object === selectedEntity)
                .slice(0, 10)
                .map((triple, idx) => (
                  <Box key={idx} sx={{ fontSize: 11, color: '#555', bgcolor: 'rgba(251, 191, 36, 0.1)', p: 1, borderRadius: 1, fontFamily: 'monospace' }}>
                    <Box sx={{ fontWeight: 600, color: '#2d4f4b' }}>{getShortName(triple.subject)}</Box>
                    <Box sx={{ color: '#999', mt: 0.5 }}>{getShortName(triple.predicate)}</Box>
                  </Box>
                ))}
              {filteredTriples.filter(t => t.object === selectedEntity).length > 10 && (
                <Box sx={{ fontSize: 10, color: '#999', mt: 1 }}>+{filteredTriples.filter(t => t.object === selectedEntity).length - 10} more...</Box>
              )}
            </Box>
          </Paper>
        </Box>
      )}

      {/* Info */}
      <Box sx={{ color: 'rgba(45, 79, 75, 0.7)', fontSize: 12 }}>
        {navLevel === 0 && `Total: ${categoryCounts.subject + categoryCounts.predicate + categoryCounts.object} items`}
        {navLevel === 1 && `Showing ${categoryEntities.length} ${selectedCategory} entities`}
        {navLevel === 2 && `Showing connections for: ${getShortName(selectedEntity)}`}
      </Box>

      {/* Fixed Legend - Bottom Right (Only on Level 0 and 1) */}
      {navLevel < 2 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 34,
            right: 24,
            p: 3,
            bgcolor: '#FFFFFF',
            border: '2px solid #fbbf24',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minWidth: 240,
          }}
        >
          <Box sx={{ fontSize: 14, fontWeight: 700, color: '#2d4f4b', mb: 1 }}>Legend</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4CAF50', flexShrink: 0 }} />
            <Box sx={{ fontSize: 13, color: '#2d4f4b' }}>Subject (Entities)</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FF9800', flexShrink: 0 }} />
            <Box sx={{ fontSize: 13, color: '#2d4f4b' }}>Predicate (Properties)</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#2196F3', flexShrink: 0 }} />
            <Box sx={{ fontSize: 13, color: '#2d4f4b' }}>Object (Values)</Box>
          </Box>
        </Box>
      )}

      {/* Legend - Top Left (Only on Level 2) */}
      {navLevel === 2 && (
        <Box
          sx={{
            position: 'absolute',
            top: 56,
            left: 24,
            p: 3,
            bgcolor: '#FFFFFF',
            border: '2px solid #fbbf24',
            borderRadius: 3,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            minWidth: 240,
          }}
        >
          <Box sx={{ fontSize: 14, fontWeight: 700, color: '#2d4f4b', mb: 1 }}>Legend</Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#4CAF50', flexShrink: 0 }} />
            <Box sx={{ fontSize: 13, color: '#2d4f4b' }}>Subject (Entities)</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#FF9800', flexShrink: 0 }} />
            <Box sx={{ fontSize: 13, color: '#2d4f4b' }}>Predicate (Properties)</Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: '#2196F3', flexShrink: 0 }} />
            <Box sx={{ fontSize: 13, color: '#2d4f4b' }}>Object (Values)</Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

// Hjelpefunksjoner
const isURI = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('urn:');
};

const getShortName = (uri: string): string => {
  if (isURI(uri)) {
    const parts = uri.split(/[/#]/);
    return parts[parts.length - 1] || uri;
  }
  return uri;
};

const addNodeToMap = (
  nodeMap: Map<string, Node>,
  id: string,
  category: 'subject' | 'predicate' | 'object' | string,
  state: 'normal' | 'selected' = 'normal'
) => {
  if (!nodeMap.has(id)) {
    nodeMap.set(id, {
      id,
      name: getShortName(id),
      val: 1,
      category: category as 'subject' | 'predicate' | 'object',
      state,
    });
  }
};
