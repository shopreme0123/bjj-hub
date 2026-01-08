'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronRight, Star, Download, GitBranch } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Flow } from '@/types';
import { AddFlowModal, ImportFlowModal } from './modals';

interface FlowsScreenProps {
  onOpenEditor: (flow?: Flow) => void;
}

export function FlowsScreen({ onOpenEditor }: FlowsScreenProps) {
  const { theme, flows, addFlow } = useApp();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // フローをフィルタリング
  const filteredFlows = useMemo(() => {
    if (!searchQuery.trim()) return flows;
    const query = searchQuery.toLowerCase();
    return flows.filter(f =>
      f.name.toLowerCase().includes(query) ||
      f.description?.toLowerCase().includes(query) ||
      f.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [flows, searchQuery]);

  // お気に入りを上に表示
  const sortedFlows = useMemo(() => {
    return [...filteredFlows].sort((a, b) => {
      if (a.is_favorite && !b.is_favorite) return -1;
      if (!a.is_favorite && b.is_favorite) return 1;
      return 0;
    });
  }, [filteredFlows]);

  const handleAddFlow = async (data: { name: string; description?: string; tags: string[] }) => {
    await addFlow({
      ...data,
      is_favorite: false,
      flow_data: { nodes: [], edges: [] },
    });
    setShowAddModal(false);
    showToast('フローを作成しました');
  };

  const handleImport = async (flowData: Omit<Flow, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    await addFlow(flowData);
    setShowImportModal(false);
    showToast('フローをインポートしました');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* グラデーション背景 - 固定 */}
      <div
        className="absolute top-0 left-0 right-0 h-48 rounded-b-3xl"
        style={{ background: theme.gradient }}
      />

      <Header
        title={t('flows.title')}
        rightAction={
          <div className="flex gap-2">
            <button
              className="p-2 rounded-full relative z-10 bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowImportModal(true);
              }}
            >
              <Download size={18} className="text-white" />
            </button>
            <button
              className="p-2 rounded-full relative z-10 bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddModal(true);
              }}
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
        }
      />

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-auto relative z-10">
        <div
          className="min-h-full px-5 pb-24 space-y-4 pt-4"
          style={{ background: theme.bg, marginTop: '60px', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
        >
          {/* 検索バー */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2"
              style={{ color: theme.textMuted }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('flows.search')}
              className="w-full rounded-xl py-3 px-11 outline-none border"
              style={{
                background: theme.card,
                color: theme.text,
                borderColor: theme.cardBorder,
              }}
            />
          </div>

          {/* フロー一覧 */}
          {sortedFlows.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                {t('flows.list')} ({filteredFlows.length})
              </h3>
              {sortedFlows.map((flow) => (
                <Card
                  key={flow.id}
                  onClick={() => onOpenEditor(flow)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: theme.gradient }}
                    >
                      <GitBranch size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate" style={{ color: theme.text }}>
                          {flow.name}
                        </p>
                        {flow.is_favorite && (
                          <Star size={14} fill={theme.accent} style={{ color: theme.accent }} />
                        )}
                      </div>
                      {flow.description && (
                        <p className="text-xs truncate mt-0.5" style={{ color: theme.textSecondary }}>
                          {flow.description}
                        </p>
                      )}
                      {flow.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {flow.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-xs" style={{ color: theme.textMuted }}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight size={18} style={{ color: theme.textMuted }} />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <GitBranch size={48} className="mx-auto mb-4" style={{ color: theme.textMuted }} />
              <p style={{ color: theme.textMuted }}>
                {searchQuery ? 'フローが見つかりません' : 'フローを作成してみましょう'}
              </p>
            </div>
          )}

          {/* 新規作成ボタン */}
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full rounded-xl py-4 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
            style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
          >
            <Plus size={18} />
            <span className="text-sm">{t('flows.add')}</span>
          </button>
        </div>
      </div>

      {/* フロー追加モーダル */}
      {showAddModal && (
        <AddFlowModal
          theme={theme}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddFlow}
        />
      )}

      {/* インポートモーダル */}
      {showImportModal && (
        <ImportFlowModal
          theme={theme}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
