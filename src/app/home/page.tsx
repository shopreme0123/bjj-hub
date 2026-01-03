'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { AppProvider, useApp } from '@/lib/context';
import { I18nProvider } from '@/lib/i18n';
import { ToastProvider } from '@/components/ui/Toast';
import { BottomNav, TabId } from '@/components/ui/BottomNav';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { TechniquesScreen, TechniqueDetailScreen } from '@/components/screens/TechniquesScreen';
import { FlowsScreen, FlowEditorScreen } from '@/components/screens/FlowsScreen';
import { DiaryScreen, DiaryDetailScreen } from '@/components/screens/DiaryScreen';
import { GroupsScreen, GroupDetailScreen } from '@/components/screens/GroupsScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { AuthScreen } from '@/components/screens/AuthScreen';
import { Technique, Flow, Group, TrainingLog } from '@/types';

// スプラッシュスクリーン
function SplashScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black">
      <div className="relative mb-6">
        {/* 柔術シルエットロゴ */}
        <div className="w-28 h-28 relative animate-pulse">
          <Image
            src="/bjj-logo.png"
            alt="BJJ Hub"
            fill
            className="object-contain"
            priority
          />
        </div>
        {/* ローディングリング */}
        <div className="absolute -inset-4 border-4 border-transparent border-t-white/50 rounded-full animate-spin" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">BJJ Hub</h1>
      <p className="text-white/50 text-sm">Loading...</p>
    </div>
  );
}

type SubScreen =
  | { type: 'technique-detail'; technique: Technique }
  | { type: 'flow-editor'; flow?: Flow }
  | { type: 'group-detail'; group: Group }
  | { type: 'diary-detail'; log: TrainingLog }
  | { type: 'settings' }
  | null;

function AppContent() {
  const { theme, initialLoading } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  // 初期ロード中はスプラッシュを表示
  if (initialLoading) {
    return <SplashScreen />;
  }

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
    // サブ画面（右からスライドイン）
    if (subScreen) {
      const content = (() => {
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
          default:
            return null;
        }
      })();

      return (
        <div key={subScreen.type} className="h-full animate-slide-in-right" style={{ background: theme.bg }}>
          {content}
        </div>
      );
    }

    // メイン画面（フェードイン）
    const mainContent = (() => {
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
    })();

    return (
      <div key={activeTab} className="h-full animate-fade-in" style={{ background: theme.bg }}>
        {mainContent}
      </div>
    );
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

// 認証チェックコンポーネント
function AuthenticatedApp() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return <AppContent />;
}

export default function HomePage() {
  useEffect(() => {
    // PWA全画面対応: このページでのみoverflow: hiddenを適用
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      // クリーンアップ: ページを離れる時に元に戻す
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <I18nProvider>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <AuthenticatedApp />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
