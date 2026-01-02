'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/lib/context';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack = false, onBack, rightAction }: HeaderProps) {
  const { theme } = useApp();
  
  return (
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-1 -ml-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={24} style={{ color: theme.text }} />
          </button>
        )}
        <h1 className="font-semibold text-lg tracking-tight" style={{ color: theme.text }}>{title}</h1>
      </div>
      {rightAction}
    </div>
  );
}
