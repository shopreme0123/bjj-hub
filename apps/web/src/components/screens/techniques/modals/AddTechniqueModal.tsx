'use client';

import React, { useState, useRef } from 'react';
import { Plus, X, Video, Trash2 } from 'lucide-react';
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
    video_urls?: string[];
    tags: string[];
    category?: string;
  }) => void;
}

const MAX_VIDEOS = 10; // iOS版に準拠

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
  const [videos, setVideos] = useState<{ url: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_VIDEOS - videos.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    const newVideos = filesToAdd.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setVideos(prev => [...prev, ...newVideos]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeVideo = (index: number) => {
    setVideos(prev => {
      const video = prev[index];
      if (video.url.startsWith('blob:')) {
        URL.revokeObjectURL(video.url);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

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
      video_urls: videos.length > 0 ? videos.map(v => v.url) : undefined,
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

          {/* 自分の動画（iOS版に準拠：最大10件） */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>
              自分の動画（{videos.length}/{MAX_VIDEOS}）
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoSelect}
              className="hidden"
            />

            {/* 動画リスト */}
            {videos.length > 0 && (
              <div className="space-y-2 mb-2">
                {videos.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg"
                    style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
                  >
                    <Video size={18} style={{ color: theme.primary }} />
                    <span className="flex-1 text-xs truncate" style={{ color: theme.text }}>
                      {video.name}
                    </span>
                    <button
                      onClick={() => removeVideo(index)}
                      className="p-1 rounded hover:bg-red-100"
                    >
                      <Trash2 size={14} className="text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 追加ボタン */}
            {videos.length < MAX_VIDEOS && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 rounded-lg border-2 border-dashed flex items-center justify-center gap-2 transition-colors hover:border-blue-400"
                style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
              >
                <Plus size={16} />
                <span className="text-sm">動画を追加</span>
              </button>
            )}
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
