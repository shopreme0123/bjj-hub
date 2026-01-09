'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, ChevronRight, Star, Download, GitBranch } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Header, IconButton } from '@/components/ui/Header';
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
      <Header
        title={t('flows.title')}
        rightAction={
          <>
            <IconButton
              icon={<Download size={18} />}
              onClick={() => setShowImportModal(true)}
            />
            <IconButton
              icon={<Plus size={18} />}
              onClick={() => setShowAddModal(true)}
            />
          </>
        }
      />

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-auto px-4 pb-24 space-y-4">
        {/* 検索バー */}
        <div className="relative mt-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: theme.textMuted }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('flows.search')}
            className="w-full rounded-xl py-2.5 px-10 outline-none border text-sm"
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
            <h3 className="text-xs font-medium" style={{ color: theme.textMuted }}>
              {t('flows.list')} ({filteredFlows.length})
            </h3>
            {sortedFlows.map((flow) => (
              <Card
                key={flow.id}
                onClick={() => onOpenEditor(flow)}
                className="!p-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${theme.primary}15` }}
                  >
                    <GitBranch size={18} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate" style={{ color: theme.text }}>
                        {flow.name}
                      </p>
                      {flow.is_favorite && (
                        <Star size={12} fill={theme.accent} style={{ color: theme.accent }} />
                      )}
                    </div>
                    {flow.description && (
                      <p className="text-xs truncate mt-0.5" style={{ color: theme.textMuted }}>
                        {flow.description}
                      </p>
                    )}
                    {flow.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {flow.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[10px]" style={{ color: theme.textMuted }}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} style={{ color: theme.textMuted }} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <GitBranch size={40} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {searchQuery ? 'フローが見つかりません' : 'フローを作成してみましょう'}
            </p>
          </div>
        )}

        {/* 新規作成ボタン */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full rounded-xl py-3 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
          style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
        >
          <Plus size={16} />
          <span className="text-sm">{t('flows.add')}</span>
        </button>
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
