'use client';

import React, { memo } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer } from 'reactflow';

interface LabeledEdgeData {
  label?: string;
  theme: any;
  onLabelClick?: () => void;
}

function LabeledEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected
}: EdgeProps<LabeledEdgeData>) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const theme = data?.theme;

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: selected ? theme?.primary : theme?.textMuted,
          strokeWidth: selected ? 3 : 2,
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrowhead)"
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data?.onLabelClick?.();
            }}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              background: theme?.card,
              border: `1px solid ${selected ? theme?.primary : theme?.cardBorder}`,
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '11px',
              color: theme?.textSecondary,
            }}
            className="nodrag nopan hover:scale-105 transition-transform"
          >
            {data.label}
          </button>
        </EdgeLabelRenderer>
      )}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={theme?.textMuted}
          />
        </marker>
      </defs>
    </>
  );
}

export const LabeledEdge = memo(LabeledEdgeComponent);
