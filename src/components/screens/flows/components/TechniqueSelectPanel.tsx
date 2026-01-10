'use client';

import React, { useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import { Technique, TechniqueType } from '@/types';
import { useI18n } from '@/lib/i18n';

interface TechniqueSelectPanelProps {
  theme: any;
  techniques: Technique[];
  onSelect: (technique: Technique | { name: string; type: string }) => void;
  onClose: () => void;
}

export function TechniqueSelectPanel({ theme, techniques, onSelect, onClose }: TechniqueSelectPanelProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');

  // 技の種類の翻訳を取得
  const getTechniqueTypeLabel = (type: TechniqueType): string => {
    return t(`techniques.type.${type}`);
  };

  const filteredTechniques = techniques.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.name_en?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddCustom = () => {
    if (!customName.trim()) return;
    onSelect({
      name: customName.trim(),
      type: 'custom',
    });
    setCustomName('');
    setShowCustomForm(false);
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-4 shadow-2xl animate-slide-up z-20"
      style={{ background: theme.bg, maxHeight: '60vh' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: theme.text }}>技を選択</h3>
        <button onClick={onClose}>
          <X size={24} style={{ color: theme.textSecondary }} />
        </button>
      </div>

      {/* 検索バー */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: theme.textMuted }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="技を検索..."
          className="w-full rounded-lg py-2 px-9 outline-none border text-sm"
          style={{
            background: theme.card,
            color: theme.text,
            borderColor: theme.cardBorder,
          }}
        />
      </div>

      {/* 技一覧 */}
      <div className="overflow-auto" style={{ maxHeight: 'calc(60vh - 140px)' }}>
        {filteredTechniques.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {filteredTechniques.map((tech) => (
              <button
                key={tech.id}
                onClick={() => onSelect(tech)}
                className="p-3 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
              >
                <span className="text-sm truncate block" style={{ color: theme.text }}>{tech.name}</span>
                <span
                  className="text-[10px] mt-1 block"
                  style={{ color: theme.textMuted }}
                >
                  {getTechniqueTypeLabel(tech.technique_type)}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-sm" style={{ color: theme.textMuted }}>
            技が見つかりません
          </p>
        )}

        {/* カスタム追加 */}
        {showCustomForm ? (
          <div className="mt-4 p-3 rounded-xl" style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="ノード名を入力..."
              className="w-full rounded-lg py-2 px-3 outline-none border text-sm mb-2"
              style={{ background: theme.bg, color: theme.text, borderColor: theme.cardBorder }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomForm(false)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ color: theme.textSecondary }}
              >
                キャンセル
              </button>
              <button
                onClick={handleAddCustom}
                disabled={!customName.trim()}
                className="flex-1 py-2 rounded-lg text-sm text-white disabled:opacity-50"
                style={{ background: theme.gradient }}
              >
                追加
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCustomForm(true)}
            className="w-full mt-4 py-3 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 text-sm"
            style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
          >
            <Plus size={16} />
            カスタムノードを追加
          </button>
        )}
      </div>
    </div>
  );
}
