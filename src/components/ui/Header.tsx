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
    <div className="px-5 py-4 flex items-center justify-between relative z-10">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full transition-all hover:bg-white/20"
            style={{ background: 'rgba(255, 255, 255, 0.15)' }}
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
        )}
        <h1 className="font-semibold text-lg tracking-tight text-white">{title}</h1>
      </div>
      {rightAction}
    </div>
  );
}
