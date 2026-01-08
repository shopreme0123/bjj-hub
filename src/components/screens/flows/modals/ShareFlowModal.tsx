'use client';

import React, { useState, useEffect } from 'react';
import { X, Globe, Link as LinkIcon, Users, Check, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { Flow, Group } from '@/types';
import { shareContent, shareToGroup, type Visibility } from '@/lib/shared-content';
import { supabase } from '@/lib/supabase';

interface ShareFlowModalProps {
  theme: any;
  flow: Flow;
  userId?: string;
  onClose: () => void;
}

export function ShareFlowModal({ theme, flow, userId, onClose }: ShareFlowModalProps) {
  const [visibility, setVisibility] = useState<Visibility | 'group'>('public');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [sharedToGroup, setSharedToGroup] = useState(false);
  const { showToast } = useToast();

  // ユーザーが参加しているグループを取得
  useEffect(() => {
    const loadGroups = async () => {
      if (!userId) return;
      setLoadingGroups(true);

      try {
        const { data: memberships, error: memberError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', userId);

        if (memberError) throw memberError;

        if (memberships && memberships.length > 0) {
          const groupIds = memberships.map(m => m.group_id);
          const { data: groupsData, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .in('id', groupIds);

          if (groupError) throw groupError;
          setGroups(groupsData || []);
        }
      } catch (error) {
        console.error('Error loading groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    loadGroups();
  }, [userId]);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const contentData = {
        name: flow.name,
        description: flow.description,
        tags: flow.tags,
        flow_data: flow.flow_data,
      };

      if (visibility === 'group' && selectedGroupId) {
        // グループに共有
        const result = await shareToGroup(
          'flow',
          contentData,
          flow.name,
          selectedGroupId,
          flow.description,
          userId
        );

        if (result.success) {
          setSharedToGroup(true);
          showToast('グループに共有しました');
        } else {
          showToast('共有に失敗しました', 'error');
        }
      } else {
        // 全体公開 or リンク限定
        const result = await shareContent(
          'flow',
          contentData,
          flow.name,
          visibility as Visibility,
          flow.description,
          userId
        );

        if (result.success && result.shareCode) {
          setShareCode(result.shareCode);
          showToast('フローを共有しました');
        } else {
          showToast('共有に失敗しました', 'error');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      showToast('共有に失敗しました', 'error');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyCode = () => {
    if (shareCode) {
      navigator.clipboard.writeText(shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('共有コードをコピーしました');
    }
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
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>フローを共有</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        {!shareCode && !sharedToGroup ? (
          <>
            <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
              公開範囲を選択してください
            </p>

            <div className="space-y-3 mb-6 flex-1 overflow-auto">
              <button
                onClick={() => setVisibility('public')}
                className="w-full p-4 rounded-xl flex items-center gap-3 border-2 transition-all"
                style={{
                  background: visibility === 'public' ? `${theme.primary}15` : theme.card,
                  borderColor: visibility === 'public' ? theme.primary : theme.cardBorder,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${theme.primary}20` }}
                >
                  <Globe size={20} style={{ color: theme.primary }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium" style={{ color: theme.text }}>全体公開</p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>誰でも検索・閲覧できます</p>
                </div>
              </button>

              <button
                onClick={() => setVisibility('link_only')}
                className="w-full p-4 rounded-xl flex items-center gap-3 border-2 transition-all"
                style={{
                  background: visibility === 'link_only' ? `${theme.primary}15` : theme.card,
                  borderColor: visibility === 'link_only' ? theme.primary : theme.cardBorder,
                }}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `${theme.primary}20` }}
                >
                  <LinkIcon size={20} style={{ color: theme.primary }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium" style={{ color: theme.text }}>コードを知っている人のみ</p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>共有コードを持つ人だけが閲覧できます</p>
                </div>
              </button>

              {/* グループに共有オプション */}
              {groups.length > 0 && (
                <>
                  <div className="border-t my-4" style={{ borderColor: theme.cardBorder }} />
                  <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>グループに共有</p>
                  {groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => {
                        setVisibility('group');
                        setSelectedGroupId(group.id);
                      }}
                      className="w-full p-4 rounded-xl flex items-center gap-3 border-2 transition-all"
                      style={{
                        background: visibility === 'group' && selectedGroupId === group.id ? `${theme.primary}15` : theme.card,
                        borderColor: visibility === 'group' && selectedGroupId === group.id ? theme.primary : theme.cardBorder,
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ background: theme.gradient }}
                      >
                        <Users size={20} className="text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium" style={{ color: theme.text }}>{group.name}</p>
                        <p className="text-xs" style={{ color: theme.textSecondary }}>グループメンバーのみ閲覧可能</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {loadingGroups && (
                <div className="flex justify-center py-4">
                  <Loader2 size={24} className="animate-spin" style={{ color: theme.textMuted }} />
                </div>
              )}
            </div>

            <button
              onClick={handleShare}
              disabled={isSharing || (visibility === 'group' && !selectedGroupId)}
              className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: theme.gradient }}
            >
              {isSharing ? '共有中...' : '共有する'}
            </button>
          </>
        ) : sharedToGroup ? (
          <>
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${theme.primary}20` }}
              >
                <Check size={32} style={{ color: theme.primary }} />
              </div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>グループに共有しました</p>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                グループメンバーが閲覧できるようになりました
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 rounded-xl text-white font-semibold"
              style={{ background: theme.gradient }}
            >
              閉じる
            </button>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${theme.primary}20` }}
              >
                <Check size={32} style={{ color: theme.primary }} />
              </div>
              <p className="font-semibold mb-2" style={{ color: theme.text }}>共有コード</p>
              <div
                className="text-3xl font-bold tracking-widest mb-2"
                style={{ color: theme.primary }}
              >
                {shareCode}
              </div>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                このコードを相手に伝えてください
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 mb-3"
              style={{ background: theme.gradient }}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? 'コピーしました' : 'コードをコピー'}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-medium"
              style={{ color: theme.textSecondary }}
            >
              閉じる
            </button>
          </>
        )}
      </div>
    </div>
  );
}
