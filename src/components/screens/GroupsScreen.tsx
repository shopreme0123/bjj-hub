'use client';

import React, { useState } from 'react';
import { Plus, Users, ChevronRight, GitBranch, X } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Group } from '@/types';

// サンプルデータ
const sampleGroups: (Group & { members: number; newFlows: number; isAdmin?: boolean })[] = [
  {
    id: '1',
    name: 'BJJ Tokyo',
    description: '東京の柔術愛好家グループ',
    created_by: 'demo',
    members: 24,
    newFlows: 3,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    name: '青帯研究会',
    description: '青帯向けの技術研究グループ',
    created_by: 'demo',
    members: 8,
    newFlows: 0,
    isAdmin: true,
    created_at: '',
    updated_at: '',
  },
];

const sampleSharedFlows = [
  { id: '1', name: 'デラヒーバからのバックテイク', author: '山田さん', date: '2日前' },
  { id: '2', name: 'ハーフガードパス5選', author: '佐藤さん', date: '5日前' },
  { id: '3', name: 'ベリンボロ入門', author: '鈴木さん', date: '1週間前' },
];

interface GroupsScreenProps {
  onSelectGroup: (group: Group) => void;
}

export function GroupsScreen({ onSelectGroup }: GroupsScreenProps) {
  const { theme } = useApp();
  const [inviteCode, setInviteCode] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <div
        className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
        style={{ background: theme.gradient }}
      />

      <Header title="グループ" />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-3 relative z-10">
        {/* グループ一覧 */}
        {sampleGroups.map((group) => (
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
                  {group.isAdmin && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: `${theme.accent}20`, color: theme.accent }}
                    >
                      管理者
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-sm mt-0.5">{group.members}人</p>
              </div>
              {group.newFlows > 0 && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: theme.gradient }}
                >
                  {group.newFlows}
                </div>
              )}
              <ChevronRight size={18} className="text-white/20" />
            </div>
          </Card>
        ))}

        {/* 招待コード */}
        <Card>
          <p className="text-white/50 text-sm mb-3">招待コードで参加</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="コードを入力"
              className="flex-1 bg-black/20 rounded-lg px-3 py-2 text-white text-sm outline-none placeholder:text-white/30"
              style={{ border: `1px solid ${theme.cardBorder}` }}
            />
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: theme.gradient }}
            >
              参加
            </button>
          </div>
        </Card>

        {/* グループ作成ボタン */}
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
        <CreateGroupModal theme={theme} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}

// グループ詳細画面
interface GroupDetailProps {
  group: Group;
  onBack: () => void;
  onOpenFlow?: (flow: any) => void;
}

export function GroupDetailScreen({ group, onBack, onOpenFlow }: GroupDetailProps) {
  const { theme } = useApp();
  const [activeTab, setActiveTab] = useState<'flows' | 'members'>('flows');

  return (
    <div className="flex flex-col h-full">
      <Header title={group.name} showBack onBack={onBack} />

      {/* グループ情報 */}
      <div className="px-5 pb-4 border-b" style={{ borderColor: theme.cardBorder }}>
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ background: theme.gradient }}
          >
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">{group.name}</h2>
            <p className="text-white/50 text-sm">メンバー 24人</p>
          </div>
        </div>
      </div>

      {/* タブ */}
      <div className="flex border-b" style={{ borderColor: theme.cardBorder }}>
        {[
          { id: 'flows', label: '共有フロー' },
          { id: 'members', label: 'メンバー' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex-1 py-3 text-sm transition-all"
            style={{
              color: activeTab === tab.id ? theme.accent : 'rgba(255,255,255,0.4)',
              borderBottom: activeTab === tab.id ? `2px solid ${theme.accent}` : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-5 py-4 pb-24 space-y-3">
        {activeTab === 'flows' ? (
          sampleSharedFlows.map((flow) => (
            <Card key={flow.id} onClick={() => onOpenFlow?.({ id: flow.id, name: flow.name, user_id: 'demo', tags: [], is_favorite: false, created_at: '', updated_at: '' })}>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: `${theme.primary}20` }}
                >
                  <GitBranch size={18} style={{ color: theme.primary }} />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{flow.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">
                    {flow.author} • {flow.date}
                  </p>
                </div>
                <ChevronRight size={16} className="text-white/20" />
              </div>
            </Card>
          ))
        ) : (
          <div className="space-y-3">
            {['山田 太郎', '佐藤 花子', '鈴木 一郎', '田中 美咲'].map((name, i) => (
              <Card key={i} className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: theme.gradient }}
                >
                  <span className="text-white text-sm font-medium">
                    {name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{name}</p>
                  <p className="text-white/40 text-xs">🟦 青帯</p>
                </div>
                {i === 0 && (
                  <span
                    className="text-[10px] px-2 py-0.5 rounded"
                    style={{ background: `${theme.accent}20`, color: theme.accent }}
                  >
                    管理者
                  </span>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// グループ作成モーダル
interface CreateGroupModalProps {
  theme: any;
  onClose: () => void;
}

function CreateGroupModal({ theme, onClose }: CreateGroupModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in">
      <div
        className="w-full rounded-t-3xl p-5 max-h-[70%] overflow-auto animate-slide-up"
        style={{ background: theme.bg }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold text-lg">グループを作成</h3>
          <button onClick={onClose}>
            <X size={24} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-4">
          {/* グループ名 */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">グループ名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: BJJ Tokyo"
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="グループの説明..."
              rows={3}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30 resize-none"
            />
          </div>

          {/* 作成ボタン */}
          <button
            onClick={onClose}
            disabled={!name}
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
