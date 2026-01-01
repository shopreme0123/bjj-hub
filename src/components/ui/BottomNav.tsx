'use client';

import React from 'react';
import { Home, BookOpen, GitBranch, Calendar, Users } from 'lucide-react';
import { useApp } from '@/lib/context';

type TabId = 'home' | 'techniques' | 'flows' | 'diary' | 'groups';

interface BottomNavProps {
  active: TabId;
  setActive: (tab: TabId) => void;
}

const navItems: { id: TabId; icon: typeof Home; label: string }[] = [
  { id: 'home', icon: Home, label: 'ホーム' },
  { id: 'techniques', icon: BookOpen, label: '技' },
  { id: 'flows', icon: GitBranch, label: 'フロー' },
  { id: 'diary', icon: Calendar, label: '日記' },
  { id: 'groups', icon: Users, label: 'グループ' },
];

export function BottomNav({ active, setActive }: BottomNavProps) {
  const { theme } = useApp();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 backdrop-blur-xl border-t flex justify-around py-3 px-2 z-40"
      style={{
        background: `linear-gradient(to top, ${theme.bg}, transparent)`,
        borderColor: theme.cardBorder,
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className="flex flex-col items-center gap-1 transition-all duration-300"
          style={{
            color: active === item.id ? theme.primary : 'rgba(255,255,255,0.4)',
            transform: active === item.id ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <item.icon
            size={22}
            strokeWidth={active === item.id ? 2.5 : 1.5}
          />
          <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export type { TabId };
