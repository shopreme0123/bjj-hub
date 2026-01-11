'use client';

import React, { useState } from 'react';
import { ChevronLeft, Star, Play, Pencil, Share2, ChevronRight, GitBranch, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Technique, Flow, TechniqueType } from '@/types';
import { EditTechniqueModal, ShareTechniqueModal } from './modals';

interface TechniqueDetailProps {
  technique: Technique;
  onBack: () => void;
  onOpenFlow?: (flow: Flow) => void;
}

export function TechniqueDetailScreen({ technique, onBack, onOpenFlow }: TechniqueDetailProps) {
  const { theme, flows, updateTechnique, deleteTechnique } = useApp();
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();

  // 技の状態をローカルで管理（編集後の反映のため）
  const [currentTechnique, setCurrentTechnique] = useState<Technique>(technique);

  // 技の種類の翻訳を取得
  const getTechniqueTypeLabel = (type: TechniqueType): string => {
    return t(`techniques.type.${type}`);
  };
  const [isFavorite, setIsFavorite] = useState(currentTechnique.mastery_level === 'favorite');
  const [masteryLevel, setMasteryLevel] = useState(currentTechnique.mastery_level);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleToggleFavorite = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    const newMastery = newFavorite ? 'favorite' : 'learned';
    setMasteryLevel(newMastery);
    updateTechnique(currentTechnique.id, {
      mastery_level: newMastery
    });
    setCurrentTechnique(prev => ({ ...prev, mastery_level: newMastery }));
  };

  const handleMasteryChange = (level: 'learning' | 'learned' | 'favorite') => {
    setMasteryLevel(level);
    setIsFavorite(level === 'favorite');
    updateTechnique(currentTechnique.id, { mastery_level: level });
    setCurrentTechnique(prev => ({ ...prev, mastery_level: level }));
  };

  const handleDelete = () => {
    if (confirm('この技を削除しますか？')) {
      deleteTechnique(currentTechnique.id);
      onBack();
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSaveEdit = (data: Partial<Technique>) => {
    updateTechnique(currentTechnique.id, data);
    // ローカル状態を更新して画面に反映
    setCurrentTechnique(prev => ({ ...prev, ...data } as Technique));
    setShowEditModal(false);
    showToast('技を更新しました');
  };

  // この技に関連するフロー
  const relatedFlows = flows.filter(f =>
    f.tags.some(tag => currentTechnique.name.includes(tag) || currentTechnique.tags.includes(tag))
  );

  // YouTubeのURLからIDを抽出
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const youtubeId = currentTechnique.video_url ? getYouTubeId(currentTechnique.video_url) : null;

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* 動画エリア（PC対応: 最大高さを制限） */}
      <div className="relative shrink-0">
        {youtubeId ? (
          <div className="aspect-video w-full max-h-[40vh]">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div
            className="aspect-video w-full max-h-[40vh] flex items-center justify-center"
            style={{ background: theme.gradient }}
          >
            <div className="text-center">
              <Play size={40} className="text-white/40 mx-auto mb-2" />
              <p className="text-white/40 text-sm">動画未登録</p>
            </div>
          </div>
        )}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full backdrop-blur-sm"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <Share2 size={20} className="text-white" />
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <Pencil size={20} className="text-white" />
          </button>
          <button
            onClick={handleToggleFavorite}
            className="p-2 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.3)' }}
          >
            <Star
              size={20}
              className="text-white"
              fill={isFavorite ? theme.accent : 'transparent'}
              style={{ color: isFavorite ? theme.accent : 'white' }}
            />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto px-5 py-6 space-y-6"
        style={{ background: theme.bg }}
      >
        {/* タイトル */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: `${theme.primary}30`, color: theme.accent }}
            >
              {getTechniqueTypeLabel(currentTechnique.technique_type)}
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>{currentTechnique.name}</h1>
          {currentTechnique.name_en && (
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>{currentTechnique.name_en}</p>
          )}
        </div>

        {/* 説明 */}
        {currentTechnique.description && (
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
              {currentTechnique.description}
            </p>
          </Card>
        )}

        {/* タグ */}
        {currentTechnique.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {currentTechnique.tags.map((tag, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-full text-xs"
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.textSecondary,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 関連フロー */}
        {relatedFlows.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>使用フロー</h3>
            {relatedFlows.map((flow) => (
              <Card
                key={flow.id}
                className="flex items-center gap-3"
                onClick={() => onOpenFlow?.(flow)}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${theme.primary}20` }}
                >
                  <GitBranch size={18} style={{ color: theme.primary }} />
                </div>
                <span className="text-sm flex-1" style={{ color: theme.text }}>{flow.name}</span>
                <ChevronRight size={16} style={{ color: theme.textMuted }} />
              </Card>
            ))}
          </div>
        )}

        {/* 習得状況 */}
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>習得状況</h3>
          <div className="flex gap-2">
            {[
              { value: 'learning' as const, label: '学習中' },
              { value: 'learned' as const, label: '習得' },
              { value: 'favorite' as const, label: '得意技' },
            ].map((level) => (
              <button
                key={level.value}
                onClick={() => handleMasteryChange(level.value)}
                className="flex-1 py-3 rounded-xl text-sm transition-all"
                style={{
                  background: masteryLevel === level.value ? theme.gradient : theme.card,
                  color: masteryLevel === level.value ? 'white' : theme.textSecondary,
                  border: `1px solid ${masteryLevel === level.value ? 'transparent' : theme.cardBorder}`,
                }}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* 削除ボタン */}
        <button
          onClick={handleDelete}
          className="w-full py-3 rounded-xl text-red-500 flex items-center justify-center gap-2"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          <Trash2 size={18} />
          この技を削除
        </button>
      </div>

      {/* 技編集モーダル */}
      {showEditModal && (
        <EditTechniqueModal
          theme={theme}
          technique={currentTechnique}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {/* 共有モーダル */}
      {showShareModal && (
        <ShareTechniqueModal
          theme={theme}
          technique={currentTechnique}
          userId={user?.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
