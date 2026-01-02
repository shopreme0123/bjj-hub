'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  EdgeProps,
  getBezierPath,
  EdgeLabelRenderer,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, GitBranch, Star, X, GripVertical, Trash2, ChevronLeft, Save, Tag } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Flow, Technique } from '@/types';
import { techniqueCategories } from './TechniquesScreen';

interface FlowsScreenProps {
  onOpenEditor: (flow?: Flow) => void;
}

export function FlowsScreen({ onOpenEditor }: FlowsScreenProps) {
  const { theme, flows, addFlow, updateFlow, deleteFlow } = useApp();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'favorite'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredFlows = flows.filter((flow) => {
    if (activeTab === 'favorite') return flow.is_favorite;
    return true;
  });

  const handleAddFlow = async (data: { name: string; description?: string; tags: string[] }) => {
    await addFlow({
      name: data.name,
      description: data.description,
      tags: data.tags,
      is_favorite: false,
    });
    setShowAddModal(false);
    showToast('フローを作成しました');
  };

  const handleToggleFavorite = (e: React.MouseEvent, flow: Flow) => {
    e.stopPropagation();
    updateFlow(flow.id, { is_favorite: !flow.is_favorite });
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* グラデーション背景 - 固定 */}
      <div
        className="absolute top-0 left-0 right-0 h-48 rounded-b-3xl"
        style={{ background: theme.gradient }}
      />

      <Header
        title={t('flows.title')}
        rightAction={
          <button
            className="p-2 rounded-full relative z-10 bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      {/* タブ */}
      <div className="flex gap-2 px-5 pb-4 relative z-10">
        {[
          { id: 'all', label: t('common.all') },
          { id: 'favorite', label: t('techniques.mastery.favorite') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === tab.id ? theme.primary : 'white',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* スクロール可能なコンテンツ - 背景色で覆う */}
      <div className="flex-1 overflow-auto relative z-10">
        <div 
          className="min-h-full px-5 pb-24 space-y-3 pt-4"
          style={{ background: theme.bg, borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}
        >
        {filteredFlows.length === 0 ? (
          <div className="text-center py-12">
            <GitBranch size={48} className="mx-auto mb-4" style={{ color: theme.textMuted }} />
            <p className="mb-2" style={{ color: theme.textSecondary }}>
              {activeTab === 'favorite' ? t('flows.no_flows') : t('flows.no_flows')}
            </p>
            <p className="text-sm" style={{ color: theme.textMuted }}>
              {t('flows.create_first')}
            </p>
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
                    <p className="font-medium" style={{ color: theme.text }}>{flow.name}</p>
                    {flow.description && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: theme.textSecondary }}>
                        {flow.description}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleFavorite(e, flow)}
                  className="p-1"
                >
                  <Star
                    size={18}
                    fill={flow.is_favorite ? theme.accent : 'transparent'}
                    style={{ color: flow.is_favorite ? theme.accent : theme.textMuted }}
                  />
                </button>
              </div>
              {flow.tags && flow.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
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
        </div>
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
    onSave({ name: name.trim(), description: description.trim() || undefined, tags });
  };

  return (
    <div 
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 max-h-[85%] overflow-auto animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>フローを作成</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* フロー名 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>フロー名 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 三角絞めからの派生"
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 説明 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>説明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="フローの説明..."
              rows={2}
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500 resize-none"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* タグ */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>タグ</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="タグを入力..."
                className="flex-1 rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
              <button
                onClick={addTag}
                className="px-4 rounded-xl"
                style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
              >
                <Plus size={18} style={{ color: theme.primary }} />
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
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

// カスタムノードコンポーネント（分岐対応）
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
        boxShadow: selected ? `0 8px 30px ${theme.primary}40` : '0 2px 8px rgba(0,0,0,0.1)',
        minWidth: '120px',
      }}
    >
      {/* 上部ハンドル（入力） */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      <div className="flex items-center gap-2">
        <GripVertical size={14} style={{ color: theme.textMuted }} />
        <span className="text-sm font-medium whitespace-nowrap" style={{ color: theme.text }}>
          {data.label}
        </span>
      </div>
      
      {/* 下部ハンドル（出力・メイン） */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="main"
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      
      {/* 左側ハンドル（分岐1） */}
      <Handle
        type="source"
        position={Position.Left}
        id="branch-left"
        className="!bg-green-500 !w-2.5 !h-2.5 !border-2 !border-white"
        style={{ top: '50%' }}
      />
      
      {/* 右側ハンドル（分岐2） */}
      <Handle
        type="source"
        position={Position.Right}
        id="branch-right"
        className="!bg-orange-500 !w-2.5 !h-2.5 !border-2 !border-white"
        style={{ top: '50%' }}
      />
    </div>
  );
}

const nodeTypes = {
  technique: TechniqueNode,
};

// カスタムエッジ（ラベル付き）
interface CustomEdgeData {
  label?: string;
}

function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
}: EdgeProps<CustomEdgeData>) {
  const { theme } = useApp();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#arrowhead)"
      />
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="text-center"
            contentEditable={false}
          >
            <span
              className="px-2 py-1 rounded text-xs inline-block"
              style={{ 
                background: theme.card, 
                border: `1px solid ${theme.cardBorder}`,
                color: theme.text,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {data.label}
            </span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

const edgeTypes = {
  labeled: LabeledEdge,
};

// フローエディタ
interface FlowEditorProps {
  flow?: Flow;
  onBack: () => void;
}

export function FlowEditorScreen({ flow, onBack }: FlowEditorProps) {
  const { theme, techniques, updateFlow, deleteFlow } = useApp();
  const { showToast } = useToast();
  const [flowName, setFlowName] = useState(flow?.name || '新しいフロー');
  const [showTechniquePanel, setShowTechniquePanel] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);

  // 初期ノード（保存データがあれば復元）
  const getInitialNodes = (): Node<CustomNodeData>[] => {
    if (flow?.flow_data && typeof flow.flow_data === 'object') {
      const data = flow.flow_data as any;
      if (data.nodes && Array.isArray(data.nodes)) {
        return data.nodes;
      }
    }
    return [
      {
        id: '1',
        type: 'technique',
        position: { x: 150, y: 50 },
        data: { label: 'スタート', type: 'position' },
      },
    ];
  };

  // 初期エッジ（保存データがあれば復元）
  const getInitialEdges = (): Edge[] => {
    if (flow?.flow_data && typeof flow.flow_data === 'object') {
      const data = flow.flow_data as any;
      if (data.edges && Array.isArray(data.edges)) {
        return data.edges;
      }
    }
    return [];
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges());

  // 変更を追跡
  useEffect(() => {
    setHasChanges(true);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      // 接続情報を保存してラベルモーダルを表示
      setPendingConnection(params);
      setShowLabelModal(true);
    },
    []
  );

  // ラベル付きでエッジを追加
  const addEdgeWithLabel = useCallback(
    (label?: string) => {
      if (!pendingConnection) return;
      
      // エッジの色をハンドルIDに基づいて設定
      let strokeColor = theme.primary;
      if (pendingConnection.sourceHandle === 'branch-left') {
        strokeColor = '#22c55e'; // green
      } else if (pendingConnection.sourceHandle === 'branch-right') {
        strokeColor = '#f97316'; // orange
      }
      
      setEdges((eds) =>
        addEdge(
          { 
            ...pendingConnection, 
            type: 'labeled',
            animated: true, 
            style: { stroke: strokeColor, strokeWidth: 2 },
            data: { label: label || undefined },
          },
          eds
        )
      );
      setPendingConnection(null);
      setShowLabelModal(false);
    },
    [pendingConnection, setEdges, theme.primary]
  );

  // ノード選択時の処理
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  // 背景クリックで選択解除
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // 選択中のノードを削除
  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
      setSelectedNodeId(null);
    }
  };

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

  const handleSave = async () => {
    if (flow) {
      // ノードとエッジをflow_dataに保存
      await updateFlow(flow.id, { 
        name: flowName,
        flow_data: { nodes, edges }
      });
      showToast('フローを保存しました');
      setHasChanges(false);
    }
    onBack();
  };

  const handleDelete = async () => {
    if (flow && confirm('このフローを削除しますか？')) {
      await deleteFlow(flow.id);
      showToast('フローを削除しました');
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* ヘッダー */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: theme.cardBorder, background: theme.bg }}
      >
        <button onClick={onBack} className="p-1">
          <ChevronLeft size={22} style={{ color: theme.textSecondary }} />
        </button>
        <input
          type="text"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          className="font-medium bg-transparent text-center outline-none flex-1 mx-4"
          style={{ color: theme.text }}
          placeholder="フロー名"
        />
        <button
          onClick={handleSave}
          className="px-4 py-1.5 rounded-full text-sm font-medium text-white flex items-center gap-1"
          style={{ background: theme.gradient }}
        >
          <Save size={14} />
          保存
        </button>
      </div>

      {/* ツールバー */}
      <div
        className="px-4 py-2 flex items-center gap-2 border-b"
        style={{ borderColor: theme.cardBorder, background: theme.bg }}
      >
        <button
          onClick={() => setShowTechniquePanel(true)}
          className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 text-white whitespace-nowrap"
          style={{ background: theme.gradient }}
        >
          <Plus size={14} />
          追加
        </button>
        {selectedNodeId && (
          <button
            onClick={deleteSelectedNode}
            className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 bg-red-500/20 text-red-500 whitespace-nowrap"
          >
            <Trash2 size={14} />
            削除
          </button>
        )}
        <div className="ml-auto text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>
          ハンドルをドラッグして接続
        </div>
      </div>

      {/* React Flow エディタ */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          style={{ background: theme.bg }}
        >
          <Controls
            style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
          />
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color={theme.cardBorder}
          />
          {/* 矢印マーカー定義 */}
          <svg>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={theme.primary}
                />
              </marker>
            </defs>
          </svg>
        </ReactFlow>
      </div>

      {/* 削除ボタン */}
      {flow && (
        <div className="px-4 py-3 border-t" style={{ borderColor: theme.cardBorder, background: theme.bg }}>
          <button
            onClick={handleDelete}
            className="w-full py-3 rounded-xl text-red-400 flex items-center justify-center gap-2 text-sm"
            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
          >
            <Trash2 size={16} />
            このフローを削除
          </button>
        </div>
      )}

      {/* 技選択パネル */}
      {showTechniquePanel && (
        <TechniqueSelectPanel
          theme={theme}
          techniques={techniques}
          onSelect={addNode}
          onClose={() => setShowTechniquePanel(false)}
        />
      )}

      {/* ラベル入力モーダル */}
      {showLabelModal && (
        <EdgeLabelModal
          theme={theme}
          onClose={() => {
            setPendingConnection(null);
            setShowLabelModal(false);
          }}
          onSave={addEdgeWithLabel}
        />
      )}
    </div>
  );
}

// 技選択パネル（カテゴリ→技の2段階選択）
interface TechniqueSelectPanelProps {
  theme: any;
  techniques: Technique[];
  onSelect: (label: string, type: CustomNodeData['type']) => void;
  onClose: () => void;
}

// エッジラベル入力モーダル
interface EdgeLabelModalProps {
  theme: any;
  onClose: () => void;
  onSave: (label?: string) => void;
}

function EdgeLabelModal({ theme, onClose, onSave }: EdgeLabelModalProps) {
  const [label, setLabel] = useState('');
  const presetLabels = [
    '相手が起き上がる',
    '相手が潰してくる',
    '腕を取られた',
    'スペースができた',
    '圧をかけてきた',
    '足を抜かれた',
    'バランスを崩した',
    '防がれた',
  ];

  return (
    <div 
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 max-h-[70%] overflow-auto animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2" style={{ color: theme.text }}>
            <Tag size={18} />
            分岐条件を追加
          </h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        {/* カスタムラベル入力 */}
        <div className="mb-4">
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="条件を入力..."
            className="w-full rounded-lg px-4 py-3 outline-none border focus:border-blue-500"
            style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            autoFocus
          />
        </div>

        {/* プリセットラベル */}
        <div className="mb-4">
          <p className="text-xs mb-2" style={{ color: theme.textSecondary }}>よく使う条件</p>
          <div className="flex flex-wrap gap-2">
            {presetLabels.map((preset) => (
              <button
                key={preset}
                onClick={() => setLabel(preset)}
                className="px-3 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: label === preset ? theme.gradient : theme.card,
                  color: label === preset ? 'white' : theme.textSecondary,
                  border: `1px solid ${label === preset ? 'transparent' : theme.cardBorder}`,
                }}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* ボタン */}
        <div className="flex gap-2">
          <button
            onClick={() => onSave(undefined)}
            className="flex-1 py-3 rounded-xl"
            style={{ background: theme.card, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` }}
          >
            ラベルなしで接続
          </button>
          <button
            onClick={() => onSave(label || undefined)}
            className="flex-1 py-3 rounded-xl text-white font-medium"
            style={{ background: theme.gradient }}
          >
            {label ? '追加' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TechniqueSelectPanel({ theme, techniques, onSelect, onClose }: TechniqueSelectPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customLabel, setCustomLabel] = useState('');

  const filteredTechniques = selectedCategory
    ? techniques.filter(t => t.category === selectedCategory)
    : [];

  const getTypeFromTechnique = (tech: Technique): CustomNodeData['type'] => {
    if (tech.technique_type === 'submission') return 'submission';
    if (tech.technique_type === 'sweep') return 'sweep';
    return 'technique';
  };

  return (
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 max-h-[70%] overflow-auto animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>
            {selectedCategory ? '技を選択' : 'カテゴリを選択'}
          </h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        {!selectedCategory ? (
          <>
            {/* カスタムラベル入力 */}
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="カスタム名を入力..."
                  className="flex-1 rounded-lg px-4 py-2.5 outline-none border focus:border-blue-500"
                  style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
                />
                <button
                  onClick={() => {
                    if (customLabel.trim()) {
                      onSelect(customLabel.trim(), 'position');
                      setCustomLabel('');
                    }
                  }}
                  disabled={!customLabel.trim()}
                  className="px-4 rounded-lg text-white disabled:opacity-50"
                  style={{ background: theme.gradient }}
                >
                  追加
                </button>
              </div>
            </div>

            {/* カテゴリ一覧 */}
            <div className="grid grid-cols-2 gap-2">
              {techniqueCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="p-4 rounded-xl text-left flex items-center gap-3"
                  style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-sm" style={{ color: theme.text }}>{cat.name}</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-sm mb-4 flex items-center gap-1"
              style={{ color: theme.textSecondary }}
            >
              <ChevronLeft size={16} />
              カテゴリに戻る
            </button>

            {filteredTechniques.length === 0 ? (
              <p className="text-center py-8" style={{ color: theme.textSecondary }}>
                このカテゴリに技がありません
              </p>
            ) : (
              <div className="space-y-2">
                {filteredTechniques.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => onSelect(tech.name, getTypeFromTechnique(tech))}
                    className="w-full p-3 rounded-lg text-left flex items-center gap-3"
                    style={{ background: theme.card, border: `1px solid ${theme.cardBorder}` }}
                  >
                    <span style={{ color: theme.text }}>{tech.name}</span>
                    <span className="text-xs ml-auto" style={{ color: theme.textSecondary }}>{tech.technique_type}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
