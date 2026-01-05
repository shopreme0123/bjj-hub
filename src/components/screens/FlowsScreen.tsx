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
import { Plus, GitBranch, Star, X, GripVertical, Trash2, ChevronLeft, Save, Tag, Pencil, Share2, Upload, Copy, Check, Globe, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { shareContent, getSharedContent, getPublicContent, type Visibility } from '@/lib/shared-content';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Flow, Technique } from '@/types';
import { techniqueCategories, TechniqueCategory } from './TechniquesScreen';
import { supabase } from '@/lib/supabase';

interface FlowsScreenProps {
  onOpenEditor: (flow?: Flow) => void;
}

export function FlowsScreen({ onOpenEditor }: FlowsScreenProps) {
  const { theme, flows, addFlow, updateFlow, deleteFlow } = useApp();
  const { t } = useI18n();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | 'favorite'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

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
          <div className="flex gap-2">
            <button
              className="p-2 rounded-full relative z-10 bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowImportModal(true);
              }}
            >
              <Upload size={18} className="text-white" />
            </button>
            <button
              className="p-2 rounded-full relative z-10 bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddModal(true);
              }}
            >
              <Plus size={18} className="text-white" />
            </button>
          </div>
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

      {/* インポートモーダル */}
      {showImportModal && (
        <ImportFlowModal
          theme={theme}
          onClose={() => setShowImportModal(false)}
          onImport={(flowData) => {
            addFlow(flowData);
            setShowImportModal(false);
            showToast('フローをインポートしました');
          }}
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
      {/* 上部ハンドル（入出力両用） */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />

      <div className="flex items-center gap-2">
        <GripVertical size={14} style={{ color: theme.textMuted }} />
        <span className="text-sm font-medium whitespace-nowrap" style={{ color: theme.text }}>
          {data.label}
        </span>
      </div>

      {/* 下部ハンドル（入出力両用） */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className="!bg-blue-500 !w-3 !h-3 !border-2 !border-white"
      />

      {/* 左側ハンドル（入出力両用） */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className="!bg-green-500 !w-2.5 !h-2.5 !border-2 !border-white"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!bg-green-500 !w-2.5 !h-2.5 !border-2 !border-white"
        style={{ top: '50%' }}
      />

      {/* 右側ハンドル（入出力両用） */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!bg-orange-500 !w-2.5 !h-2.5 !border-2 !border-white"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
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
  onEdit?: (edgeId: string) => void;
  onDelete?: (edgeId: string) => void;
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
  selected,
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
        style={{
          ...style,
          strokeWidth: selected ? 3 : 2,
        }}
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
          >
            <div className="flex items-center gap-1">
              <span
                className="px-2 py-1 rounded text-xs inline-block"
                style={{
                  background: selected ? theme.primary : theme.card,
                  border: `1px solid ${selected ? theme.primary : theme.cardBorder}`,
                  color: selected ? 'white' : theme.text,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                {data.label}
              </span>
              {selected && (
                <div className="flex gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onEdit?.(id);
                    }}
                    className="p-1 rounded bg-blue-500 hover:bg-blue-600 transition-colors"
                    title="編集"
                  >
                    <Pencil size={10} className="text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      data.onDelete?.(id);
                    }}
                    className="p-1 rounded bg-red-500 hover:bg-red-600 transition-colors"
                    title="削除"
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              )}
            </div>
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
  const { user } = useAuth();
  const { showToast } = useToast();
  const [flowName, setFlowName] = useState(flow?.name || '新しいフロー');
  const [showTechniquePanel, setShowTechniquePanel] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [showLabelModal, setShowLabelModal] = useState(false);
  const [editingEdgeId, setEditingEdgeId] = useState<string | null>(null);
  const [customCategories, setCustomCategories] = useState<TechniqueCategory[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

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

  // カスタムカテゴリを読み込み
  useEffect(() => {
    const loadCustomCategories = async () => {
      if (!user) {
        // ログインしていない場合はlocalStorageから読み込み
        const saved = localStorage.getItem('bjj-hub-custom-categories');
        if (saved) {
          setCustomCategories(JSON.parse(saved));
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('custom_categories')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true });

        if (error) throw error;

        const categories = (data || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
        }));
        setCustomCategories(categories);
      } catch (error) {
        console.error('Error loading categories:', error);
        // フォールバック: localStorageから読み込み
        const saved = localStorage.getItem('bjj-hub-custom-categories');
        if (saved) {
          setCustomCategories(JSON.parse(saved));
        }
      }
    };

    loadCustomCategories();
  }, [user]);

  // 全カテゴリ（デフォルト + カスタム）
  const allCategories = [...techniqueCategories, ...customCategories];

  // 既存のエッジにコールバックを追加
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          onEdit: editEdgeLabel,
          onDelete: (edgeId: string) => {
            setEdges((eds) => eds.filter((e) => e.id !== edgeId));
          },
        },
      }))
    );
  }, []);

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
      if (pendingConnection.sourceHandle?.includes('left')) {
        strokeColor = '#22c55e'; // green
      } else if (pendingConnection.sourceHandle?.includes('right')) {
        strokeColor = '#f97316'; // orange
      }

      setEdges((eds) =>
        addEdge(
          {
            ...pendingConnection,
            type: 'labeled',
            animated: true,
            style: { stroke: strokeColor, strokeWidth: 2 },
            data: {
              label: label || undefined,
              onEdit: editEdgeLabel,
              onDelete: (edgeId: string) => {
                setEdges((eds) => eds.filter((e) => e.id !== edgeId));
              },
            },
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
    setSelectedEdgeId(null);
  }, []);

  // エッジ選択時の処理
  const onEdgeClick = useCallback((_: React.MouseEvent, edge: Edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
  }, []);

  // 背景クリックで選択解除
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);

  // 選択中のノードを削除
  const deleteSelectedNode = () => {
    if (selectedNodeId) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
      setSelectedNodeId(null);
    }
  };

  // 選択中のエッジを削除
  const deleteSelectedEdge = () => {
    if (selectedEdgeId) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdgeId));
      setSelectedEdgeId(null);
    }
  };

  // エッジラベルを編集
  const editEdgeLabel = (edgeId: string) => {
    setEditingEdgeId(edgeId);
    setShowLabelModal(true);
  };

  // エッジラベルを更新
  const updateEdgeLabel = useCallback(
    (label?: string) => {
      if (!editingEdgeId) return;

      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === editingEdgeId
            ? { ...edge, data: { ...edge.data, label: label || undefined } }
            : edge
        )
      );
      setEditingEdgeId(null);
      setShowLabelModal(false);
    },
    [editingEdgeId, setEdges]
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

  const handleShare = () => {
    setShowExportModal(true);
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1"
            style={{ color: theme.primary, border: `1px solid ${theme.primary}` }}
          >
            <Share2 size={14} />
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-full text-sm font-medium text-white flex items-center gap-1"
            style={{ background: theme.gradient }}
          >
            <Save size={14} />
            保存
          </button>
        </div>
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
            ノード削除
          </button>
        )}
        {selectedEdgeId && (
          <button
            onClick={deleteSelectedEdge}
            className="px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 bg-red-500/20 text-red-500 whitespace-nowrap"
          >
            <Trash2 size={14} />
            接続削除
          </button>
        )}
        <div className="ml-auto text-xs whitespace-nowrap" style={{ color: theme.textMuted }}>
          {selectedEdgeId ? '接続を選択中' : 'ハンドルをドラッグして接続'}
        </div>
      </div>

      {/* React Flow エディタ */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges.map(edge => ({
            ...edge,
            selected: edge.id === selectedEdgeId,
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
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
          categories={allCategories}
          onSelect={addNode}
          onClose={() => setShowTechniquePanel(false)}
        />
      )}

      {/* ラベル入力モーダル */}
      {showLabelModal && (
        <EdgeLabelModal
          theme={theme}
          initialLabel={editingEdgeId ? edges.find(e => e.id === editingEdgeId)?.data?.label : undefined}
          isEditing={!!editingEdgeId}
          onClose={() => {
            setPendingConnection(null);
            setEditingEdgeId(null);
            setShowLabelModal(false);
          }}
          onSave={editingEdgeId ? updateEdgeLabel : addEdgeWithLabel}
        />
      )}

      {/* エクスポートモーダル */}
      {showExportModal && (
        <ExportFlowModal
          theme={theme}
          flowName={flowName}
          flow={flow}
          nodes={nodes}
          edges={edges}
          userId={user?.id}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}

// 技選択パネル（カテゴリ→技の2段階選択）
interface TechniqueSelectPanelProps {
  theme: any;
  techniques: Technique[];
  categories: TechniqueCategory[];
  onSelect: (label: string, type: CustomNodeData['type']) => void;
  onClose: () => void;
}

// エッジラベル入力モーダル
interface EdgeLabelModalProps {
  theme: any;
  initialLabel?: string;
  isEditing?: boolean;
  onClose: () => void;
  onSave: (label?: string) => void;
}

function EdgeLabelModal({ theme, initialLabel, isEditing, onClose, onSave }: EdgeLabelModalProps) {
  const [label, setLabel] = useState(initialLabel || '');
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
            {isEditing ? '分岐条件を編集' : '分岐条件を追加'}
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
          {!isEditing && (
            <button
              onClick={() => onSave(undefined)}
              className="flex-1 py-3 rounded-xl"
              style={{ background: theme.card, color: theme.textSecondary, border: `1px solid ${theme.cardBorder}` }}
            >
              ラベルなしで接続
            </button>
          )}
          <button
            onClick={() => onSave(label || undefined)}
            className="flex-1 py-3 rounded-xl text-white font-medium"
            style={{ background: theme.gradient }}
          >
            {isEditing ? '更新' : (label ? '追加' : 'OK')}
          </button>
        </div>
      </div>
    </div>
  );
}

function TechniqueSelectPanel({ theme, techniques, categories, onSelect, onClose }: TechniqueSelectPanelProps) {
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
              {categories.map((cat) => (
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

// エクスポートモーダル
interface ExportFlowModalProps {
  theme: any;
  flowName: string;
  flow?: Flow;
  nodes: Node[];
  edges: Edge[];
  userId?: string;
  onClose: () => void;
}

function ExportFlowModal({ theme, flowName, flow, nodes, edges, userId, onClose }: ExportFlowModalProps) {
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const contentData = {
        name: flowName,
        description: flow?.description,
        tags: flow?.tags || [],
        nodes: nodes,
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type,
          animated: edge.animated,
          style: edge.style,
          label: edge.data?.label,
        })),
      };

      const result = await shareContent(
        'flow',
        contentData,
        flowName,
        visibility,
        flow?.description,
        userId
      );

      if (result.success && result.shareCode) {
        setShareCode(result.shareCode);
        showToast('フローを共有しました');
      } else {
        showToast('共有に失敗しました', 'error');
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

        {!shareCode ? (
          <>
            <p className="text-sm mb-4" style={{ color: theme.textSecondary }}>
              公開範囲を選択してください
            </p>

            <div className="space-y-3 mb-6">
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
            </div>

            <button
              onClick={handleShare}
              disabled={isSharing}
              className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: theme.gradient }}
            >
              {isSharing ? '共有中...' : '共有する'}
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

// インポートモーダル
interface ImportFlowModalProps {
  theme: any;
  onClose: () => void;
  onImport: (flow: Omit<Flow, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => void;
}

function ImportFlowModal({ theme, onClose, onImport }: ImportFlowModalProps) {
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
        is_favorite: false,
        flow_data: {
          nodes: flowData.nodes || [],
          edges: flowData.edges || [],
        },
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
      is_favorite: false,
      flow_data: {
        nodes: flowData.nodes || [],
        edges: flowData.edges || [],
      },
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
                      {content.content_data.tags && content.content_data.tags.length > 0 && (
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{ background: `${theme.primary}15`, color: theme.primary }}
                        >
                          {content.content_data.tags[0]}
                        </span>
                      )}
                      <span className="text-xs" style={{ color: theme.textMuted }}>
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
