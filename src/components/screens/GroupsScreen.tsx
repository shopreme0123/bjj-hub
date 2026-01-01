'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Users, ChevronRight, GitBranch, X, Copy, Check, ChevronLeft, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
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
    <div className="flex flex-col h-full">
      <div
        className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
        style={{ background: theme.gradient }}
      />

      <Header title="グループ" />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-4 relative z-10">
        {/* 招待コードで参加 */}
        <Card>
          <p className="text-white/50 text-sm mb-3">招待コードで参加</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="招待コードを入力"
              maxLength={6}
              className="flex-1 bg-white/5 rounded-lg px-4 py-2.5 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30 text-center tracking-widest font-mono"
            />
            <button
              onClick={handleJoinGroup}
              disabled={!inviteCode.trim() || joining}
              className="px-4 rounded-lg text-white font-medium disabled:opacity-50 flex items-center gap-2"
              style={{ background: theme.gradient }}
            >
              {joining ? <Loader2 size={16} className="animate-spin" /> : '参加'}
            </button>
          </div>
        </Card>

        {/* グループ一覧 */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin text-white/30" />
          </div>
        ) : groups.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-white/50 text-sm font-medium">参加中のグループ</h3>
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
                      <p className="text-white font-medium">{group.name}</p>
                      {group.is_admin && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: `${theme.accent}20`, color: theme.accent }}
                        >
                          管理者
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm mt-0.5">{group.member_count}人</p>
                  </div>
                  <ChevronRight size={18} className="text-white/20" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/40 mb-2">グループに参加していません</p>
            <p className="text-white/30 text-sm">
              グループを作成するか、招待コードで参加してください
            </p>
          </div>
        )}

        {/* 新規作成ボタン */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full rounded-xl py-4 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
          style={{ borderColor: theme.cardBorder, color: 'rgba(255,255,255,0.4)' }}
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
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold text-lg">グループを作成</h3>
          <button onClick={onClose}>
            <X size={24} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-white/50 text-sm mb-2 block">グループ名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 青帯研究会"
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30"
            />
          </div>

          <div>
            <label className="text-white/50 text-sm mb-2 block">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="グループの説明..."
              rows={2}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30 resize-none"
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

  // グループ情報を取得
  useEffect(() => {
    const loadGroupInfo = async () => {
      try {
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        setMemberCount(count || 1);
      } catch (error) {
        console.error('Error loading group info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupInfo();
  }, [group.id]);

  const handleCopyCode = () => {
    if (group.invite_code) {
      navigator.clipboard.writeText(group.invite_code);
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
        .eq('group_id', group.id)
        .eq('user_id', user.id);

      if (error) throw error;

      showToast('グループから退出しました');
      onBack();
    } catch (error) {
      console.error('Error leaving group:', error);
      showToast('退出に失敗しました', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <Header title={group.name} showBack onBack={onBack} />

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
            <div>
              <h2 className="text-white font-semibold text-lg">{group.name}</h2>
              <p className="text-white/40 text-sm">{memberCount}人のメンバー</p>
            </div>
          </div>
          {group.description && (
            <p className="text-white/60 text-sm">{group.description}</p>
          )}
        </Card>

        {/* 招待コード */}
        {group.invite_code && (
          <Card>
            <p className="text-white/50 text-sm mb-2">招待コード</p>
            <div className="flex items-center gap-3">
              <div
                className="flex-1 py-3 px-4 rounded-lg text-center text-2xl font-mono tracking-widest text-white"
                style={{ background: theme.card }}
              >
                {group.invite_code}
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 rounded-lg"
                style={{ background: theme.card }}
              >
                {copied ? (
                  <Check size={20} className="text-green-400" />
                ) : (
                  <Copy size={20} className="text-white/60" />
                )}
              </button>
            </div>
            <p className="text-white/30 text-xs mt-2 text-center">
              このコードを共有してメンバーを招待
            </p>
          </Card>
        )}

        {/* 共有フロー（今後実装） */}
        <div>
          <h3 className="text-white/50 text-sm font-medium mb-3">共有フロー</h3>
          <Card className="text-center py-8">
            <GitBranch size={32} className="mx-auto mb-3 text-white/20" />
            <p className="text-white/40 text-sm">共有フローはまだありません</p>
            <p className="text-white/30 text-xs mt-2">
              今後のアップデートで追加予定
            </p>
          </Card>
        </div>

        {/* 退出ボタン */}
        <button
          onClick={handleLeaveGroup}
          className="w-full py-3 rounded-xl text-red-400 flex items-center justify-center gap-2 text-sm"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          グループから退出
        </button>
      </div>
    </div>
  );
}
