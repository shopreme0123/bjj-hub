'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Edge } from 'reactflow';

interface EdgeLabelModalProps {
  theme: any;
  edge: Edge | null;
  onClose: () => void;
  onSave: (label: string) => void;
  onDelete: () => void;
  isNewConnection?: boolean;
}

export function EdgeLabelModal({ theme, edge, onClose, onSave, onDelete, isNewConnection }: EdgeLabelModalProps) {
  const [label, setLabel] = useState((edge?.label as string) || (edge?.data?.label as string) || '');

  const suggestedLabels = [
    '成功時',
    '失敗時',
    '相手が反応したら',
    '相手が止まったら',
    'カウンターされたら',
    '脚を畳まれたら',
    '立たれたら',
    'パスされそうになったら',
  ];

  const handleSubmit = () => {
    onSave(label.trim());
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
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>
            {isNewConnection ? '接続ラベルを追加' : '接続ラベルを編集'}
          </h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* ラベル入力 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>ラベル</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="例: 成功時"
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              autoFocus
            />
          </div>

          {/* 提案ラベル */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>よく使うラベル</label>
            <div className="flex flex-wrap gap-2">
              {suggestedLabels.map((suggested) => (
                <button
                  key={suggested}
                  onClick={() => setLabel(suggested)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all"
                  style={{
                    background: label === suggested ? theme.gradient : theme.card,
                    color: label === suggested ? 'white' : theme.textSecondary,
                    border: `1px solid ${label === suggested ? 'transparent' : theme.cardBorder}`,
                  }}
                >
                  {suggested}
                </button>
              ))}
            </div>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl text-white font-semibold"
            style={{ background: theme.gradient }}
          >
            保存
          </button>

          {/* 削除/キャンセルボタン */}
          <button
            onClick={onDelete}
            className="w-full py-3 rounded-xl text-sm"
            style={{
              background: isNewConnection ? theme.cardBorder : 'rgba(239, 68, 68, 0.1)',
              color: isNewConnection ? theme.text : '#ef4444',
            }}
          >
            {isNewConnection ? 'キャンセル' : 'この接続を削除'}
          </button>
        </div>
      </div>
    </div>
  );
}
