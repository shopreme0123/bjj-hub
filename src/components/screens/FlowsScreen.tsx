'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, GitBranch, Star, X, Link, GripVertical, Trash2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Flow } from '@/types';

interface FlowsScreenProps {
  onOpenEditor: (flow?: Flow) => void;
}

export function FlowsScreen({ onOpenEditor }: FlowsScreenProps) {
  const { theme, flows, addFlow, updateFlow, deleteFlow } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'favorite'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredFlows = flows.filter((flow) => {
    if (activeTab === 'favorite') return flow.is_favorite;
    return true;
  });

  const handleAddFlow = (data: { name: string; description?: string; tags: string[] }) => {
    addFlow({
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_favorite: false,
    });
    setShowAddModal(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent, flow: Flow) => {
    e.stopPropagation();
    updateFlow(flow.id, { is_favorite: !flow.is_favorite });
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
        style={{ background: theme.gradient }}
      />

      <Header
        title="コンビネーション"
        rightAction={
          <button
            className="p-2 rounded-full relative z-10"
            style={{ background: theme.card }}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} style={{ color: theme.primary }} />
          </button>
        }
      />

      {/* タブ */}
      <div className="flex gap-2 px-5 pb-4 relative z-10">
        {[
          { id: 'all', label: 'すべて' },
          { id: 'favorite', label: 'お気に入り' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: activeTab === tab.id ? theme.gradient : 'transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
              border: activeTab === tab.id ? 'none' : `1px solid ${theme.cardBorder}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-3 relative z-10">
        {filteredFlows.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40 mb-4">
              {activeTab === 'favorite' ? 'お気に入りのフローがありません' : 'フローが登録されていません'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ background: theme.gradient, color: 'white' }}
            >
              フローを作成
            </button>
          </div>
        ) : (
          filteredFlows.map((flow) => (
            <Card key={flow.id} onClick={() => onOpenEditor(flow)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: theme.gradient }}
                  >
                    <GitBranch size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{flow.name}</p>
                    <p className="text-white/30 text-xs mt-0.5">
                      {flow.description || 'タップして編集'}
                    </p>
                  </div>
                </div>
                <button onClick={(e) => handleToggleFavorite(e, flow)}>
                  <Star 
                    size={16} 
                    style={{ color: flow.is_favorite ? theme.accent : 'rgba(255,255,255,0.3)' }} 
                    fill={flow.is_favorite ? theme.accent : 'transparent'} 
                  />
                </button>
              </div>
              {flow.tags.length > 0 && (
                <div className="flex gap-2">
                  {flow.tags.map((tag, j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: `${theme.primary}15`, color: theme.accent }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}

        {/* 新規作成ボタン */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full rounded-xl py-4 border-2 border-dashed flex items-center justify-center gap-2 transition-all hover:border-solid"
          style={{ borderColor: theme.cardBorder, color: 'rgba(255,255,255,0.4)' }}
        >
          <Plus size={18} />
          <span className="text-sm">新しいフローを作成</span>
        </button>
      </div>

      {/* フロー作成モーダル */}
      {showAddModal && (
        <AddFlowModal
          theme={theme}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddFlow}
        />
      )}
    </div>
  );
}

// フロー作成モーダル
interface AddFlowModalProps {
  theme: any;
  onClose: () => void;
  onSave: (data: { name: string; description?: string; tags: string[] }) => void;
}

function AddFlowModal({ theme, onClose, onSave }: AddFlowModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim() || undefined,
      tags,
    });
  };

  return (
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 max-h-[80%] overflow-auto animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold text-lg">フローを作成</h3>
          <button onClick={onClose}>
            <X size={24} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-4">
          {/* フロー名 */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">フロー名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 三角絞めからの派生"
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30"
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="フローの概要..."
              rows={2}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30 resize-none"
            />
          </div>

          {/* タグ */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">タグ</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="タグを入力..."
                className="flex-1 bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30"
              />
              <button
                onClick={addTag}
                className="px-4 rounded-xl"
                style={{ background: theme.card }}
              >
                <Plus size={18} style={{ color: theme.primary }} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full text-xs flex items-center gap-1"
                    style={{
                      background: `${theme.primary}20`,
                      color: theme.accent,
                    }}
                  >
                    #{tag}
                    <button onClick={() => removeTag(tag)}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 作成ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="w-full py-4 rounded-xl text-white font-semibold mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: theme.gradient }}
          >
            作成してエディタを開く
          </button>
        </div>
      </div>
    </div>
  );
}

// カスタムノードコンポーネント
interface CustomNodeData {
  label: string;
  type: 'position' | 'technique' | 'submission' | 'sweep';
}

function TechniqueNode({ data, selected }: NodeProps<CustomNodeData>) {
  const { theme } = useApp();

  const getNodeStyle = () => {
    switch (data.type) {
      case 'submission':
        return { bg: `${theme.primary}30`, border: theme.primary };
      case 'sweep':
        return { bg: `${theme.accent}20`, border: theme.accent };
      default:
        return { bg: theme.card, border: theme.cardBorder };
    }
  };

  const style = getNodeStyle();

  return (
    <div
      className={`px-4 py-3 rounded-xl transition-all ${selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        boxShadow: selected ? `0 8px 30px ${theme.primary}40` : 'none',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      <div className="flex items-center gap-2">
        <GripVertical size={14} className="text-white/30" />
        <span className="text-white text-sm font-medium whitespace-nowrap">
          {data.label}
        </span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

const nodeTypes = {
  technique: TechniqueNode,
};

// フローエディタ
interface FlowEditorProps {
  flow?: Flow;
  onBack: () => void;
}

export function FlowEditorScreen({ flow, onBack }: FlowEditorProps) {
  const { theme, techniques, updateFlow, deleteFlow } = useApp();
  const [flowName, setFlowName] = useState(flow?.name || '新しいフロー');
  const [showTechniquePanel, setShowTechniquePanel] = useState(false);

  const initialNodes: Node<CustomNodeData>[] = [
    {
      id: '1',
      type: 'technique',
      position: { x: 150, y: 50 },
      data: { label: 'スタート', type: 'position' },
    },
  ];

  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          { ...params, animated: true, style: { stroke: theme.primary } },
          eds
        )
      ),
    [setEdges, theme.primary]
  );

  const addNode = (label: string, type: CustomNodeData['type']) => {
    const newNode: Node<CustomNodeData> = {
      id: `n${Date.now()}`,
      type: 'technique',
      position: { x: 100 + Math.random() * 100, y: 100 + nodes.length * 80 },
      data: { label, type },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowTechniquePanel(false);
  };

  const handleSave = () => {
    if (flow) {
      updateFlow(flow.id, { name: flowName });
    }
    onBack();
  };

  const handleDelete = () => {
    if (flow && confirm('このフローを削除しますか？')) {
      deleteFlow(flow.id);
      onBack();
    }
  };

  // 登録済みの技をリストに追加
  const availableTechniques = techniques.map(t => ({
    label: t.name,
    type: t.technique_type === 'submission' ? 'submission' as const : 
          t.technique_type === 'sweep' ? 'sweep' as const : 
          'technique' as const,
  }));

  const defaultTechniques = [
    { label: 'ポジション', type: 'position' as const },
    { label: 'アームバー', type: 'submission' as const },
    { label: 'キムラ', type: 'submission' as const },
    { label: 'シザースイープ', type: 'sweep' as const },
    { label: 'ヒップスイープ', type: 'sweep' as const },
  ];

  const allTechniques = [...availableTechniques, ...defaultTechniques];

  const getNodeStyle = (type: string) => {
    switch (type) {
      case 'submission':
        return { bg: `${theme.primary}30`, border: theme.primary };
      case 'sweep':
        return { bg: `${theme.accent}20`, border: theme.accent };
      default:
        return { bg: theme.card, border: theme.cardBorder };
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* ヘッダー */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: theme.cardBorder }}
      >
        <button onClick={onBack} className="p-1">
          <X size={22} className="text-white/60" />
        </button>
        <span className="text-white font-medium">フローエディタ</span>
        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
          style={{ background: theme.gradient }}
        >
          保存
        </button>
      </div>

      {/* ツールバー */}
      <div
        className="flex gap-2 px-4 py-3 border-b overflow-x-auto"
        style={{ borderColor: theme.cardBorder }}
      >
        <button
          onClick={() => setShowTechniquePanel(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap"
          style={{ background: theme.gradient, color: 'white' }}
        >
          <Plus size={14} />
          技を追加
        </button>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap"
          style={{ background: theme.card, color: 'rgba(255,255,255,0.7)' }}
        >
          <Link size={14} />
          接続モード
        </button>
        {flow && (
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap text-red-400"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <Trash2 size={14} />
            削除
          </button>
        )}
      </div>

      {/* 操作ヒント */}
      <div className="px-4 py-2 text-xs text-white/40 flex items-center gap-4">
        <span>• ドラッグで移動</span>
        <span>• 端子をつないで接続</span>
      </div>

      {/* React Flow キャンバス */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          style={{ background: theme.bg }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={`${theme.primary}30`}
          />
          <Controls
            style={{
              background: theme.card,
              border: `1px solid ${theme.cardBorder}`,
              borderRadius: '12px',
            }}
          />
        </ReactFlow>
      </div>

      {/* フロー情報 */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: theme.cardBorder }}
      >
        <input
          type="text"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="text-white font-medium bg-transparent outline-none w-full"
          placeholder="フロー名を入力"
        />
        <div className="flex gap-2 mt-2">
          {flow?.tags.map((tag, i) => (
            <span key={i} className="text-xs" style={{ color: theme.accent }}>
              #{tag}
            </span>
          ))}
          <button className="text-xs text-white/30">+ タグ</button>
        </div>
      </div>

      {/* 技追加パネル */}
      {showTechniquePanel && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in"
          onClick={() => setShowTechniquePanel(false)}
        >
          <div
            className="w-full rounded-t-3xl p-5 max-h-[70%] overflow-auto animate-slide-up"
            style={{ background: theme.bg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">技を追加</h3>
              <button onClick={() => setShowTechniquePanel(false)}>
                <X size={20} className="text-white/60" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {allTechniques.map((tech, i) => {
                const style = getNodeStyle(tech.type);
                return (
                  <button
                    key={i}
                    onClick={() => addNode(tech.label, tech.type)}
                    className="p-3 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: style.bg, border: `1px solid ${style.border}` }}
                  >
                    <span className="text-white text-sm">{tech.label}</span>
                    <span className="block text-white/40 text-xs mt-1 capitalize">
                      {tech.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
