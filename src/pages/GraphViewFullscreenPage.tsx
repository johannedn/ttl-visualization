import { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Box, TextField, Autocomplete, IconButton, Paper } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d'
import { usePageTitle } from '@context/PageContext'
import type { Triple } from '../utils/ttlParser'

// Farben für die Kategorien
const CATEGORY_COLORS = {
  subject: '#4CAF50',
  predicate: '#FF9800',
  object: '#2196F3',
}

interface Node {
  id: string
  name: string
  category: 'subject' | 'predicate' | 'object'
  state?: 'selected'
}

interface Link {
  source: string | Node
  target: string | Node
  label?: string
}

interface GraphData {
  nodes: Node[]
  links: Link[]
}

interface GraphViewFullscreenPageProps {
  triples: Triple[]
}

export function GraphViewFullscreenPage({ triples }: GraphViewFullscreenPageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setTitle } = usePageTitle()
  
  // Titel entfernen für Fullscreen
  useEffect(() => {
    setTitle('')
    return () => setTitle('Ontology Graph Visualization')
  }, [setTitle])
  
  // States initialisieren aus URL-Parametern
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null)
  const [columnFilters, setColumnFilters] = useState({
    subject: searchParams.get('subject')?.split(',').filter(Boolean) || [] as string[],
    predicate: searchParams.get('predicate')?.split(',').filter(Boolean) || [] as string[],
    object: searchParams.get('object')?.split(',').filter(Boolean) || [] as string[],
  })
  
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined)
  const graphContainerRef = useRef<HTMLDivElement | null>(null)

  // Column Options für Filter
  const columnOptions = useMemo(() => {
    const filtered = triples.filter((t: any) => {
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(t.subject)) return false
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(t.predicate)) return false
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(t.object)) return false
      return true
    })

    return {
      subject: Array.from(new Set(filtered.map((t: any) => t.subject))).sort(),
      predicate: Array.from(new Set(filtered.map((t: any) => t.predicate))).sort(),
      object: Array.from(new Set(filtered.map((t: any) => t.object))).sort(),
    }
  }, [triples, columnFilters])

  // Gefilterte Triples
  const filteredTriples = useMemo(() => {
    return triples.filter((triple: any) => {
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        const subjectMatch = triple.subject.toLowerCase().includes(search)
        const predicateMatch = triple.predicate.toLowerCase().includes(search)
        const objectMatch = triple.object.toLowerCase().includes(search)
        if (!subjectMatch && !predicateMatch && !objectMatch) return false
      }
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(triple.subject)) return false
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(triple.predicate)) return false
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(triple.object)) return false
      return true
    })
  }, [triples, searchTerm, columnFilters])

  // Full Graph
  const fullGraph = useMemo<GraphData>(() => {
    const nodeMap = new Map<string, Node>();
    const links: Link[] = [];

    filteredTriples.forEach((triple: any) => {
      if (!nodeMap.has(triple.subject)) {
        nodeMap.set(triple.subject, {
          id: triple.subject,
          name: getShortName(triple.subject),
          category: 'subject',
          state: triple.subject === selectedEntity ? 'selected' : undefined,
        });
      }

      if (!nodeMap.has(triple.predicate)) {
        nodeMap.set(triple.predicate, {
          id: triple.predicate,
          name: getShortName(triple.predicate),
          category: 'predicate',
          state: triple.predicate === selectedEntity ? 'selected' : undefined,
        });
      }

      links.push({
        source: triple.subject,
        target: triple.predicate,
        label: 'has',
      });

      if (isURI(triple.object)) {
        if (!nodeMap.has(triple.object)) {
          nodeMap.set(triple.object, {
            id: triple.object,
            name: getShortName(triple.object),
            category: 'object',
            state: triple.object === selectedEntity ? 'selected' : undefined,
          });
        }

        // Predicate → Object Link
        links.push({
          source: triple.predicate,
          target: triple.object,
          label: 'pointsTo',
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: links,
    };
  }, [filteredTriples, selectedEntity]);

  // Display Graph mit Filter
  const displayGraph = useMemo<GraphData>(() => {
    if (!selectedEntity) {
      return fullGraph;
    }

    const connectedNodeIds = new Set<string>();
    connectedNodeIds.add(selectedEntity);

    fullGraph.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;

      if (sourceId === selectedEntity) {
        connectedNodeIds.add(targetId);
      }
      if (targetId === selectedEntity) {
        connectedNodeIds.add(sourceId);
      }
    });

    const filteredNodes = fullGraph.nodes.filter(node => connectedNodeIds.has(node.id));
    const filteredLinks = fullGraph.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? (link.source as any).id : link.source;
      const targetId = typeof link.target === 'object' ? (link.target as any).id : link.target;
      return connectedNodeIds.has(sourceId) && connectedNodeIds.has(targetId);
    });

    return {
      nodes: filteredNodes,
      links: filteredLinks,
    };
  }, [fullGraph, selectedEntity]);

  const handleNodeClick = useCallback((node: any) => {
    setSelectedEntity(node.id);
    
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.centerAt(node.x, node.y, 600);
      fgRef.current.zoom(currentZoom, 0);
    }
  }, []);

  useEffect(() => {
    if (!selectedEntity || !fgRef.current) return;

    const timeout = setTimeout(() => {
      if (!fgRef.current) return;
      const node = displayGraph.nodes.find(n => n.id === selectedEntity) as any;
      if (!node) return;

      const currentZoom = fgRef.current.zoom();
      const containerWidth = graphContainerRef.current?.getBoundingClientRect().width ?? 0;
      const overlayWidth = 360;
      const offset = Math.min(overlayWidth, containerWidth * 0.3);
      const offsetInGraph = offset / currentZoom;

      fgRef.current.centerAt(node.x - offsetInGraph, node.y, 600);
      fgRef.current.zoom(currentZoom, 0);
    }, 200);

    return () => clearTimeout(timeout);
  }, [selectedEntity, displayGraph]);

  const handleCloseCard = useCallback(() => {
    setSelectedEntity(null);
    
    if (fgRef.current) {
      fgRef.current.zoomToFit(1000, 50);
    }
  }, []);

  const handleClose = () => {
    navigate('/graph');
  };

  // Zentriere und passe Graph beim Laden an
  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 80);
        }
      }, 200);
    }
  }, []);

  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#FFFFFF' }}>
      {/* Main Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Filter Bar */}
        <Box sx={{ 
          p: 2, 
          bgcolor: '#FFFFFF',
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
            <TextField
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search…"
              size="small"
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  color: '#2d4f4b',
                  bgcolor: '#FFFFFF',
                  '& fieldset': { borderColor: 'rgba(45, 79, 75, 0.3)' },
                  '&:hover fieldset': { borderColor: 'rgba(45, 79, 75, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#fbbf24' },
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
                  setColumnFilters(prev => ({
                    ...prev,
                    [key]: value,
                  }))
                }
                getOptionLabel={(option) => getShortName(option)}
                filterSelectedOptions
                sx={{ 
                  minWidth: 140,
                  maxWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    color: '#2d4f4b',
                    bgcolor: '#FFFFFF',
                    '& fieldset': { borderColor: 'rgba(45, 79, 75, 0.3)' },
                    '&:hover fieldset': { borderColor: 'rgba(45, 79, 75, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#fbbf24' },
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    placeholder={`Filter ${key}s`}
                  />
                )}
              />
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Legend */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {Object.entries(CATEGORY_COLORS).map(([key, color]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color }} />
                  <Box sx={{ fontSize: 12, color: '#2d4f4b', textTransform: 'capitalize' }}>{key}</Box>
                </Box>
              ))}
            </Box>

            <IconButton 
              onClick={handleClose}
              size="small"
              sx={{ color: '#2d4f4b' }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Graph Canvas */}
        <Box
          ref={graphContainerRef}
          sx={{ 
          flex: 1, 
          position: 'relative', 
          bgcolor: '#FFFFFF',
        }}>
          <ForceGraph2D
            ref={fgRef}
            graphData={displayGraph}
            nodeLabel="name"
            linkLabel="label"
            nodeRelSize={4}
            linkWidth={1}
            linkDirectionalParticles={0}
            d3AlphaDecay={0.02}
            d3VelocityDecay={0.3}
            cooldownTicks={0}
            enableNodeDrag={false}
            d3Force={(simulation: any) => {
              simulation
                .force('charge').strength(-300)
                .force('link').distance(80)
                .force('center').strength(0.5)
                .force('x').strength(0.1)
                .force('y').strength(0.1);
            }}
            onEngineStop={() => {}}
            nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
              const label = node.name;
              const fontSize = 10 / globalScale;
              const nodeSize = node.state === 'selected' ? 6 : 3;
              
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI);
              ctx.fillStyle = node.category ? CATEGORY_COLORS[node.category as keyof typeof CATEGORY_COLORS] : '#999';
              ctx.fill();
              
              if (node.state === 'selected') {
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize + 3, 0, 2 * Math.PI);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 3 / globalScale;
                ctx.stroke();
              }
              
              if (hoveredNode === node.id) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, nodeSize + 2, 0, 2 * Math.PI);
                ctx.strokeStyle = '#2d4f4b';
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }
              
              if (globalScale > 2) {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#2d4f4b';
                ctx.font = `bold ${fontSize}px Sans-Serif`;
                ctx.fillText(label, node.x, node.y + nodeSize + 8);
              }
            }}
            onNodeHover={(node: any) => setHoveredNode(node ? node.id : null)}
            onNodeClick={handleNodeClick}
          />

          {/* Entity Card - erscheint beim Klick */}
          {selectedEntity && (
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 350,
                maxHeight: 'calc(100vh - 180px)',
                bgcolor: '#FFFFFF',
                border: '2px solid #fbbf24',
                borderRadius: 2,
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Fixed Header */}
              <Box sx={{ 
                position: 'relative',
                p: 3, 
                pb: 2,
                borderBottom: '2px solid #fbbf24',
                bgcolor: '#FFFFFF',
                flexShrink: 0,
              }}>
                <IconButton
                  onClick={handleCloseCard}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    color: '#2d4f4b',
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>

                <Box sx={{ fontSize: 16, fontWeight: 700, color: '#2d4f4b', pr: 4 }}>
                  {getShortName(selectedEntity)}
                </Box>
              </Box>

              {/* Scrollable Content */}
              <Box sx={{ 
                overflowY: 'auto', 
                p: 3,
                flex: 1,
              }}>
                <Box sx={{ fontSize: 12, fontWeight: 600, color: '#2d4f4b', mb: 1 }}>Als Subject:</Box>
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
              </Box>
            </Paper>
          )}

          {/* Info Box */}
          <Box sx={{ 
            position: 'absolute', 
            bottom: 20, 
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'rgba(45, 79, 75, 0.7)', 
            fontSize: 12, 
            bgcolor: 'rgba(255, 255, 255, 0.9)', 
            p: 1.5,
            borderRadius: 1,
            border: '1px solid rgba(45, 79, 75, 0.2)',
          }}>
            {selectedEntity 
              ? `Showing connections for: ${getShortName(selectedEntity)} (${displayGraph.nodes.length} nodes, ${displayGraph.links.length} connections)`
              : `Total: ${fullGraph.nodes.length} nodes, ${fullGraph.links.length} connections`
            }
          </Box>
        </Box>

      </Box>
    </Box>
  );
}

// Helper functions
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
