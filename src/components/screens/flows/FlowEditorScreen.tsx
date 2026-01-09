'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChevronLeft, Plus, Save, Star, Trash2, Share2 } from 'lucide-react';
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
  NodeChange,
  EdgeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { Header } from '@/components/ui/Header';
import { Flow, Technique } from '@/types';
import { TechniqueNode, LabeledEdge, TechniqueSelectPanel } from './components';
import { EdgeLabelModal, ShareFlowModal } from './modals';
import { defaultCategories } from '@/components/shared/categories';

interface FlowEditorScreenProps {
  flow?: Flow;
  onBack: () => void;
}

export function FlowEditorScreen({ flow, onBack }: FlowEditorScreenProps) {
  const { theme, techniques, updateFlow, deleteFlow, addFlow } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showTechniquePanel, setShowTechniquePanel] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showEdgeLabelModal, setShowEdgeLabelModal] = useState(false);
  const [showNodeDeleteModal, setShowNodeDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentFlow, setCurrentFlow] = useState<Flow | null>(flow || null);
  const [isFavorite, setIsFavorite] = useState(flow?.is_favorite || false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  // React Flow ノードとエッジの状態
  const initialNodes = useMemo(() => {
    if (currentFlow?.flow_data?.nodes) {
      return currentFlow.flow_data.nodes.map((node: any) => ({
        ...node,
        data: { ...node.data, theme },
      }));
    }
    return [];
  }, [currentFlow?.flow_data?.nodes, theme]);

  const initialEdges = useMemo(() => {
    if (currentFlow?.flow_data?.edges) {
      return currentFlow.flow_data.edges.map((edge: any) => ({
        ...edge,
        data: { ...edge.data, theme },
      }));
    }
    return [];
  }, [currentFlow?.flow_data?.edges, theme]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ノードタイプとエッジタイプを定義
  const nodeTypes = useMemo(() => ({ technique: TechniqueNode }), []);
  const edgeTypes = useMemo(() => ({ labeled: LabeledEdge }), []);

  // エッジ接続時 - ラベル入力モーダルを表示
  const onConnect = useCallback(
    (params: Connection) => {
      setPendingConnection(params);
      setShowEdgeLabelModal(true);
    },
    []
  );

  // 接続を確定（ラベル付き）
  const handleConfirmConnection = (label: string) => {
    if (pendingConnection) {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: pendingConnection.source!,
        target: pendingConnection.target!,
        sourceHandle: pendingConnection.sourceHandle,
        targetHandle: pendingConnection.targetHandle,
        type: 'labeled',
        data: { theme, label },
      };
      setEdges((eds) => [...eds, newEdge]);
    }
    setPendingConnection(null);
    setShowEdgeLabelModal(false);
  };

  // ノードクリック時
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowNodeDeleteModal(true);
  }, []);

  // ノードを削除
  const handleDeleteNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    // 関連するエッジも削除
    setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
    setShowNodeDeleteModal(false);
    setSelectedNode(null);
  };

  // エッジクリック時
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setShowEdgeLabelModal(true);
  }, []);

  // 技を追加
  const handleAddTechnique = (technique: Technique | { name: string; type: string; emoji: string }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'technique',
      position: { x: Math.random() * 200 + 100, y: nodes.length * 100 + 50 },
      data: {
        label: technique.name,
        emoji: 'id' in technique
          ? defaultCategories.find(c => c.id === technique.category)?.icon || '🥋'
          : (technique as any).emoji || '🥋',
        type: 'id' in technique ? technique.technique_type : (technique as any).type,
        isStartNode: nodes.length === 0,
        theme,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setShowTechniquePanel(false);
  };

  // エッジラベルを更新
  const handleUpdateEdgeLabel = (label: string) => {
    if (!selectedEdge) return;
    setEdges((eds) =>
      eds.map((e) =>
        e.id === selectedEdge.id
          ? { ...e, data: { ...e.data, label } }
          : e
      )
    );
    setShowEdgeLabelModal(false);
    setSelectedEdge(null);
  };

  // エッジを削除
  const handleDeleteEdge = () => {
    if (!selectedEdge) return;
    setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
    setShowEdgeLabelModal(false);
    setSelectedEdge(null);
  };

  // フローを保存
  const handleSave = async () => {
    const flowData = {
      nodes: nodes.map((n) => ({ ...n, data: { ...n.data, theme: undefined } })),
      edges: edges.map((e) => ({ ...e, data: { ...e.data, theme: undefined } })),
    };
    if (currentFlow) {
      await updateFlow(currentFlow.id, { flow_data: flowData });
      showToast('フローを保存しました');
    } else {
      // 新規フローを作成して戻る
      await addFlow({
        name: '新しいフロー',
        description: '',
        tags: [],
        is_favorite: false,
        flow_data: flowData,
      });
      showToast('フローを作成しました');
      onBack();
    }
  };

  // お気に入り切り替え
  const handleToggleFavorite = () => {
    if (!currentFlow) return;
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    updateFlow(currentFlow.id, { is_favorite: newFavorite });
  };

  // フローを削除
  const handleDeleteFlow = () => {
    if (!currentFlow) return;
    if (confirm('このフローを削除しますか？')) {
      deleteFlow(currentFlow.id);
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* グラデーション背景 - ヘッダー部分 */}
      <div
        className="absolute top-0 left-0 right-0 h-20 z-0"
        style={{ background: theme.gradient }}
      />

      <Header
        title={currentFlow?.name || '新しいフロー'}
        showBack
        onBack={onBack}
        rightAction={
          <div className="flex gap-2">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Share2 size={18} className="text-white" />
            </button>
            <button
              onClick={handleToggleFavorite}
              className="p-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Star
                size={18}
                className="text-white"
                fill={isFavorite ? theme.accent : 'transparent'}
                style={{ color: isFavorite ? theme.accent : 'white' }}
              />
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium text-sm"
              style={{ background: 'white', color: theme.primary }}
            >
              <Save size={16} />
              保存
            </button>
          </div>
        }
      />

      {/* React Flow キャンバス */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          defaultEdgeOptions={{ type: 'labeled' }}
          style={{ background: theme.bg }}
        >
          <Controls />
          <Background variant={BackgroundVariant.Dots} color={theme.cardBorder} gap={20} />
        </ReactFlow>

        {/* 技追加ボタン */}
        <button
          onClick={() => setShowTechniquePanel(true)}
          className="absolute bottom-4 right-4 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-10"
          style={{ background: theme.gradient }}
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>

      {/* ボトムバー */}
      <div
        className="px-5 py-3 flex items-center justify-between border-t mb-16"
        style={{ background: theme.card, borderColor: theme.cardBorder }}
      >
        <div className="text-sm" style={{ color: theme.textSecondary }}>
          {nodes.length}ノード · {edges.length}接続
        </div>
        <button
          onClick={handleDeleteFlow}
          className="flex items-center gap-1.5 text-sm text-red-500"
        >
          <Trash2 size={16} />
          削除
        </button>
      </div>

      {/* 技選択パネル */}
      {showTechniquePanel && (
        <TechniqueSelectPanel
          theme={theme}
          techniques={techniques}
          onSelect={handleAddTechnique}
          onClose={() => setShowTechniquePanel(false)}
        />
      )}

      {/* エッジラベル編集モーダル（既存エッジ編集時） */}
      {showEdgeLabelModal && selectedEdge && (
        <EdgeLabelModal
          theme={theme}
          edge={selectedEdge}
          onClose={() => {
            setShowEdgeLabelModal(false);
            setSelectedEdge(null);
          }}
          onSave={handleUpdateEdgeLabel}
          onDelete={handleDeleteEdge}
        />
      )}

      {/* エッジラベル入力モーダル（新規接続時） */}
      {showEdgeLabelModal && pendingConnection && !selectedEdge && (
        <EdgeLabelModal
          theme={theme}
          edge={null}
          onClose={() => {
            setShowEdgeLabelModal(false);
            setPendingConnection(null);
          }}
          onSave={handleConfirmConnection}
          onDelete={() => {
            setShowEdgeLabelModal(false);
            setPendingConnection(null);
          }}
          isNewConnection
        />
      )}

      {/* ノード情報モーダル */}
      {showNodeDeleteModal && selectedNode && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-center z-50"
          onClick={() => {
            setShowNodeDeleteModal(false);
            setSelectedNode(null);
          }}
        >
          <div
            className="w-full max-w-lg rounded-t-3xl p-5 pb-8 animate-slide-up"
            style={{ background: theme.card }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 技情報ヘッダー */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `${theme.primary}15` }}
              >
                {selectedNode.data.emoji || '🥋'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg" style={{ color: theme.text }}>
                  {selectedNode.data.label}
                </h3>
                {selectedNode.data.type && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                    style={{ background: `${theme.primary}20`, color: theme.primary }}
                  >
                    {selectedNode.data.type}
                  </span>
                )}
              </div>
              {selectedNode.data.isStartNode && (
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{ background: theme.gradient, color: 'white' }}
                >
                  スタート
                </span>
              )}
            </div>

            {/* アクションボタン */}
            <div className="space-y-2">
              {!selectedNode.data.isStartNode && (
                <button
                  onClick={() => {
                    // 全ノードのisStartNodeをfalseに、選択ノードをtrueに
                    setNodes((nds) =>
                      nds.map((n) => ({
                        ...n,
                        data: { ...n.data, isStartNode: n.id === selectedNode.id },
                      }))
                    );
                    setShowNodeDeleteModal(false);
                    setSelectedNode(null);
                  }}
                  className="w-full py-3 rounded-xl text-left px-4 flex items-center gap-3"
                  style={{ background: theme.bg }}
                >
                  <span className="text-lg">🎯</span>
                  <span style={{ color: theme.text }}>スタートノードに設定</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowNodeDeleteModal(false);
                  setSelectedNode(null);
                }}
                className="w-full py-3 rounded-xl text-left px-4 flex items-center gap-3"
                style={{ background: theme.bg }}
              >
                <span className="text-lg">✕</span>
                <span style={{ color: theme.text }}>閉じる</span>
              </button>
            </div>

            {/* 削除ボタン - 下部に配置 */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
              <button
                onClick={handleDeleteNode}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-red-500"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Trash2 size={18} />
                <span>このノードを削除</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 共有モーダル */}
      {showShareModal && currentFlow && (
        <ShareFlowModal
          theme={theme}
          flow={{ ...currentFlow, flow_data: { nodes, edges } }}
          userId={user?.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
