// src/components/GraphView.tsx
import React, { useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { Triple } from '../utils/ttlParser';

interface Node {
  id: string;
  name: string;
  val: number;
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

export const GraphView: React.FC<GraphViewProps> = ({ triples }) => {
  const graphData = useMemo<GraphData>(() => {
    const nodeMap = new Map<string, Node>();
    const links: Link[] = [];

    triples.forEach((triple) => {
      // Legg til subject node
      if (!nodeMap.has(triple.subject)) {
        nodeMap.set(triple.subject, {
          id: triple.subject,
          name: getShortName(triple.subject),
          val: 1,
        });
      } else {
        const node = nodeMap.get(triple.subject)!;
        node.val += 1;
      }

      // Legg til object node (hvis det er en URI)
      if (isURI(triple.object)) {
        if (!nodeMap.has(triple.object)) {
          nodeMap.set(triple.object, {
            id: triple.object,
            name: getShortName(triple.object),
            val: 1,
          });
        } else {
          const node = nodeMap.get(triple.object)!;
          node.val += 1;
        }

        // Legg til link
        links.push({
          source: triple.subject,
          target: triple.object,
          label: getShortName(triple.predicate),
        });
      }
    });

    return {
      nodes: Array.from(nodeMap.values()),
      links: links,
    };
  }, [triples]);

  return (
    <div style={{ width: '100%', height: '600px', border: '1px solid #ccc' }}>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="name"
        nodeAutoColorBy="id"
        linkLabel="label"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Tegn node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val * 2, 0, 2 * Math.PI);
          ctx.fillStyle = node.color || '#69b3a2';
          ctx.fill();
          
          // Tegn label
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#333';
          ctx.fillText(label, node.x, node.y + node.val * 2 + 10);
        }}
        onNodeClick={(node: any) => {
          console.log('Node clicked:', node);
        }}
      />
    </div>
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