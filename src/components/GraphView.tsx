import React, { useEffect, useRef } from 'react';
import type { Triple } from '../utils/ttlParser';

interface GraphViewProps {
  triples: Triple[];
}

export const GraphView: React.FC<GraphViewProps> = ({ triples }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Enkel visualisering - du kan forbedre denne
    const nodes = new Set<string>();
    triples.forEach(t => {
      nodes.add(t.subject);
      nodes.add(t.object);
    });

    // Her kan du implementere mer avansert graf-tegning
  }, [triples]);

  return (
    <svg ref={svgRef} width="800" height="600" style={{ border: '1px solid #ccc' }}>
      {/* Graf-elementer vil bli lagt til her */}
    </svg>
  );
};