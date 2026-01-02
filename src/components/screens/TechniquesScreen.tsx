'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, ChevronRight, Star, Play, ChevronLeft, X, GitBranch, Trash2, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Technique, TechniqueType, Flow } from '@/types';

// デフォルトカテゴリ
const defaultCategories = [
  { id: 'guard', name: 'ガード（ボトム）', icon: '🛡️' },
  { id: 'top', name: 'トップポジション', icon: '⬆️' },
  { id: 'stand', name: 'スタンド', icon: '🧍' },
  { id: 'leglock', name: 'レッグロック', icon: '🦵' },
  { id: 'turtle', name: 'タートル', icon: '🐢' },
  { id: 'back', name: 'バック', icon: '🔙' },
];

// カテゴリ型
export interface TechniqueCategory {
  id: string;
  name: string;
  icon: string;
}

// エクスポート用（FlowsScreenで使用）
export const techniqueCategories = defaultCategories;

interface TechniquesScreenProps {
  onSelectTechnique: (technique: Technique) => void;
}

export function TechniquesScreen({ onSelectTechnique }: TechniquesScreenProps) {
  const { theme, techniques, addTechnique } = useApp();
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [view, setView] = useState<'categories' | 'list'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customCategories, setCustomCategories] = useState<TechniqueCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Supabaseからカスタムカテゴリを読み込み
  const loadCustomCategories = useCallback(async () => {
    if (!user) {
      // ログインしていない場合はlocalStorageから読み込み
      const saved = localStorage.getItem('bjj-hub-custom-categories');
      if (saved) {
        setCustomCategories(JSON.parse(saved));
      }
      setLoadingCategories(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const categories = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
      }));
      setCustomCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      // フォールバック: localStorageから読み込み
      const saved = localStorage.getItem('bjj-hub-custom-categories');
      if (saved) {
        setCustomCategories(JSON.parse(saved));
      }
    } finally {
      setLoadingCategories(false);
    }
  }, [user]);

  useEffect(() => {
    loadCustomCategories();
  }, [loadCustomCategories]);

  // 全カテゴリ（デフォルト + カスタム）
  const allCategories = [...defaultCategories, ...customCategories];

  // カスタムカテゴリを保存（Supabase + localStorage両方）
  const saveCustomCategory = async (category: TechniqueCategory) => {
    if (!user) {
      // ログインしていない場合はlocalStorageのみ
      const updated = [...customCategories, category];
      setCustomCategories(updated);
      localStorage.setItem('bjj-hub-custom-categories', JSON.stringify(updated));
      showToast('カテゴリを追加しました');
      setShowCategoryModal(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_categories')
        .insert({
          user_id: user.id,
          name: category.name,
          icon: category.icon,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory = {
        id: data.id,
        name: data.name,
        icon: data.icon,
      };
      setCustomCategories([...customCategories, newCategory]);
      showToast('カテゴリを追加しました');
      setShowCategoryModal(false);
    } catch (error) {
      console.error('Error saving category:', error);
      showToast('カテゴリの追加に失敗しました', 'error');
    }
  };

  // カテゴリを削除
  const deleteCustomCategory = async (categoryId: string) => {
    if (!user) {
      const updated = customCategories.filter(c => c.id !== categoryId);
      setCustomCategories(updated);
      localStorage.setItem('bjj-hub-custom-categories', JSON.stringify(updated));
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (error) throw error;

      setCustomCategories(customCategories.filter(c => c.id !== categoryId));
      showToast('カテゴリを削除しました');
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast('カテゴリの削除に失敗しました', 'error');
    }
  };

  // カテゴリでフィルタリング
  const filteredTechniques = techniques.filter(tech => {
    const matchesSearch = !searchQuery || 
      tech.name.includes(searchQuery) || 
      tech.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.tags.some(tag => tag.includes(searchQuery));
    
    const matchesCategory = !selectedCategory || 
      tech.category === selectedCategory ||
      tech.tags.some(tag => {
        const cat = allCategories.find(c => c.id === selectedCategory);
        return cat && tag.includes(cat.name);
      });
    
    return matchesSearch && matchesCategory;
  });

  // カテゴリごとの技数をカウント
  const getCategoryCount = (categoryId: string) => {
    return techniques.filter(t => 
      t.category === categoryId || 
      t.tags.some(tag => {
        const cat = allCategories.find(c => c.id === categoryId);
        return cat && tag.includes(cat.name);
      })
    ).length;
  };

  const handleAddTechnique = async (data: {
    name: string;
    name_en?: string;
    technique_type: TechniqueType;
    description?: string;
    video_url?: string;
    tags: string[];
    category?: string;
  }) => {
    await addTechnique({
      name: data.name,
      name_en: data.name_en,
      technique_type: data.technique_type,
      description: data.description,
      video_url: data.video_url,
      video_type: 'youtube',
      tags: data.tags,
      category: data.category,
      mastery_level: 'learning',
    });
    setShowAddModal(false);
    showToast('技を登録しました');
  };

  const renderCategoryList = () => (
    <div className="space-y-3">
      {/* 全ての技を表示 */}
      <Card
        onClick={() => {
          setSelectedCategory(null);
          setView('list');
        }}
        className="flex items-center gap-4"
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ background: theme.gradient }}
        >
          📚
        </div>
        <div className="flex-1">
          <p className="font-medium" style={{ color: theme.text }}>{t('techniques.all')}</p>
          <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{techniques.length}{t('techniques.count_suffix')}</p>
        </div>
        <ChevronRight size={18} style={{ color: theme.textMuted }} />
      </Card>

      {allCategories.map((cat) => (
        <Card
          key={cat.id}
          onClick={() => {
            setSelectedCategory(cat.id);
            setView('list');
          }}
          className="flex items-center gap-4"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${theme.primary}20` }}
          >
            {cat.icon}
          </div>
          <div className="flex-1">
            <p className="font-medium" style={{ color: theme.text }}>{cat.name}</p>
            <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{getCategoryCount(cat.id)}{t('techniques.count_suffix')}</p>
          </div>
          <ChevronRight size={18} style={{ color: theme.textMuted }} />
        </Card>
      ))}

      {/* カテゴリ追加ボタン */}
      <button
        onClick={() => setShowCategoryModal(true)}
        className="w-full rounded-xl py-4 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
        style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
      >
        <Plus size={18} />
        <span className="text-sm">{t('techniques.add_category')}</span>
      </button>
    </div>
  );

  const renderTechniqueList = () => (
    <div className="space-y-3">
      {filteredTechniques.length === 0 ? (
        <div className="text-center py-12">
          <p className="mb-4" style={{ color: theme.textSecondary }}>{t('techniques.no_techniques')}</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg text-sm"
            style={{ background: theme.gradient, color: 'white' }}
          >
            {t('techniques.add')}
          </button>
        </div>
      ) : (
        filteredTechniques.map((tech) => (
          <Card
            key={tech.id}
            onClick={() => onSelectTechnique(tech)}
            className="flex items-center gap-4"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}40)`,
              }}
            >
              <Play size={20} style={{ color: theme.primary }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate" style={{ color: theme.text }}>{tech.name}</p>
                {tech.mastery_level === 'favorite' && (
                  <Star size={14} style={{ color: theme.accent }} fill={theme.accent} />
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>{tech.name_en}</p>
              <div className="flex gap-1 mt-1">
                {tech.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: `${theme.primary}15`, color: theme.accent }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <ChevronRight size={18} style={{ color: theme.textMuted }} />
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <div
        className="absolute top-0 left-0 right-0 h-48 rounded-b-3xl"
        style={{ background: theme.gradient }}
      />

      <Header
        title={view === 'list' ? t('techniques.all') : t('techniques.title')}
        showBack={view === 'list'}
        onBack={() => {
          setView('categories');
          setSelectedCategory(null);
          setSearchQuery('');
        }}
        rightAction={
          <button
            className="p-2 rounded-full relative z-10 bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      {/* 検索バー */}
      <div className="px-5 pb-4 relative z-10">
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm"
          style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
        >
          <Search size={18} style={{ color: theme.textMuted }} />
          <input
            type="text"
            placeholder={t('techniques.search_placeholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value && view === 'categories') {
                setView('list');
              }
            }}
            className="bg-transparent flex-1 outline-none text-sm"
            style={{ color: theme.text }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={16} style={{ color: theme.textMuted }} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-5 pb-24 relative z-10">
        {view === 'categories' && !searchQuery ? renderCategoryList() : renderTechniqueList()}
      </div>

      {/* 技追加モーダル */}
      {showAddModal && (
        <AddTechniqueModal
          theme={theme}
          categories={allCategories}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddTechnique}
        />
      )}

      {/* カテゴリ追加モーダル */}
      {showCategoryModal && (
        <AddCategoryModal
          theme={theme}
          onClose={() => setShowCategoryModal(false)}
          onSave={saveCustomCategory}
        />
      )}
    </div>
  );
}

// 技追加モーダル
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

function AddTechniqueModal({ theme, categories, onClose, onSave }: AddTechniqueModalProps) {
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [type, setType] = useState<TechniqueType>('submission');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const techniqueTypes: { value: TechniqueType; label: string }[] = [
    { value: 'submission', label: 'サブミッション' },
    { value: 'sweep', label: 'スイープ' },
    { value: 'pass', label: 'パス' },
    { value: 'escape', label: 'エスケープ' },
    { value: 'takedown', label: 'テイクダウン' },
    { value: 'position', label: 'ポジション' },
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

// 技詳細画面
interface TechniqueDetailProps {
  technique: Technique;
  onBack: () => void;
  onOpenFlow?: (flow: Flow) => void;
}

export function TechniqueDetailScreen({ technique, onBack, onOpenFlow }: TechniqueDetailProps) {
  const { theme, flows, updateTechnique, deleteTechnique } = useApp();
  const [isFavorite, setIsFavorite] = useState(technique.mastery_level === 'favorite');
  const [masteryLevel, setMasteryLevel] = useState(technique.mastery_level);

  const handleToggleFavorite = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    updateTechnique(technique.id, { 
      mastery_level: newFavorite ? 'favorite' : 'learned' 
    });
  };

  const handleMasteryChange = (level: 'learning' | 'learned' | 'favorite') => {
    setMasteryLevel(level);
    setIsFavorite(level === 'favorite');
    updateTechnique(technique.id, { mastery_level: level });
  };

  const handleDelete = () => {
    if (confirm('この技を削除しますか？')) {
      deleteTechnique(technique.id);
      onBack();
    }
  };

  // この技に関連するフロー
  const relatedFlows = flows.filter(f => 
    f.tags.some(tag => technique.name.includes(tag) || technique.tags.includes(tag))
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

  const youtubeId = technique.video_url ? getYouTubeId(technique.video_url) : null;

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
            className="aspect-video flex items-center justify-center"
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
        <button
          onClick={handleToggleFavorite}
          className="absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm"
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

      <div
        className="flex-1 overflow-auto px-5 py-6 space-y-6"
        style={{ background: theme.bg }}
      >
        {/* タイトル */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-medium capitalize"
              style={{ background: `${theme.primary}30`, color: theme.accent }}
            >
              {technique.technique_type}
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>{technique.name}</h1>
          {technique.name_en && (
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>{technique.name_en}</p>
          )}
        </div>

        {/* 説明 */}
        {technique.description && (
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: theme.text }}>
              {technique.description}
            </p>
          </Card>
        )}

        {/* タグ */}
        {technique.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {technique.tags.map((tag, i) => (
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
    </div>
  );
}

// カテゴリ追加モーダル
interface AddCategoryModalProps {
  theme: any;
  onClose: () => void;
  onSave: (category: TechniqueCategory) => void;
}

const emojiOptions = ['🥋', '💪', '🦶', '✋', '🔄', '⚔️', '🎯', '🏆', '⭐', '🔥', '💎', '🌟'];

function AddCategoryModal({ theme, onClose, onSave }: AddCategoryModalProps) {
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
