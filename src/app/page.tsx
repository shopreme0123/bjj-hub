'use client';

import React, { useState } from 'react';
import { AppProvider, useApp } from '@/lib/context';
import { BottomNav, TabId } from '@/components/ui/BottomNav';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TechniquesScreen, TechniqueDetailScreen } from '@/components/screens/TechniquesScreen';
import { FlowsScreen, FlowEditorScreen } from '@/components/screens/FlowsScreen';
import { DiaryScreen, DiaryDetailScreen } from '@/components/screens/DiaryScreen';
import { GroupsScreen, GroupDetailScreen } from '@/components/screens/GroupsScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { Technique, Flow, Group, TrainingLog } from '@/types';

type SubScreen =
  | { type: 'technique-detail'; technique: Technique }
  | { type: 'flow-editor'; flow?: Flow }
  | { type: 'group-detail'; group: Group }
  | { type: 'diary-detail'; log: TrainingLog }
  | { type: 'settings' }
  | null;

function AppContent() {
  const { theme } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  const handleBack = () => setSubScreen(null);

  // タブ変更時にサブ画面をリセット
  const handleTabChange = (tab: TabId) => {
    setSubScreen(null);
    setActiveTab(tab);
  };

  // ナビゲーション関数
  const navigateTo = {
    techniqueDetail: (technique: Technique) => 
      setSubScreen({ type: 'technique-detail', technique }),
    flowEditor: (flow?: Flow) => 
      setSubScreen({ type: 'flow-editor', flow }),
    groupDetail: (group: Group) => 
      setSubScreen({ type: 'group-detail', group }),
    diaryDetail: (log: TrainingLog) => 
      setSubScreen({ type: 'diary-detail', log }),
    settings: () => 
      setSubScreen({ type: 'settings' }),
    techniques: () => {
      setSubScreen(null);
      setActiveTab('techniques');
    },
    flows: () => {
      setSubScreen(null);
      setActiveTab('flows');
    },
    diary: () => {
      setSubScreen(null);
      setActiveTab('diary');
    },
  };

  const renderScreen = () => {
    // サブ画面
    if (subScreen) {
      switch (subScreen.type) {
        case 'technique-detail':
          return (
            <TechniqueDetailScreen
              technique={subScreen.technique}
              onBack={handleBack}
              onOpenFlow={(flow) => navigateTo.flowEditor(flow)}
            />
          );
        case 'flow-editor':
          return (
            <FlowEditorScreen
              flow={subScreen.flow}
              onBack={handleBack}
            />
          );
        case 'group-detail':
          return (
            <GroupDetailScreen
              group={subScreen.group}
              onBack={handleBack}
              onOpenFlow={(flow) => navigateTo.flowEditor(flow)}
            />
          );
        case 'diary-detail':
          return (
            <DiaryDetailScreen
              log={subScreen.log}
              onBack={handleBack}
              onOpenTechnique={(technique) => navigateTo.techniqueDetail(technique)}
              onOpenFlow={(flow) => navigateTo.flowEditor(flow)}
            />
          );
        case 'settings':
          return <SettingsScreen onBack={handleBack} />;
      }
    }

    // メイン画面
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onOpenSettings={navigateTo.settings}
            onOpenDiary={navigateTo.diary}
            onOpenDiaryDetail={navigateTo.diaryDetail}
            onOpenTechnique={navigateTo.techniqueDetail}
            onOpenTechniques={navigateTo.techniques}
          />
        );
      case 'techniques':
        return (
          <TechniquesScreen
            onSelectTechnique={navigateTo.techniqueDetail}
          />
        );
      case 'flows':
        return (
          <FlowsScreen
            onOpenEditor={navigateTo.flowEditor}
          />
        );
      case 'diary':
        return (
          <DiaryScreen
            onOpenDetail={navigateTo.diaryDetail}
          />
        );
      case 'groups':
        return (
          <GroupsScreen
            onSelectGroup={navigateTo.groupDetail}
          />
        );
      default:
        return <HomeScreen onOpenSettings={navigateTo.settings} onOpenDiary={navigateTo.diary} onOpenDiaryDetail={navigateTo.diaryDetail} onOpenTechnique={navigateTo.techniqueDetail} onOpenTechniques={navigateTo.techniques} />;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: '#111' }}
    >
      {/* デバイスフレーム */}
      <div
        className="w-full max-w-[375px] h-[812px] rounded-[3rem] overflow-hidden shadow-2xl relative"
        style={{
          background: theme.bg,
          boxShadow: `0 25px 80px ${theme.primary}30`,
        }}
      >
        {/* ノッチ */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-b-2xl z-50" />

        {/* ホームインジケーター */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/20 rounded-full z-50" />

        {/* コンテンツ */}
        <div className="h-full pt-8 flex flex-col relative">
          {renderScreen()}
          {!subScreen && (
            <BottomNav active={activeTab} setActive={handleTabChange} />
          )}
        </div>
      </div>

      {/* 設定ボタン（開発用） */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={navigateTo.settings}
          className="text-sm text-white/60 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          ⚙️ 帯を変更
        </button>
        <button
          onClick={() => navigateTo.flowEditor()}
          className="text-sm text-white px-4 py-2 rounded-full transition"
          style={{ background: theme.gradient }}
        >
          ✨ フローエディタ
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
