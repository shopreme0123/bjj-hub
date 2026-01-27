'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface CreateGroupModalProps {
  theme: any;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => void;
}

export function CreateGroupModal({ theme, onClose, onSave }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>グループを作成</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>グループ名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 青帯研究会"
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="グループの説明..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500 resize-none"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="w-full py-4 rounded-xl text-white font-semibold mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: theme.gradient }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : '作成'}
          </button>
        </div>
      </div>
    </div>
  );
}
