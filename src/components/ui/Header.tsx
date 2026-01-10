'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/lib/context';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'transparent';
  maxTitleLength?: number;
  onTitleClick?: () => void;
}

export function Header({
  title,
  showBack = false,
  onBack,
  rightAction,
  variant = 'default',
  maxTitleLength,
  onTitleClick,
}: HeaderProps) {
  const { theme } = useApp();

  const isTransparent = variant === 'transparent';

  // タイトルを指定文字数で切り詰め
  const displayTitle = maxTitleLength && title.length > maxTitleLength
    ? `${title.slice(0, maxTitleLength)}...`
    : title;

  return (
    <div
      className="px-5 py-3 flex items-center gap-3 sticky top-0 z-20"
      style={{
        background: isTransparent ? 'transparent' : theme.card,
        borderBottom: isTransparent ? 'none' : `1px solid ${theme.cardBorder}`,
      }}
    >
      {showBack && (
        <button
          onClick={onBack}
          className="p-1.5 rounded-full transition-all flex-shrink-0"
          style={{
            background: isTransparent ? 'rgba(255, 255, 255, 0.2)' : `${theme.primary}10`,
          }}
        >
          <ChevronLeft
            size={20}
            style={{ color: isTransparent ? 'white' : theme.primary }}
          />
        </button>
      )}
      <h1
        className={`font-bold text-lg tracking-tight flex-1 min-w-0 truncate ${onTitleClick ? 'cursor-pointer hover:opacity-80' : ''}`}
        style={{ color: isTransparent ? 'white' : theme.text }}
        onClick={onTitleClick}
        title={title}
      >
        {displayTitle}
      </h1>
      {rightAction && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {rightAction}
        </div>
      )}
    </div>
  );
}

// アイコンボタンコンポーネント
interface IconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'transparent';
}

export function IconButton({ icon, onClick, variant = 'default' }: IconButtonProps) {
  const { theme } = useApp();

  return (
    <button
      onClick={onClick}
      className="p-2 rounded-xl transition-all active:scale-95"
      style={{
        background: variant === 'transparent' ? 'rgba(255,255,255,0.2)' : `${theme.primary}10`,
        color: variant === 'transparent' ? 'white' : theme.primary,
      }}
    >
      {icon}
    </button>
  );
}
