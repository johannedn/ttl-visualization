import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, IconButton, Checkbox } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import type { Triple } from '../utils/ttlParser';
import { getShortName, isURI, getRDFValue } from '../utils/ttlParser';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { FilterBar } from './FilterBar';
import { useOntology } from '@context/OntologyContext';

const CATEGORY_COLORS = {
  subject: '#4CAF50',    // Grün
  predicate: '#FF9800',  // Orange
  object: '#2196F3',     // Blau
};

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

const GraphViewComponent: React.FC<GraphViewProps> = ({ triples }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {selectedTriples, toggleTriple} = useOntology();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [columnFilters, setColumnFilters] = useState({
    subject: searchParams.get('subject')?.split(',').filter(Boolean) || [] as string[],
    predicate: searchParams.get('predicate')?.split(',').filter(Boolean) || [] as string[],
    object: searchParams.get('object')?.split(',').filter(Boolean) || [] as string[],
  });
  
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

  const columnOptions = useMemo(() => {
    const filtered = triples.filter((t: any) => {
      const objectValue = getRDFValue(t.object);
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(t.subject)) return false
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(t.predicate)) return false
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(objectValue)) return false
      return true
    })

    return {
      subject: Array.from(new Set(filtered.map(t => t.subject))).sort().slice(0, 50),
      predicate: Array.from(new Set(filtered.map(t => t.predicate))).sort().slice(0, 50),
      object: Array.from(new Set(filtered.map(t => getRDFValue(t.object)))).sort().slice(0, 50),
    }
  }, [triples, columnFilters]);

  const filteredTriples = useMemo(() => {
    return triples.filter((t: any) => {
      const objectValue = getRDFValue(t.object);
      if (columnFilters.subject.length > 0 && !columnFilters.subject.includes(t.subject)) return false;
      if (columnFilters.predicate.length > 0 && !columnFilters.predicate.includes(t.predicate)) return false;
      if (columnFilters.object.length > 0 && !columnFilters.object.includes(objectValue)) return false;
      if (searchTerm && !t.subject.includes(searchTerm) && !t.predicate.includes(searchTerm) && !objectValue.includes(searchTerm)) return false;
      return true;
    });
  }, [triples, columnFilters, searchTerm]);

  const fullGraph = useMemo<GraphData>(() => {
    const nodeMap = new Map<string, Node>();
    const links: Link[] = [];

    filteredTriples.forEach((triple) => {
      if (!nodeMap.has(triple.subject)) {
        nodeMap.set(triple.subject, {
          id: triple.subject,
          name: getShortName(triple.subject),
          val: 1,
          category: 'subject',
          state: triple.subject === selectedEntity ? 'selected' : 'normal',
        });
      }

      if (!nodeMap.has(triple.predicate)) {
        nodeMap.set(triple.predicate, {
          id: triple.predicate,
          name: getShortName(triple.predicate),
          val: 1,
          category: 'predicate',
          state: triple.predicate === selectedEntity ? 'selected' : 'normal',
        });
      }

      const objectValue = getRDFValue(triple.object);
      if (isURI(objectValue)) {
        if (!nodeMap.has(objectValue)) {
          nodeMap.set(objectValue, {
            id: objectValue,
            name: getShortName(objectValue),
            val: 1,
            category: 'object',
            state: objectValue === selectedEntity ? 'selected' : 'normal',
          });
        }

        links.push({
          source: triple.subject,
          target: triple.predicate,
          label: 'uses',
        });
        links.push({
          source: triple.predicate,
          target: objectValue,
          label: 'points to',
        });
      } else {
        links.push({
          source: triple.subject,
          target: triple.predicate,
          label: 'has property',
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: links,
    };
  }, [filteredTriples, selectedEntity]);

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
      fgRef.current.centerAt(node.x, node.y, 600);
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

  const handleFullscreen = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (columnFilters.subject.length > 0) params.set('subject', columnFilters.subject.join(','))
    if (columnFilters.predicate.length > 0) params.set('predicate', columnFilters.predicate.join(','))
    if (columnFilters.object.length > 0) params.set('object', columnFilters.object.join(','))
    navigate(`/graph-fullscreen?${params.toString()}`)
  }

  useEffect(() => {
    if (fgRef.current) {
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400, 80);
        }
      }, 200);
    }
  }, []);

  const isTripleSelected = useCallback((triple: Triple) => {
    const objValue = getRDFValue(triple.object);
    return selectedTriples.some(t => {
      const tObjValue = getRDFValue(t.object);
      return t.subject === triple.subject && 
             t.predicate === triple.predicate && 
             tObjValue === objValue;
    });
  }, [selectedTriples]);

  return (
    <Box 
      sx={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        px: 3,
        position: 'relative',
        height: 'calc(100vh - 240px)',
        overflow: 'hidden',
      }}
    >
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        columnFilters={columnFilters}
        onColumnFiltersChange={setColumnFilters}
        columnOptions={columnOptions}
        filteredCount={displayGraph.nodes.length}
        totalCount={fullGraph.nodes.length}
      />

      <Box sx={{ display: 'flex', gap: 2, width: '100%', position: 'relative', flex: 1, minHeight: 0 }}>
        <Paper 
          elevation={0}
          sx={{ 
            flex: selectedEntity ? 1 : '1 1 auto',
            height: '100%',
            minHeight: 0,
            border: '2px solid #fbbf24',
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
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
            onEngineStop={() => {
              if (fgRef.current) {
                const simulation = (fgRef.current as any).d3Force();
                if (simulation) {
                  simulation
                    .force('charge').strength(-300)
                    .force('link').distance(80)
                    .force('center').strength(0.5)
                    .force('x').strength(0.1)
                    .force('y').strength(0.1);
                }
              }
            }}
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
          
          <IconButton
            onClick={handleFullscreen}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #fbbf24',
              '&:hover': {
                bgcolor: 'rgba(251, 191, 36, 0.1)',
              },
            }}
          >
            <FullscreenIcon sx={{ color: '#2d4f4b' }} />
          </IconButton>
          
          <Box
            sx={{
              position: 'absolute',
              top: 16,
              left: 16,
              p: 2,
              bgcolor: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid #fbbf24',
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              minWidth: 200,
            }}
          >
            <Box sx={{ fontSize: 12, fontWeight: 700, color: '#2d4f4b', mb: 0.5 }}>Legend</Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4CAF50', flexShrink: 0 }} />
              <Box sx={{ fontSize: 11, color: '#2d4f4b' }}>Subject</Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FF9800', flexShrink: 0 }} />
              <Box sx={{ fontSize: 11, color: '#2d4f4b' }}>Predicate</Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#2196F3', flexShrink: 0 }} />
              <Box sx={{ fontSize: 11, color: '#2d4f4b' }}>Object</Box>
            </Box>
          </Box>
        </Paper>

        {selectedEntity && (
          <Paper
            elevation={0}
            sx={{
              width: 450,
              minWidth: 320,
              maxWidth: 800,
              height: '100%',
              minHeight: 0,
              border: '2px solid #fbbf24',
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              resize: 'horizontal',
            }}
          >
            <Box sx={{ 
              position: 'relative',
              p: 2, 
              pb: 2,
              borderBottom: '2px solid #fbbf24',
              bgcolor: '#FFFFFF',
              flexShrink: 0,
            }}>
              <IconButton
                onClick={handleCloseCard}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  color: '#2d4f4b',
                  '&:hover': { bgcolor: 'rgba(251, 191, 36, 0.1)' },
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>

              <Box sx={{ fontSize: 16, fontWeight: 700, color: '#2d4f4b', pr: 4 }}>
                {getShortName(selectedEntity)}
              </Box>
            </Box>

            <Box sx={{ 
              overflowY: 'hidden', 
              p: 2,
              flex: 1,
              overflowX: 'hidden',
            }}>
              <Box sx={{ fontSize: 12, fontWeight: 600, color: '#2d4f4b', mb: 1 }}>As Subject:</Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                {filteredTriples
                  .filter(t => t.subject === selectedEntity)
                  .slice(0, 6)
                  .map((triple, idx) => {
                    const isSelected = isTripleSelected(triple);
                    return (
                      <Box 
                        key={idx} 
                        sx={{ 
                          fontSize: 11, 
                          color: '#555', 
                          bgcolor: isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.1)', // ✅ Highlight hvis selected
                          p: 1, 
                          borderRadius: 1, 
                          fontFamily: 'monospace',
                          border: isSelected ? '2px solid #fbbf24' : 'none', // ✅ Border hvis selected
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(251, 191, 36, 0.2)',
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTriple(triple); // ✅ Toggle selection
                        }}
                      >
                        <Checkbox 
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleTriple(triple)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            p: 0,
                            color: 'rgba(251, 191, 36, 0.6)',
                            '&.Mui-checked': {
                              color: '#f59e0b',
                            },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ fontWeight: 600, color: '#2d4f4b', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{getShortName(triple.predicate)}</Box>
                          <Box sx={{ color: '#666', mt: 0.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{getShortName(getRDFValue(triple.object))}</Box>
                        </Box>
                      </Box>
                    );
                  })}
                {filteredTriples.filter(t => t.subject === selectedEntity).length > 6 && (
                  <Box sx={{ fontSize: 10, color: '#999', mt: 1 }}>+{filteredTriples.filter(t => t.subject === selectedEntity).length - 6} more...</Box>
                )}
              </Box>

              <Box sx={{ fontSize: 12, fontWeight: 600, color: '#2d4f4b', mt: 2, mb: 1 }}>As Object:</Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredTriples
                  .filter(t => getRDFValue(t.object) === selectedEntity)
                  .slice(0, 6)
                  .map((triple, idx) => {
                    const isSelected = isTripleSelected(triple);
                    return (
                      <Box 
                        key={idx} 
                        sx={{ 
                          fontSize: 11, 
                          color: '#555', 
                          bgcolor: isSelected ? 'rgba(251, 191, 36, 0.3)' : 'rgba(251, 191, 36, 0.1)', // ✅ Highlight hvis selected
                          p: 1, 
                          borderRadius: 1, 
                          fontFamily: 'monospace',
                          border: isSelected ? '2px solid #fbbf24' : 'none', // ✅ Border hvis selected
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1,
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'rgba(251, 191, 36, 0.2)',
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTriple(triple); // ✅ Toggle selection
                        }}
                      >
                        <Checkbox 
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleTriple(triple)}
                          onClick={(e) => e.stopPropagation()}
                          sx={{
                            p: 0,
                            color: 'rgba(251, 191, 36, 0.6)',
                            '&.Mui-checked': {
                              color: '#f59e0b',
                            },
                          }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ fontWeight: 600, color: '#2d4f4b', wordBreak: 'break-word', overflowWrap: 'break-word' }}>{getShortName(triple.subject)}</Box>
                          <Box sx={{ color: '#999', mt: 0.5, wordBreak: 'break-word', overflowWrap: 'break-word' }}>{getShortName(triple.predicate)}</Box>
                        </Box>
                      </Box>
                    );
                  })}
                {filteredTriples.filter(t => getRDFValue(t.object) === selectedEntity).length > 6 && (
                  <Box sx={{ fontSize: 10, color: '#999', mt: 1 }}>+{filteredTriples.filter(t => getRDFValue(t.object) === selectedEntity).length - 6} more...</Box>
                )}
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      <Box sx={{ color: 'rgba(45, 79, 75, 0.7)', fontSize: 12 }}>
        {selectedEntity 
          ? `Showing connections for: ${getShortName(selectedEntity)} (${displayGraph.nodes.length} nodes, ${displayGraph.links.length} connections)`
          : `Total: ${fullGraph.nodes.length} nodes, ${fullGraph.links.length} connections`
        }
      </Box>
    </Box>
  );
};

export const GraphView = React.memo(GraphViewComponent);