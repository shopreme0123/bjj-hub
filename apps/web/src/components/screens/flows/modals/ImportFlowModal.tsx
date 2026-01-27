'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Flow } from '@/types';
import { getSharedContent, getPublicContent } from '@/lib/shared-content';

interface ImportFlowModalProps {
  theme: any;
  onClose: () => void;
  onImport: (flow: Omit<Flow, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
}

export function ImportFlowModal({ theme, onClose, onImport }: ImportFlowModalProps) {
  const [view, setView] = useState<'code' | 'browse'>('code');
  const [shareCode, setShareCode] = useState('');
  const [publicContent, setPublicContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (view === 'browse') {
      loadPublicContent();
    }
  }, [view]);

  const loadPublicContent = async () => {
    setIsLoading(true);
    try {
      const content = await getPublicContent('flow', 20);
      setPublicContent(content);
    } catch (error) {
      console.error('Load public content error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportByCode = async () => {
    if (!shareCode.trim()) {
      setError('共有コードを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const content = await getSharedContent(shareCode.trim().toUpperCase());

      if (!content) {
        setError('共有コードが見つかりません');
        setIsLoading(false);
        return;
      }

      if (content.content_type !== 'flow') {
        setError('フローのデータではありません');
        setIsLoading(false);
        return;
      }

      const flowData = content.content_data;
      onImport({
        name: flowData.name,
        description: flowData.description || '',
        tags: flowData.tags || [],
        flow_data: flowData.flow_data || { nodes: [], edges: [] },
        is_favorite: false,
      });
    } catch (e) {
      console.error('Import error:', e);
      setError('インポートに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFromBrowse = (content: any) => {
    const flowData = content.content_data;
    onImport({
      name: flowData.name,
      description: flowData.description || '',
      tags: flowData.tags || [],
      flow_data: flowData.flow_data || { nodes: [], edges: [] },
      is_favorite: false,
    });
  };

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 animate-slide-up max-h-[80vh] flex flex-col"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>フローをインポート</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        {/* タブ */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView('code')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={{
              background: view === 'code' ? theme.gradient : theme.card,
              color: view === 'code' ? 'white' : theme.text,
            }}
          >
            共有コード
          </button>
          <button
            onClick={() => setView('browse')}
            className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all"
            style={{
              background: view === 'browse' ? theme.gradient : theme.card,
              color: view === 'browse' ? 'white' : theme.text,
            }}
          >
            公開フローを探す
          </button>
        </div>

        {view === 'code' ? (
          <>
            <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
              共有されたフローのコードを入力してください
            </p>

            <input
              type="text"
              value={shareCode}
              onChange={(e) => {
                setShareCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder="XXXXXX"
              maxLength={6}
              className="w-full rounded-xl p-4 text-center text-2xl font-bold tracking-widest outline-none border mb-2 uppercase"
              style={{
                background: theme.card,
                color: theme.text,
                borderColor: error ? '#ef4444' : theme.cardBorder
              }}
            />

            {error && (
              <p className="text-sm text-red-500 mb-4">{error}</p>
            )}

            <button
              onClick={handleImportByCode}
              disabled={!shareCode.trim() || isLoading}
              className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: theme.gradient }}
            >
              {isLoading ? 'インポート中...' : 'インポート'}
            </button>
          </>
        ) : (
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin" style={{ color: theme.primary }} />
              </div>
            ) : publicContent.length === 0 ? (
              <div className="text-center py-12">
                <p style={{ color: theme.textSecondary }}>公開されているフローがありません</p>
              </div>
            ) : (
              <div className="space-y-2">
                {publicContent.map((content) => (
                  <button
                    key={content.id}
                    onClick={() => handleImportFromBrowse(content)}
                    className="w-full p-4 rounded-xl text-left"
                    style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
                  >
                    <p className="font-medium mb-1" style={{ color: theme.text }}>
                      {content.title}
                    </p>
                    {content.description && (
                      <p className="text-xs mb-2" style={{ color: theme.textSecondary }}>
                        {content.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      {content.content_data?.tags?.slice(0, 3).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: `${theme.primary}15`, color: theme.primary }}
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="text-xs ml-auto" style={{ color: theme.textMuted }}>
                        {new Date(content.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
