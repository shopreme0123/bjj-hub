'use client';

import React from 'react';
import { Home, BookOpen, GitBranch, Calendar, Users } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n';

type TabId = 'home' | 'techniques' | 'flows' | 'diary' | 'groups';

interface BottomNavProps {
  active: TabId;
  setActive: (tab: TabId) => void;
}

const navItems: { id: TabId; icon: typeof Home; labelKey: string }[] = [
  { id: 'home', icon: Home, labelKey: 'nav.home' },
  { id: 'techniques', icon: BookOpen, labelKey: 'nav.techniques' },
  { id: 'flows', icon: GitBranch, labelKey: 'nav.flows' },
  { id: 'diary', icon: Calendar, labelKey: 'nav.diary' },
  { id: 'groups', icon: Users, labelKey: 'nav.groups' },
];

export function BottomNav({ active, setActive }: BottomNavProps) {
  const { theme } = useApp();
  const { t } = useI18n();

  return (
    <div
      className="absolute bottom-0 left-0 right-0 border-t flex justify-around pt-3 pb-6 px-2 z-40"
      style={{
        background: theme.card,
        borderColor: theme.cardBorder,
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className="flex flex-col items-center gap-1 transition-all duration-300"
          style={{
            color: active === item.id ? theme.primary : theme.textMuted,
            transform: active === item.id ? 'scale(1.1)' : 'scale(1)',
          }}
        >
          <item.icon
            size={22}
            strokeWidth={active === item.id ? 2.5 : 1.5}
          />
          <span className="text-[10px] font-medium tracking-wide">{t(item.labelKey)}</span>
        </button>
      ))}
    </div>
  );
}

export type { TabId };
