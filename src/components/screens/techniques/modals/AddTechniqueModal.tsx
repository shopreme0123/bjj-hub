'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { TechniqueType } from '@/types';
import { TechniqueCategory } from '@/components/shared/categories';
import { useI18n } from '@/lib/i18n';

interface AddTechniqueModalProps {
  theme: any;
  categories: TechniqueCategory[];
  onClose: () => void;
  onSave: (data: {
    name: string;
    name_en?: string;
    technique_type: TechniqueType;
    description?: string;
    video_url?: string;
    tags: string[];
    category?: string;
  }) => void;
}

export function AddTechniqueModal({ theme, categories, onClose, onSave }: AddTechniqueModalProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<TechniqueType>('submission');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const techniqueTypes: { value: TechniqueType; label: string }[] = [
    { value: 'submission', label: t('techniques.type.submission') },
    { value: 'sweep', label: t('techniques.type.sweep') },
    { value: 'pass', label: t('techniques.type.pass') },
    { value: 'escape', label: t('techniques.type.escape') },
    { value: 'takedown', label: t('techniques.type.takedown') },
    { value: 'position', label: t('techniques.type.position') },
    { value: 'other', label: t('techniques.type.other') },
  ];

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      name_en: nameEn.trim() || undefined,
      technique_type: type,
      description: description.trim() || undefined,
      video_url: videoUrl.trim() || undefined,
      tags,
      category: category || undefined,
    });
  };

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 max-h-[85%] overflow-auto animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>技を追加</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* カテゴリ */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>カテゴリ *</label>
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className="p-3 rounded-xl text-center transition-all"
                  style={{
                    background: category === cat.id ? theme.gradient : theme.card,
                    border: `1px solid ${category === cat.id ? 'transparent' : theme.cardBorder}`,
                  }}
                >
                  <span className="text-xl block">{cat.icon}</span>
                  <span
                    className="text-xs mt-1 block"
                    style={{ color: category === cat.id ? 'white' : theme.textSecondary }}
                  >
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 技名 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>技名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 三角絞め"
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 英語名 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>英語名</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              placeholder="例: Triangle Choke"
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 種類 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>種類 *</label>
            <div className="flex flex-wrap gap-2">
              {techniqueTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className="px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: type === t.value ? theme.gradient : theme.card,
                    color: type === t.value ? 'white' : theme.textSecondary,
                    border: `1px solid ${type === t.value ? 'transparent' : theme.cardBorder}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* タグ */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>タグ</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="タグを入力..."
                className="flex-1 rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
              <button
                onClick={addTag}
                className="px-4 rounded-xl"
                style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
              >
                <Plus size={18} style={{ color: theme.primary }} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1"
                    style={{
                      background: `${theme.primary}20`,
                      color: theme.accent,
                    }}
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 説明 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>説明・メモ</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ポイントや注意点を記入..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500 resize-none"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* YouTube URL */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>YouTube動画URL</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl text-white font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: theme.gradient }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
