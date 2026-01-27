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
      className={`rounded-2xl p-4 transition-all duration-300 shadow-sm ${
        onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.98]' : ''
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
