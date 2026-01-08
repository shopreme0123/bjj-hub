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
  flow: Flow;
  onBack: () => void;
  onUpdate: (updates: Partial<Flow>) => void;
}

export function FlowEditorScreen({ flow, onBack, onUpdate }: FlowEditorScreenProps) {
  const { theme, techniques, updateFlow, deleteFlow } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [showTechniquePanel, setShowTechniquePanel] = useState(false);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showEdgeLabelModal, setShowEdgeLabelModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(flow.is_favorite);

  // React Flow ノードとエッジの状態
  const initialNodes = useMemo(() => {
    if (flow.flow_data?.nodes) {
      return flow.flow_data.nodes.map((node: any) => ({
        ...node,
        data: { ...node.data, theme },
      }));
    }
    return [];
  }, [flow.flow_data?.nodes, theme]);

  const initialEdges = useMemo(() => {
    if (flow.flow_data?.edges) {
      return flow.flow_data.edges.map((edge: any) => ({
        ...edge,
        data: { ...edge.data, theme },
      }));
    }
    return [];
  }, [flow.flow_data?.edges, theme]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ノードタイプとエッジタイプを定義
  const nodeTypes = useMemo(() => ({ technique: TechniqueNode }), []);
  const edgeTypes = useMemo(() => ({ labeled: LabeledEdge }), []);

  // エッジ接続時
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'labeled',
            data: { theme, label: '' },
          },
          eds
        )
      );
    },
    [setEdges, theme]
  );

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
    await updateFlow(flow.id, { flow_data: flowData });
    showToast('フローを保存しました');
  };

  // お気に入り切り替え
  const handleToggleFavorite = () => {
    const newFavorite = !isFavorite;
    setIsFavorite(newFavorite);
    updateFlow(flow.id, { is_favorite: newFavorite });
  };

  // フローを削除
  const handleDeleteFlow = () => {
    if (confirm('このフローを削除しますか？')) {
      deleteFlow(flow.id);
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <Header
        title={flow.name}
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
              className="p-2 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <Save size={18} className="text-white" />
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
        className="px-5 py-3 flex items-center justify-between border-t"
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

      {/* エッジラベル編集モーダル */}
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

      {/* 共有モーダル */}
      {showShareModal && (
        <ShareFlowModal
          theme={theme}
          flow={{ ...flow, flow_data: { nodes, edges } }}
          userId={user?.id}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
