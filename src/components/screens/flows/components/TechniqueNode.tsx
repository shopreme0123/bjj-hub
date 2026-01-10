'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface TechniqueNodeData {
  label: string;
  type?: string;
  isStartNode?: boolean;
  theme: any;
  techniqueId?: string;
}

function TechniqueNodeComponent({ data, selected }: NodeProps<TechniqueNodeData>) {
  const { theme, isStartNode, label, type } = data;

  return (
    <div
      className="rounded-xl px-4 py-3 shadow-sm transition-all min-w-[120px] max-w-[180px] text-center"
      style={{
        background: isStartNode ? theme.gradient : theme.card,
        border: selected ? `2px solid ${theme.primary}` : `1px solid ${theme.cardBorder}`,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: theme.primary,
          width: 10,
          height: 10,
          border: 'none'
        }}
      />
      <p
        className="text-sm font-medium truncate"
        style={{ color: isStartNode ? 'white' : theme.text }}
      >
        {label}
      </p>
      {type && (
        <span
          className="text-[10px] px-2 py-0.5 rounded mt-1 inline-block"
          style={{
            background: isStartNode ? 'rgba(255,255,255,0.2)' : `${theme.primary}20`,
            color: isStartNode ? 'white' : theme.primary
          }}
        >
          {type}
        </span>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: theme.primary,
          width: 10,
          height: 10,
          border: 'none'
        }}
      />
    </div>
  );
}

export const TechniqueNode = memo(TechniqueNodeComponent);
