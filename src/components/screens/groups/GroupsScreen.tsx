'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, ChevronRight, Loader2, X } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { generateSecureCode } from '@/lib/security';
import { Card } from '@/components/ui/Card';
import { Header, IconButton } from '@/components/ui/Header';
import { AdBanner, NativeAd } from '@/components/ui/AdBanner';
import { Group } from '@/types';
import { CreateGroupModal } from './modals';

interface GroupWithMembers extends Group {
  member_count: number;
  is_admin: boolean;
}

interface GroupPreview extends Group {
  member_count: number;
}

interface GroupsScreenProps {
  onSelectGroup: (group: Group) => void;
}

export function GroupsScreen({ onSelectGroup }: GroupsScreenProps) {
  const { theme, isPremium } = useApp();
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [joining, setJoining] = useState(false);
  const [previewGroup, setPreviewGroup] = useState<GroupPreview | null>(null);

  // グループを読み込み
  const loadGroups = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 自分が参加しているグループを取得
      const { data: memberships, error: memberError } = await supabase
        .from('group_members')
        .select('group_id, role')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const groupIds = memberships.map(m => m.group_id);

      // グループ情報を取得
      const { data: groupsData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds);

      if (groupError) throw groupError;

      // メンバー数を取得
      const groupsWithCount = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { count } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const membership = memberships.find(m => m.group_id === group.id);

          return {
            ...group,
            member_count: count || 1,
            is_admin: membership?.role === 'admin' || group.created_by === user.id,
          };
        })
      );

      setGroups(groupsWithCount);
    } catch (error) {
      console.error('Error loading groups:', error);
      showToast('グループの読み込みに失敗しました', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // グループを作成
  const handleCreateGroup = async (data: { name: string; description?: string }) => {
    if (!user) return;

    try {
      const inviteCode = generateSecureCode(6);

      // グループを作成
      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: data.name,
          description: data.description,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 作成者をメンバーとして追加（admin）
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: newGroup.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      setShowCreateModal(false);
      showToast('グループを作成しました');
      loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      showToast('グループの作成に失敗しました', 'error');
    }
  };

  // 招待コードでグループを検索（プレビュー表示）
  const handleSearchGroup = async () => {
    if (!user || !inviteCode.trim()) return;

    setSearching(true);
    try {
      const code = inviteCode.trim().toUpperCase();

      // 招待コードでグループを検索
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', code)
        .single();

      if (groupError || !group) {
        showToast('招待コードが見つかりません', 'error');
        setSearching(false);
        return;
      }

      // 既に参加しているか確認
      const { data: existing } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', group.id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        showToast('すでに参加しています', 'info');
        setSearching(false);
        return;
      }

      // メンバー数を取得
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', group.id);

      // プレビューを表示
      setPreviewGroup({
        ...group,
        member_count: count || 0,
      });
    } catch (error) {
      console.error('Error searching group:', error);
      showToast('グループの検索に失敗しました', 'error');
    } finally {
      setSearching(false);
    }
  };

  // グループに参加
  const handleJoinGroup = async () => {
    if (!user || !previewGroup) return;

    setJoining(true);
    try {
      // メンバーとして追加
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: previewGroup.id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) throw memberError;

      setInviteCode('');
      setPreviewGroup(null);
      showToast('グループに参加しました');
      loadGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      showToast('参加に失敗しました', 'error');
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <Header
        title={t('groups.title')}
        rightAction={
          <IconButton
            icon={<Plus size={18} />}
            onClick={() => setShowCreateModal(true)}
          />
        }
      />

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-auto px-4 pt-2 pb-24 space-y-4">
        {/* 招待コードで参加 */}
        <Card className="!p-3">
          <p className="text-xs mb-2" style={{ color: theme.textMuted }}>{t('groups.enter_code')}</p>
          <div className="flex gap-2 items-center justify-center">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder={t('groups.invite_code')}
              maxLength={6}
              className="w-28 rounded-lg px-3 py-2 outline-none border text-center tracking-widest font-mono text-sm"
              style={{
                background: theme.card,
                color: theme.text,
                borderColor: theme.cardBorder
              }}
            />
            <button
              onClick={handleSearchGroup}
              disabled={!inviteCode.trim() || searching}
              className="px-3 py-2 rounded-lg text-white font-medium text-sm disabled:opacity-50 flex items-center gap-2"
              style={{ background: theme.primary }}
            >
              {searching ? <Loader2 size={14} className="animate-spin" /> : '検索'}
            </button>
          </div>
        </Card>

        {/* 広告バナー（非プレミアムユーザーのみ） */}
        {!isPremium && (
          <AdBanner variant="banner" className="my-2" />
        )}

        {/* グループ一覧 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin" style={{ color: theme.textMuted }} />
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-xs font-medium" style={{ color: theme.textMuted }}>{t('groups.title')}</h3>
            {groups.map((group) => (
              <Card key={group.id} onClick={() => onSelectGroup(group)} className="!p-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${theme.primary}15` }}
                  >
                    <Users size={18} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate" style={{ color: theme.text }}>{group.name}</p>
                      {group.is_admin && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ background: `${theme.accent}20`, color: theme.accent }}
                        >
                          管理者
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>{group.member_count}人</p>
                  </div>
                  <ChevronRight size={16} style={{ color: theme.textMuted }} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={40} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
            <p className="text-sm mb-1" style={{ color: theme.textSecondary }}>グループに参加していません</p>
            <p className="text-xs" style={{ color: theme.textMuted }}>
              グループを作成するか、招待コードで参加
            </p>
          </div>
        )}

        {/* 新規作成ボタン */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full rounded-xl py-3 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
          style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
        >
          <Plus size={16} />
          <span className="text-sm">新しいグループを作成</span>
        </button>

        {/* ネイティブ広告（非プレミアムユーザーのみ） */}
        {!isPremium && groups.length >= 1 && (
          <NativeAd />
        )}
      </div>

      {/* グループ作成モーダル */}
      {showCreateModal && (
        <CreateGroupModal
          theme={theme}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateGroup}
        />
      )}

      {/* グループプレビューモーダル */}
      {previewGroup && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in px-4"
          onClick={() => setPreviewGroup(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 animate-slide-up"
            style={{ background: theme.card }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-lg" style={{ color: theme.text }}>グループに参加</h3>
              <button onClick={() => setPreviewGroup(null)}>
                <X size={24} style={{ color: theme.textSecondary }} />
              </button>
            </div>

            {/* グループ情報 */}
            <div className="text-center py-4">
              <div
                className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center overflow-hidden mb-4"
                style={{ background: theme.gradient }}
              >
                {previewGroup.icon_url ? (
                  <img src={previewGroup.icon_url} alt={previewGroup.name} className="w-full h-full object-cover" />
                ) : (
                  <Users size={32} className="text-white" />
                )}
              </div>
              <h4 className="font-bold text-xl mb-1" style={{ color: theme.text }}>{previewGroup.name}</h4>
              <p className="text-sm mb-2" style={{ color: theme.textMuted }}>{previewGroup.member_count}人のメンバー</p>
              {previewGroup.description && (
                <p className="text-sm" style={{ color: theme.textSecondary }}>{previewGroup.description}</p>
              )}
            </div>

            <p className="text-center text-sm mb-4" style={{ color: theme.textSecondary }}>
              このグループに参加しますか？
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPreviewGroup(null)}
                className="flex-1 py-3 rounded-xl font-medium"
                style={{ background: theme.bg, color: theme.textSecondary }}
              >
                キャンセル
              </button>
              <button
                onClick={handleJoinGroup}
                disabled={joining}
                className="flex-1 py-3 rounded-xl text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: theme.gradient }}
              >
                {joining ? <Loader2 size={16} className="animate-spin" /> : '参加する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
