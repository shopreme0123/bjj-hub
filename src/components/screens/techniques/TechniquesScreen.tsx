'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronRight, Filter, Star, Trash2, Pencil, Download } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Header, IconButton } from '@/components/ui/Header';
import { Technique, TechniqueType } from '@/types';
import {
  AddCategoryModal,
  EditCategoryModal,
  TechniqueCategory,
  defaultCategories
} from '@/components/shared/categories';
import {
  AddTechniqueModal,
  EditTechniqueModal,
  ShareTechniqueModal,
  ImportTechniqueModal
} from './modals';

interface TechniquesScreenProps {
  onSelectTechnique: (technique: Technique) => void;
}

export function TechniquesScreen({ onSelectTechnique }: TechniquesScreenProps) {
  const { theme, techniques, addTechnique, updateTechnique, deleteTechnique } = useApp();
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<TechniqueType | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddTechniqueModal, setShowAddTechniqueModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TechniqueCategory | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);

  // カテゴリ管理（デフォルトとカスタム）
  const [categories, setCategories] = useState<TechniqueCategory[]>(defaultCategories);

  const techniqueTypes: { value: TechniqueType; label: string }[] = [
    { value: 'submission', label: t('techniques.type.submission') },
    { value: 'sweep', label: t('techniques.type.sweep') },
    { value: 'pass', label: t('techniques.type.pass') },
    { value: 'escape', label: t('techniques.type.escape') },
    { value: 'takedown', label: t('techniques.type.takedown') },
    { value: 'position', label: t('techniques.type.position') },
    { value: 'other', label: t('techniques.type.other') },
  ];

  // 技をフィルタリング
  const filteredTechniques = useMemo(() => {
    let result = techniques;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.name_en?.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }

    if (selectedType) {
      result = result.filter(t => t.technique_type === selectedType);
    }

    return result;
  }, [techniques, searchQuery, selectedCategory, selectedType]);

  // 技を習得度で並び替え
  const sortedTechniques = useMemo(() => {
    const order = { favorite: 0, learned: 1, learning: 2 };
    return [...filteredTechniques].sort((a, b) =>
      (order[a.mastery_level] || 2) - (order[b.mastery_level] || 2)
    );
  }, [filteredTechniques]);

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
      ...data,
      video_type: 'youtube',
      mastery_level: 'learning',
    });
    setShowAddTechniqueModal(false);
    showToast('技を追加しました');
  };

  const handleAddCategory = (category: TechniqueCategory) => {
    setCategories([...categories, category]);
    setShowAddCategoryModal(false);
    showToast('カテゴリを追加しました');
  };

  const handleEditCategory = (category: TechniqueCategory) => {
    setCategories(categories.map(c => c.id === category.id ? category : c));
    setEditingCategory(null);
    showToast('カテゴリを更新しました');
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('このカテゴリを削除しますか？')) {
      setCategories(categories.filter(c => c.id !== categoryId));
      // 削除したカテゴリが選択されていたらクリア
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
      showToast('カテゴリを削除しました');
    }
  };

  const handleImport = async (tech: Omit<Technique, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    await addTechnique(tech);
    setShowImportModal(false);
    showToast('技をインポートしました');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <Header
        title={t('techniques.title')}
        rightAction={
          <>
            <IconButton
              icon={<Download size={18} />}
              onClick={() => setShowImportModal(true)}
            />
            <IconButton
              icon={<Plus size={18} />}
              onClick={() => setShowAddTechniqueModal(true)}
            />
          </>
        }
      />

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-auto px-4 pt-2 pb-24 space-y-4">
        {/* 検索バー */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: theme.textMuted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('techniques.search')}
            className="w-full rounded-xl py-2.5 px-10 outline-none border text-sm"
            style={{
              background: theme.card,
              color: theme.text,
              borderColor: theme.cardBorder,
            }}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg"
            style={{ background: showFilters ? theme.primary : 'transparent' }}
          >
            <Filter
              size={16}
              style={{ color: showFilters ? 'white' : theme.textMuted }}
            />
          </button>
        </div>

        {/* フィルター（種類） */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {techniqueTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(selectedType === type.value ? null : type.value)}
                className="px-3 py-1.5 rounded-full text-xs transition-all"
                style={{
                  background: selectedType === type.value ? theme.primary : theme.card,
                  color: selectedType === type.value ? 'white' : theme.textSecondary,
                  border: `1px solid ${selectedType === type.value ? 'transparent' : theme.cardBorder}`,
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        {/* カテゴリ一覧 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium" style={{ color: theme.textMuted }}>
              {t('techniques.category')}
            </h3>
            <button
              onClick={() => setShowAddCategoryModal(true)}
              className="text-xs flex items-center gap-1"
              style={{ color: theme.primary }}
            >
              <Plus size={12} />
              追加
            </button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs transition-all"
              style={{
                background: selectedCategory === null ? theme.primary : theme.card,
                color: selectedCategory === null ? 'white' : theme.textSecondary,
                border: `1px solid ${selectedCategory === null ? 'transparent' : theme.cardBorder}`,
              }}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <div key={cat.id} className="relative group flex-shrink-0">
                <button
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className="px-3 py-1.5 rounded-lg text-xs transition-all flex items-center gap-1.5"
                  style={{
                    background: selectedCategory === cat.id ? theme.primary : theme.card,
                    color: selectedCategory === cat.id ? 'white' : theme.textSecondary,
                    border: `1px solid ${selectedCategory === cat.id ? 'transparent' : theme.cardBorder}`,
                  }}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
                {cat.id.startsWith('custom') && (
                  <div className="absolute -top-1 -right-1 hidden group-hover:flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(cat);
                      }}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                      style={{ background: theme.primary }}
                    >
                      <Pencil size={8} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(cat.id);
                      }}
                      className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 技一覧 */}
        {sortedTechniques.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-xs font-medium" style={{ color: theme.textMuted }}>
              {t('techniques.list')} ({filteredTechniques.length})
            </h3>
            {sortedTechniques.map((tech) => {
              const category = categories.find(c => c.id === tech.category);
              return (
                <Card
                  key={tech.id}
                  onClick={() => onSelectTechnique(tech)}
                  className="!p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: `${theme.primary}15` }}
                    >
                      {category?.icon || '🥋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate" style={{ color: theme.text }}>
                          {tech.name}
                        </p>
                        {tech.mastery_level === 'favorite' && (
                          <Star size={12} fill={theme.accent} style={{ color: theme.accent }} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-[10px] capitalize"
                          style={{ background: `${theme.primary}20`, color: theme.primary }}
                        >
                          {tech.technique_type}
                        </span>
                        {tech.tags.slice(0, 1).map((tag, i) => (
                          <span key={i} className="text-[10px]" style={{ color: theme.textMuted }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <ChevronRight size={16} style={{ color: theme.textMuted }} />
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {searchQuery ? '技が見つかりません' : '技を追加してみましょう'}
            </p>
          </div>
        )}

        {/* 新規追加ボタン */}
        <button
          onClick={() => setShowAddTechniqueModal(true)}
          className="w-full rounded-xl py-3 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
          style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
        >
          <Plus size={16} />
          <span className="text-sm">{t('techniques.add')}</span>
        </button>
      </div>

      {/* 技追加モーダル */}
      {showAddTechniqueModal && (
        <AddTechniqueModal
          theme={theme}
          categories={categories}
          onClose={() => setShowAddTechniqueModal(false)}
          onSave={handleAddTechnique}
        />
      )}

      {/* カテゴリ追加モーダル */}
      {showAddCategoryModal && (
        <AddCategoryModal
          theme={theme}
          onClose={() => setShowAddCategoryModal(false)}
          onSave={handleAddCategory}
        />
      )}

      {/* カテゴリ編集モーダル */}
      {editingCategory && (
        <EditCategoryModal
          theme={theme}
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSave={handleEditCategory}
        />
      )}

      {/* インポートモーダル */}
      {showImportModal && (
        <ImportTechniqueModal
          theme={theme}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
