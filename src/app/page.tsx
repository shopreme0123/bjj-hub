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
      className="h-screen w-full flex flex-col"
      style={{ background: theme.bg }}
    >
      {/* コンテンツ */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {renderScreen()}
        {!subScreen && (
          <BottomNav active={activeTab} setActive={handleTabChange} />
        )}
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
