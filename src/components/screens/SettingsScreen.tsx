'use client';

import React, { useState } from 'react';
import { Bell, Shield, Download, LogOut, ChevronRight, X, User } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { beltThemes, BeltColor } from '@/types';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { theme, beltColor, setBeltColor, stripes, setStripes, techniques, flows, trainingLogs } = useApp();
  const maxStripes = beltThemes[beltColor].maxStripes;
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const beltOptions: { value: BeltColor; label: string; emoji: string }[] = [
    { value: 'white', label: '白帯', emoji: '⬜' },
    { value: 'blue', label: '青帯', emoji: '🟦' },
    { value: 'purple', label: '紫帯', emoji: '🟪' },
    { value: 'brown', label: '茶帯', emoji: '🟫' },
    { value: 'black', label: '黒帯', emoji: '⬛' },
  ];

  const handleExport = () => {
    const data = {
      techniques,
      flows,
      trainingLogs,
      settings: { beltColor, stripes },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bjj-hub-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <div
        className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
        style={{ background: theme.gradient }}
      />

      <Header title="設定" showBack onBack={onBack} />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-6 relative z-10">
        {/* プロフィール */}
        <div>
          <h3 className="text-white/50 text-sm font-medium mb-3">プロフィール</h3>
          <Card onClick={() => setShowProfileModal(true)}>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: theme.gradient }}
              >
                <span className="text-2xl font-bold text-white">S</span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">Shogo</p>
                <p className="text-white/40 text-sm">プロフィールを編集</p>
              </div>
              <ChevronRight size={18} className="text-white/20" />
            </div>
          </Card>
        </div>

        {/* 帯の設定 */}
        <div>
          <h3 className="text-white/50 text-sm font-medium mb-3">帯の設定</h3>
          <Card className="space-y-4">
            {/* 帯色 */}
            <div>
              <p className="text-white/60 text-sm mb-3">帯色</p>
              <div className="flex gap-2">
                {beltOptions.map((belt) => (
                  <button
                    key={belt.value}
                    onClick={() => setBeltColor(belt.value)}
                    className={`flex-1 py-3 rounded-xl text-center transition-all ${
                      beltColor === belt.value
                        ? 'ring-2 ring-white scale-105'
                        : ''
                    }`}
                    style={{
                      background: beltThemes[belt.value].gradient,
                    }}
                  >
                    <span className="text-lg">{belt.emoji}</span>
                    <p className="text-white text-xs mt-1">{belt.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ストライプ */}
            <div>
              <p className="text-white/60 text-sm mb-3">
                ストライプ: {stripes} / {maxStripes}
              </p>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setStripes(0)}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    stripes === 0 ? 'bg-white text-black' : ''
                  }`}
                  style={{
                    background: stripes === 0 ? undefined : theme.card,
                    color: stripes === 0 ? undefined : 'rgba(255,255,255,0.6)',
                  }}
                >
                  なし
                </button>
                <div className="flex gap-1 flex-1 justify-center">
                  {[...Array(maxStripes)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStripes(i + 1)}
                      className={`w-4 h-8 rounded transition-all ${
                        stripes >= i + 1 ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* その他の設定 */}
        <div>
          <h3 className="text-white/50 text-sm font-medium mb-3">アプリ設定</h3>
          <div className="space-y-2">
            <Card className="flex items-center gap-4" onClick={() => setShowNotificationModal(true)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}20` }}
              >
                <Bell size={18} style={{ color: theme.primary }} />
              </div>
              <span className="text-white flex-1">通知設定</span>
              <ChevronRight size={18} className="text-white/20" />
            </Card>

            <Card className="flex items-center gap-4" onClick={() => setShowPrivacyModal(true)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}20` }}
              >
                <Shield size={18} style={{ color: theme.primary }} />
              </div>
              <span className="text-white flex-1">プライバシー</span>
              <ChevronRight size={18} className="text-white/20" />
            </Card>

            <Card className="flex items-center gap-4" onClick={() => setShowExportModal(true)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}20` }}
              >
                <Download size={18} style={{ color: theme.primary }} />
              </div>
              <span className="text-white flex-1">データエクスポート</span>
              <ChevronRight size={18} className="text-white/20" />
            </Card>
          </div>
        </div>

        {/* データ統計 */}
        <div>
          <h3 className="text-white/50 text-sm font-medium mb-3">データ</h3>
          <Card>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold" style={{ color: theme.accent }}>
                  {techniques.length}
                </div>
                <div className="text-xs text-white/40">技</div>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: theme.accent }}>
                  {flows.length}
                </div>
                <div className="text-xs text-white/40">フロー</div>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: theme.accent }}>
                  {trainingLogs.length}
                </div>
                <div className="text-xs text-white/40">練習記録</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ログアウト */}
        <Card className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.2)' }}
          >
            <LogOut size={18} className="text-red-500" />
          </div>
          <span className="text-red-400 flex-1">ログアウト</span>
        </Card>

        {/* バージョン情報 */}
        <div className="text-center pt-4">
          <p className="text-white/30 text-xs">BJJ Hub v1.0.0</p>
          <p className="text-white/20 text-xs mt-1">© 2025 BJJ Hub</p>
        </div>
      </div>

      {/* プロフィール編集モーダル */}
      {showProfileModal && (
        <SettingsModal
          theme={theme}
          title="プロフィール編集"
          onClose={() => setShowProfileModal(false)}
        >
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center"
                style={{ background: theme.gradient }}
              >
                <span className="text-4xl font-bold text-white">S</span>
              </div>
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">表示名</label>
              <input
                type="text"
                defaultValue="Shogo"
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">柔術開始日</label>
              <input
                type="date"
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">自己紹介</label>
              <textarea
                placeholder="柔術を始めた理由や目標など..."
                rows={3}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30 resize-none"
              />
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="w-full py-4 rounded-xl text-white font-semibold"
              style={{ background: theme.gradient }}
            >
              保存
            </button>
          </div>
        </SettingsModal>
      )}

      {/* 通知設定モーダル */}
      {showNotificationModal && (
        <SettingsModal
          theme={theme}
          title="通知設定"
          onClose={() => setShowNotificationModal(false)}
        >
          <div className="space-y-4">
            <ToggleSetting label="練習リマインダー" defaultChecked={true} theme={theme} />
            <ToggleSetting label="グループ通知" defaultChecked={true} theme={theme} />
            <ToggleSetting label="新しい共有フロー" defaultChecked={false} theme={theme} />
            <p className="text-white/30 text-xs text-center mt-4">
              ※ この機能は将来のバージョンで有効になります
            </p>
          </div>
        </SettingsModal>
      )}

      {/* プライバシーモーダル */}
      {showPrivacyModal && (
        <SettingsModal
          theme={theme}
          title="プライバシー"
          onClose={() => setShowPrivacyModal(false)}
        >
          <div className="space-y-4">
            <ToggleSetting label="プロフィールを公開" defaultChecked={false} theme={theme} />
            <ToggleSetting label="練習記録をグループに共有" defaultChecked={false} theme={theme} />
            <div className="pt-4 border-t" style={{ borderColor: theme.cardBorder }}>
              <button className="w-full py-3 rounded-xl text-red-400" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                全データを削除
              </button>
            </div>
          </div>
        </SettingsModal>
      )}

      {/* エクスポートモーダル */}
      {showExportModal && (
        <SettingsModal
          theme={theme}
          title="データエクスポート"
          onClose={() => setShowExportModal(false)}
        >
          <div className="space-y-4">
            <p className="text-white/70 text-sm">
              すべてのデータをJSONファイルとしてエクスポートします。
            </p>
            <Card>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">技</span>
                  <span className="text-white">{techniques.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">フロー</span>
                  <span className="text-white">{flows.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">練習記録</span>
                  <span className="text-white">{trainingLogs.length}件</span>
                </div>
              </div>
            </Card>
            <button
              onClick={handleExport}
              className="w-full py-4 rounded-xl text-white font-semibold"
              style={{ background: theme.gradient }}
            >
              エクスポート
            </button>
          </div>
        </SettingsModal>
      )}
    </div>
  );
}

// 設定モーダル共通コンポーネント
interface SettingsModalProps {
  theme: any;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function SettingsModal({ theme, title, onClose, children }: SettingsModalProps) {
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
          <h3 className="text-white font-semibold text-lg">{title}</h3>
          <button onClick={onClose}>
            <X size={24} className="text-white/60" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// トグル設定コンポーネント
interface ToggleSettingProps {
  label: string;
  defaultChecked: boolean;
  theme: any;
}

function ToggleSetting({ label, defaultChecked, theme }: ToggleSettingProps) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-white">{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        className="w-12 h-7 rounded-full transition-all relative"
        style={{
          background: checked ? theme.gradient : 'rgba(255,255,255,0.1)',
        }}
      >
        <div
          className="w-5 h-5 bg-white rounded-full absolute top-1 transition-all"
          style={{
            left: checked ? '26px' : '4px',
          }}
        />
      </button>
    </div>
  );
}
