'use client';

import React from 'react';
import { useApp } from '@/lib/context';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className = '', onClick, style = {} }: CardProps) {
  const { theme } = useApp();

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-4 backdrop-blur-sm transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''
      } ${className}`}
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
