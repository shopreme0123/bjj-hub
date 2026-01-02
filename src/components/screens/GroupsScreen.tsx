'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, ChevronRight, GitBranch, X, Copy, Check, ChevronLeft, Loader2, Pencil, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Group, Flow } from '@/types';

interface GroupWithMembers extends Group {
  member_count: number;
  is_admin: boolean;
}

interface GroupsScreenProps {
  onSelectGroup: (group: Group) => void;
}

export function GroupsScreen({ onSelectGroup }: GroupsScreenProps) {
  const { theme } = useApp();
  const { user } = useAuth();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groups, setGroups] = useState<GroupWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

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
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

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

  // 招待コードで参加
  const handleJoinGroup = async () => {
    if (!user || !inviteCode.trim()) return;

    setJoining(true);
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
        setJoining(false);
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
        setJoining(false);
        return;
      }

      // メンバーとして追加
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member',
        });

      if (memberError) throw memberError;

      setInviteCode('');
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
      <div
        className="absolute top-0 left-0 right-0 h-48 rounded-b-3xl"
        style={{ background: theme.gradient }}
      />

      <Header title={t('groups.title')} />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-4 relative z-10">
        {/* 招待コードで参加 */}
        <Card>
          <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>{t('groups.enter_code')}</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder={t('groups.invite_code')}
              maxLength={6}
              className="flex-1 rounded-lg px-4 py-2.5 outline-none border text-center tracking-widest font-mono"
              style={{ 
                background: theme.card, 
                color: theme.text, 
                borderColor: theme.cardBorder 
              }}
            />
            <button
              onClick={handleJoinGroup}
              disabled={!inviteCode.trim() || joining}
              className="px-4 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-2"
              style={{ background: theme.gradient }}
            >
              {joining ? <Loader2 size={16} className="animate-spin" /> : t('groups.join')}
            </button>
          </div>
        </Card>

        {/* グループ一覧 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin" style={{ color: theme.textMuted }} />
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium" style={{ color: theme.textSecondary }}>{t('groups.title')}</h3>
            {groups.map((group) => (
              <Card key={group.id} onClick={() => onSelectGroup(group)}>
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ background: theme.gradient }}
                  >
                    <Users size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium" style={{ color: theme.text }}>{group.name}</p>
                      {group.is_admin && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: `${theme.accent}20`, color: theme.accent }}
                        >
                          管理者
                        </span>
                      )}
                    </div>
                    <p className="text-sm mt-0.5" style={{ color: theme.textSecondary }}>{group.member_count}人</p>
                  </div>
                  <ChevronRight size={18} style={{ color: theme.textMuted }} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4" style={{ color: theme.textMuted }} />
            <p className="mb-2" style={{ color: theme.textSecondary }}>グループに参加していません</p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              グループを作成するか、招待コードで参加してください
            </p>
          </div>
        )}

        {/* 新規作成ボタン */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full rounded-xl py-4 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
          style={{ borderColor: theme.cardBorder, color: theme.textSecondary }}
        >
          <Plus size={18} />
          <span className="text-sm">新しいグループを作成</span>
        </button>
      </div>

      {/* グループ作成モーダル */}
      {showCreateModal && (
        <CreateGroupModal
          theme={theme}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateGroup}
        />
      )}
    </div>
  );
}

// グループ作成モーダル
interface CreateGroupModalProps {
  theme: any;
  onClose: () => void;
  onSave: (data: { name: string; description?: string }) => void;
}

function CreateGroupModal({ theme, onClose, onSave }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
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
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>グループを作成</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
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
            disabled={!name.trim() || saving}
            className="w-full py-4 rounded-xl text-white font-semibold mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: theme.gradient }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : '作成'}
          </button>
        </div>
      </div>
    </div>
  );
}

// グループ詳細画面
interface GroupDetailScreenProps {
  group: Group;
  onBack: () => void;
  onOpenFlow?: (flow: Flow) => void;
}

export function GroupDetailScreen({ group, onBack }: GroupDetailScreenProps) {
  const { theme } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(group);

  const isAdmin = user?.id === currentGroup.created_by;

  // グループ情報を取得
  useEffect(() => {
    const loadGroupInfo = async () => {
      try {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', currentGroup.id);

        setMemberCount(count || 1);
      } catch (error) {
        console.error('Error loading group info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupInfo();
  }, [currentGroup.id]);

  const handleCopyCode = () => {
    if (currentGroup.invite_code) {
      navigator.clipboard.writeText(currentGroup.invite_code);
      setCopied(true);
      showToast('招待コードをコピーしました');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    
    if (!confirm('このグループから退出しますか？')) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', currentGroup.id)
        .eq('user_id', user.id);

      if (error) throw error;

      showToast('グループから退出しました');
      onBack();
    } catch (error) {
      console.error('Error leaving group:', error);
      showToast('退出に失敗しました', 'error');
    }
  };

  const handleUpdateGroup = async (updates: { name: string; description?: string }) => {
    if (!user || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', currentGroup.id)
        .eq('created_by', user.id);

      if (error) throw error;

      setCurrentGroup({ ...currentGroup, ...updates });
      setShowEditModal(false);
      showToast('グループを更新しました');
    } catch (error) {
      console.error('Error updating group:', error);
      showToast('更新に失敗しました', 'error');
    }
  };

  const handleDeleteGroup = async () => {
    if (!user || !isAdmin) return;
    
    if (!confirm('このグループを削除しますか？メンバー全員がグループから退出されます。')) return;

    try {
      // まずメンバーを削除
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', currentGroup.id);

      // グループを削除
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', currentGroup.id)
        .eq('created_by', user.id);

      if (error) throw error;

      showToast('グループを削除しました');
      onBack();
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast('削除に失敗しました', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <Header title={currentGroup.name} showBack onBack={onBack} />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-4">
        {/* グループ情報 */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center"
              style={{ background: theme.gradient }}
            >
              <Users size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-lg" style={{ color: theme.text }}>{currentGroup.name}</h2>
              <p className="text-sm" style={{ color: theme.textSecondary }}>{memberCount}人のメンバー</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-lg"
                style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
              >
                <Pencil size={16} style={{ color: theme.textSecondary }} />
              </button>
            )}
          </div>
          {currentGroup.description && (
            <p className="text-sm" style={{ color: theme.text }}>{currentGroup.description}</p>
          )}
        </Card>

        {/* 招待コード */}
        {currentGroup.invite_code && (
          <Card>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>招待コード</p>
            <div className="flex items-center gap-3">
              <div
                className="flex-1 py-3 px-4 rounded-lg text-center text-2xl font-mono tracking-widest"
                style={{ background: theme.card, color: theme.text, border: `1px solid ${theme.cardBorder}` }}
              >
                {currentGroup.invite_code}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-lg"
                style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} style={{ color: theme.textSecondary }} />
                )}
              </button>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: theme.textMuted }}>
              このコードを共有してメンバーを招待
            </p>
          </Card>
        )}

        {/* 共有フロー（今後実装） */}
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>共有フロー</h3>
          <Card className="text-center py-8">
            <GitBranch size={32} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
            <p className="text-sm" style={{ color: theme.textSecondary }}>共有フローはまだありません</p>
            <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
              今後のアップデートで追加予定
            </p>
          </Card>
        </div>

        {/* 管理者用: グループ削除 */}
        {isAdmin && (
          <button
            onClick={handleDeleteGroup}
            className="w-full py-3 rounded-xl text-red-500 flex items-center justify-center gap-2 text-sm"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <Trash2 size={16} />
            グループを削除
          </button>
        )}

        {/* 退出ボタン */}
        {!isAdmin && (
          <button
            onClick={handleLeaveGroup}
            className="w-full py-3 rounded-xl text-red-400 flex items-center justify-center gap-2 text-sm"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            グループから退出
          </button>
        )}
      </div>

      {/* グループ編集モーダル */}
      {showEditModal && (
        <EditGroupModal
          theme={theme}
          group={currentGroup}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdateGroup}
        />
      )}
    </div>
  );
}

// グループ編集モーダル
interface EditGroupModalProps {
  theme: any;
  group: Group;
  onClose: () => void;
  onSave: (updates: { name: string; description?: string }) => Promise<void>;
}

function EditGroupModal({ theme, group, onClose, onSave }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [description, setDescription] = useState(group.description || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({
      name: name.trim(),
      description: description.trim() || undefined,
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
            disabled={!name.trim() || saving}
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
