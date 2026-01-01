'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Users, ChevronRight, GitBranch, X, Copy, Check, ChevronLeft } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Group, Flow } from '@/types';

interface LocalGroup {
  id: string;
  name: string;
  description?: string;
  invite_code: string;
  created_by: string;
  members: string[];
  created_at: string;
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
  const [groups, setGroups] = useState<LocalGroup[]>([]);

  // localStorageからグループを読み込み
  useEffect(() => {
    const saved = localStorage.getItem('bjj-hub-groups');
    if (saved) {
      setGroups(JSON.parse(saved));
    }
  }, []);

  // グループを保存
  const saveGroups = (newGroups: LocalGroup[]) => {
    setGroups(newGroups);
    localStorage.setItem('bjj-hub-groups', JSON.stringify(newGroups));
  };

  // グループを作成
  const handleCreateGroup = (data: { name: string; description?: string }) => {
    if (!user) return;
    
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newGroup: LocalGroup = {
      id: `group-${Date.now()}`,
      name: data.name,
      description: data.description,
      invite_code: inviteCode,
      created_by: user.id,
      members: [user.id],
      created_at: new Date().toISOString(),
    };
    
    saveGroups([...groups, newGroup]);
    setShowCreateModal(false);
    showToast('グループを作成しました');
  };

  // 招待コードで参加
  const handleJoinGroup = () => {
    if (!user || !inviteCode.trim()) return;
    
    const code = inviteCode.trim().toUpperCase();
    const group = groups.find(g => g.invite_code === code);
    
    if (!group) {
      showToast('招待コードが見つかりません', 'error');
      return;
    }
    
    if (group.members.includes(user.id)) {
      showToast('すでに参加しています', 'info');
      return;
    }
    
    const updated = groups.map(g => 
      g.id === group.id 
        ? { ...g, members: [...g.members, user.id] }
        : g
    );
    saveGroups(updated);
    setInviteCode('');
    showToast('グループに参加しました');
  };

  // ユーザーが参加しているグループのみ表示
  const myGroups = groups.filter(g => user && g.members.includes(user.id));

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
              disabled={!inviteCode.trim()}
              className="px-4 rounded-lg text-white font-medium disabled:opacity-50"
              style={{ background: theme.gradient }}
            >
              参加
            </button>
          </div>
        </Card>

        {/* グループ一覧 */}
        {myGroups.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-white/50 text-sm font-medium">参加中のグループ</h3>
            {myGroups.map((group) => (
              <Card key={group.id} onClick={() => onSelectGroup(group as any)}>
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
                      {user && group.created_by === user.id && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: `${theme.accent}20`, color: theme.accent }}
                        >
                          管理者
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-sm mt-0.5">{group.members.length}人</p>
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

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in"
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
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl text-white font-semibold mt-4 disabled:opacity-50"
            style={{ background: theme.gradient }}
          >
            作成
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
  const [localGroup, setLocalGroup] = useState<LocalGroup | null>(null);

  // localStorageからグループ情報を取得
  useEffect(() => {
    const saved = localStorage.getItem('bjj-hub-groups');
    if (saved) {
      const groups: LocalGroup[] = JSON.parse(saved);
      const found = groups.find(g => g.id === group.id);
      if (found) {
        setLocalGroup(found);
      }
    }
  }, [group.id]);

  const handleCopyCode = () => {
    if (localGroup?.invite_code) {
      navigator.clipboard.writeText(localGroup.invite_code);
      setCopied(true);
      showToast('招待コードをコピーしました');
      setTimeout(() => setCopied(false), 2000);
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
              <p className="text-white/40 text-sm">{localGroup?.members.length || 1}人のメンバー</p>
            </div>
          </div>
          {group.description && (
            <p className="text-white/60 text-sm">{group.description}</p>
          )}
        </Card>

        {/* 招待コード */}
        {localGroup && (
          <Card>
            <p className="text-white/50 text-sm mb-2">招待コード</p>
            <div className="flex items-center gap-3">
              <div
                className="flex-1 py-3 px-4 rounded-lg text-center text-2xl font-mono tracking-widest text-white"
                style={{ background: theme.card }}
              >
                {localGroup.invite_code}
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
      </div>
    </div>
  );
}
