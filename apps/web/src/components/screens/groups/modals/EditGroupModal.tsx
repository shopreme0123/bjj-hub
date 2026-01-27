'use client';

import React, { useState, useRef } from 'react';
import { X, Loader2, Camera, Users } from 'lucide-react';
import { Group } from '@/types';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/Toast';

interface EditGroupModalProps {
  theme: any;
  group: Group;
  onClose: () => void;
  onSave: (updates: { name: string; description?: string; icon_url?: string }) => Promise<void>;
}

export function EditGroupModal({ theme, group, onClose, onSave }: EditGroupModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [iconUrl, setIconUrl] = useState(group.icon_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('画像は2MB以下にしてください', 'error');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `group-${group.id}-${Date.now()}.${fileExt}`;
      const filePath = `groups/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setIconUrl(publicUrl);
      showToast('画像をアップロードしました');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('アップロードに失敗しました', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      icon_url: iconUrl || undefined,
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
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>グループを編集</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* グループ画像 */}
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: theme.gradient }}
              >
                {iconUrl ? (
                  <img src={iconUrl} alt="Group" className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-white" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: theme.gradient }}
              >
                {uploading ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

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
            disabled={!name.trim() || saving || uploading}
            className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: theme.gradient }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
