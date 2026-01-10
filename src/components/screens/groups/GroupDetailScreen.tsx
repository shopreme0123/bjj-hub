'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Copy, Check, Pencil, Trash2, GitBranch, BookOpen, Loader2, ChevronRight, Shield, ShieldOff, UserMinus } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { supabase } from '@/lib/supabase';
import { Group, Flow, Technique } from '@/types';
import { getGroupSharedContent, deleteGroupSharedContent, GroupSharedContent } from '@/lib/shared-content';
import { EditGroupModal } from './modals';

interface GroupMember {
  id: string;
  user_id: string;
  role: 'admin' | 'member';
  display_name?: string;
  avatar_url?: string;
}

interface GroupDetailScreenProps {
  group: Group;
  onBack: () => void;
  onOpenFlow?: (flow: Flow) => void;
  onOpenTechnique?: (technique: Technique) => void;
}

export function GroupDetailScreen({ group, onBack, onOpenFlow, onOpenTechnique }: GroupDetailScreenProps) {
  const { theme, addTechnique, addFlow } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(group);
  const [sharedContent, setSharedContent] = useState<GroupSharedContent[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [activeTab, setActiveTab] = useState<'techniques' | 'flows' | 'members'>('techniques');
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'member'>('member');

  // ユーザーがadminかどうかはgroup_membersのroleで判定
  const isAdmin = userRole === 'admin';

  // グループ情報とユーザーのロールを取得
  useEffect(() => {
    const loadGroupInfo = async () => {
      if (!user) return;

      try {
        // メンバー数を取得
        const { count } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', currentGroup.id);

        setMemberCount(count || 1);

        // 現在のユーザーのロールを取得
        const { data: membership } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', currentGroup.id)
          .eq('user_id', user.id)
          .single();

        if (membership) {
          setUserRole(membership.role as 'admin' | 'member');
        }
      } catch (error) {
        console.error('Error loading group info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGroupInfo();
  }, [currentGroup.id, user]);

  // メンバー一覧を取得
  const loadMembers = useCallback(async () => {
    if (!user) return;
    setLoadingMembers(true);

    try {
      // グループメンバーとユーザー情報を取得
      const { data: memberData, error } = await supabase
        .from('group_members')
        .select('id, user_id, role')
        .eq('group_id', currentGroup.id);

      if (error) throw error;

      // ユーザー情報を取得（profilesテーブルから）
      const userIds = memberData?.map(m => m.user_id) || [];
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);

      const membersWithUsers = (memberData || []).map(member => {
        const userData = usersData?.find(u => u.id === member.user_id);
        return {
          ...member,
          display_name: userData?.display_name || '名前未設定',
          avatar_url: userData?.avatar_url,
        };
      });

      setMembers(membersWithUsers);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoadingMembers(false);
    }
  }, [currentGroup.id, user]);

  // メンバータブ選択時にメンバーを読み込み
  useEffect(() => {
    if (activeTab === 'members') {
      loadMembers();
    }
  }, [activeTab, loadMembers]);

  // 共有コンテンツを取得
  const loadSharedContent = useCallback(async () => {
    setLoadingContent(true);
    try {
      const content = await getGroupSharedContent(currentGroup.id);
      setSharedContent(content);
    } catch (error) {
      console.error('Error loading shared content:', error);
    } finally {
      setLoadingContent(false);
    }
  }, [currentGroup.id]);

  useEffect(() => {
    loadSharedContent();
  }, [loadSharedContent]);

  // フィルタされたコンテンツ
  const filteredContent = sharedContent.filter(c =>
    activeTab === 'techniques' ? c.content_type === 'technique' : c.content_type === 'flow'
  );

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
      // まず共有コンテンツを削除
      await supabase
        .from('group_shared_content')
        .delete()
        .eq('group_id', currentGroup.id);

      // メンバーを削除
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', currentGroup.id);

      // グループを削除（管理者なら誰でも削除可能）
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', currentGroup.id);

      if (error) throw error;

      showToast('グループを削除しました');
      onBack();
    } catch (error) {
      console.error('Error deleting group:', error);
      showToast('削除に失敗しました', 'error');
    }
  };

  // 共有コンテンツをインポート
  const handleImportContent = async (content: GroupSharedContent) => {
    try {
      if (content.content_type === 'technique') {
        const tech = content.content_data;
        await addTechnique({
          name: tech.name,
          name_en: tech.name_en || '',
          technique_type: tech.technique_type,
          category: tech.category,
          description: tech.description || '',
          video_url: tech.video_url || '',
          video_type: 'youtube',
          tags: tech.tags || [],
          mastery_level: 'learning',
        });
        showToast('技をインポートしました');
      } else if (content.content_type === 'flow') {
        const flowData = content.content_data;
        await addFlow({
          name: flowData.name,
          description: flowData.description || '',
          tags: flowData.tags || [],
          flow_data: flowData.flow_data || { nodes: [], edges: [] },
          is_favorite: false,
        });
        showToast('フローをインポートしました');
      }
    } catch (error) {
      console.error('Import error:', error);
      showToast('インポートに失敗しました', 'error');
    }
  };

  // 共有コンテンツを削除
  const handleDeleteContent = async (content: GroupSharedContent) => {
    if (!user) return;
    if (content.shared_by !== user.id && !isAdmin) {
      showToast('削除権限がありません', 'error');
      return;
    }

    if (!confirm('この共有を削除しますか？')) return;

    try {
      const result = await deleteGroupSharedContent(content.id, user.id);
      if (result.success) {
        setSharedContent(prev => prev.filter(c => c.id !== content.id));
        showToast('共有を削除しました');
      } else {
        showToast(result.error || '削除に失敗しました', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast('削除に失敗しました', 'error');
    }
  };

  // メンバーのロールを変更
  const handleChangeRole = async (member: GroupMember, newRole: 'admin' | 'member') => {
    if (!user || !isAdmin) return;
    if (member.user_id === user.id) {
      showToast('自分自身のロールは変更できません', 'error');
      return;
    }

    const action = newRole === 'admin' ? '管理者に昇格' : '管理者から解除';
    if (!confirm(`${member.display_name}を${action}しますか？`)) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: newRole })
        .eq('id', member.id);

      if (error) throw error;

      setMembers(prev => prev.map(m =>
        m.id === member.id ? { ...m, role: newRole } : m
      ));
      showToast(`${member.display_name}を${action}しました`);
    } catch (error) {
      console.error('Error changing role:', error);
      showToast('ロール変更に失敗しました', 'error');
    }
  };

  // メンバーをグループから削除
  const handleRemoveMember = async (member: GroupMember) => {
    if (!user || !isAdmin) return;
    if (member.user_id === user.id) {
      showToast('自分自身を削除することはできません', 'error');
      return;
    }

    if (!confirm(`${member.display_name}をグループから削除しますか？`)) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      setMembers(prev => prev.filter(m => m.id !== member.id));
      setMemberCount(prev => prev - 1);
      showToast(`${member.display_name}を削除しました`);
    } catch (error) {
      console.error('Error removing member:', error);
      showToast('メンバー削除に失敗しました', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <Header title={currentGroup.name} showBack onBack={onBack} />

      <div className="flex-1 overflow-auto px-4 pt-2 pb-24 space-y-4">
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

        {/* タブ */}
        <div>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('techniques')}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
              style={{
                background: activeTab === 'techniques' ? theme.gradient : theme.card,
                color: activeTab === 'techniques' ? 'white' : theme.textSecondary,
                border: activeTab !== 'techniques' ? `1px solid ${theme.cardBorder}` : 'none',
              }}
            >
              <BookOpen size={14} />
              技
            </button>
            <button
              onClick={() => setActiveTab('flows')}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
              style={{
                background: activeTab === 'flows' ? theme.gradient : theme.card,
                color: activeTab === 'flows' ? 'white' : theme.textSecondary,
                border: activeTab !== 'flows' ? `1px solid ${theme.cardBorder}` : 'none',
              }}
            >
              <GitBranch size={14} />
              フロー
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1"
              style={{
                background: activeTab === 'members' ? theme.gradient : theme.card,
                color: activeTab === 'members' ? 'white' : theme.textSecondary,
                border: activeTab !== 'members' ? `1px solid ${theme.cardBorder}` : 'none',
              }}
            >
              <Users size={14} />
              メンバー
            </button>
          </div>

          {/* メンバー一覧 */}
          {activeTab === 'members' ? (
            loadingMembers ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin" style={{ color: theme.textMuted }} />
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <Card key={member.id}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ background: `${theme.primary}20` }}
                      >
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Users size={18} style={{ color: theme.primary }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate" style={{ color: theme.text }}>
                            {member.display_name}
                          </p>
                          {member.role === 'admin' && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ background: `${theme.accent}20`, color: theme.accent }}
                            >
                              管理者
                            </span>
                          )}
                          {member.user_id === user?.id && (
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                              style={{ background: `${theme.primary}20`, color: theme.primary }}
                            >
                              あなた
                            </span>
                          )}
                        </div>
                      </div>
                      {/* 管理者のみメンバー管理ボタンを表示 */}
                      {isAdmin && member.user_id !== user?.id && (
                        <div className="flex gap-1">
                          {member.role === 'member' ? (
                            <button
                              onClick={() => handleChangeRole(member, 'admin')}
                              className="p-2 rounded-lg"
                              style={{ background: `${theme.accent}10` }}
                              title="管理者に昇格"
                            >
                              <Shield size={16} style={{ color: theme.accent }} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChangeRole(member, 'member')}
                              className="p-2 rounded-lg"
                              style={{ background: 'rgba(156, 163, 175, 0.1)' }}
                              title="管理者から解除"
                            >
                              <ShieldOff size={16} style={{ color: '#9CA3AF' }} />
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member)}
                            className="p-2 rounded-lg"
                            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                            title="グループから削除"
                          >
                            <UserMinus size={16} className="text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
                {isAdmin && (
                  <p className="text-xs text-center mt-4" style={{ color: theme.textMuted }}>
                    招待コードを共有してメンバーを追加できます
                  </p>
                )}
              </div>
            )
          ) : (
            /* 共有コンテンツ一覧 */
            loadingContent ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin" style={{ color: theme.textMuted }} />
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="space-y-2">
                {filteredContent.map((content) => (
                  <Card key={content.id}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: `${theme.primary}20` }}
                      >
                        {content.content_type === 'technique' ? (
                          <BookOpen size={18} style={{ color: theme.primary }} />
                        ) : (
                          <GitBranch size={18} style={{ color: theme.primary }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: theme.text }}>
                          {content.title}
                        </p>
                        {content.description && (
                          <p className="text-xs truncate" style={{ color: theme.textSecondary }}>
                            {content.description}
                          </p>
                        )}
                        <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                          {new Date(content.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleImportContent(content)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ background: theme.gradient, color: 'white' }}
                        >
                          追加
                        </button>
                        {(content.shared_by === user?.id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteContent(content)}
                            className="p-1.5 rounded-lg"
                            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                          >
                            <Trash2 size={14} className="text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                {activeTab === 'techniques' ? (
                  <>
                    <BookOpen size={32} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
                    <p className="text-sm" style={{ color: theme.textSecondary }}>共有された技はありません</p>
                  </>
                ) : (
                  <>
                    <GitBranch size={32} className="mx-auto mb-3" style={{ color: theme.textMuted }} />
                    <p className="text-sm" style={{ color: theme.textSecondary }}>共有されたフローはありません</p>
                  </>
                )}
                <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                  技やフローの共有ボタンからグループに共有できます
                </p>
              </Card>
            )
          )}
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
