'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TechniqueCategory, emojiOptions } from './constants';

interface AddCategoryModalProps {
  theme: any;
  onClose: () => void;
  onSave: (category: TechniqueCategory) => void;
}

export function AddCategoryModal({ theme, onClose, onSave }: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🥋');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      id: `custom-${Date.now()}`,
      name: name.trim(),
      icon,
    });
  };

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>カテゴリを追加</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* アイコン選択 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>アイコン</label>
            <div className="flex flex-wrap gap-2">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all"
                  style={{
                    background: icon === emoji ? theme.gradient : theme.card,
                    border: `1px solid ${icon === emoji ? 'transparent' : theme.cardBorder}`,
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* カテゴリ名 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>カテゴリ名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ハーフガード"
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl text-white font-semibold mt-4 disabled:opacity-50"
            style={{ background: theme.gradient }}
          >
            追加
          </button>
        </div>
      </div>
    </div>
  );
}
