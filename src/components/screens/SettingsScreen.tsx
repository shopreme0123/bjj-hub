'use client';

import React, { useState, useRef } from 'react';
import { Bell, Shield, Download, LogOut, ChevronRight, X, User, Camera, Loader2, Globe, Check } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n, languageNames, Language } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { useToast } from '@/components/ui/Toast';
import { beltThemes, BeltColor } from '@/types';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { theme, beltColor, setBeltColor, stripes, setStripes, techniques, flows, trainingLogs, profile, updateProfile } = useApp();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useI18n();
  const { showToast } = useToast();
  const maxStripes = beltThemes[beltColor].maxStripes;
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const beltOptions: { value: BeltColor; labelKey: string }[] = [
    { value: 'white', labelKey: 'belt.white' },
    { value: 'blue', labelKey: 'belt.blue' },
    { value: 'purple', labelKey: 'belt.purple' },
    { value: 'brown', labelKey: 'belt.brown' },
    { value: 'black', labelKey: 'belt.black' },
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
        className="absolute top-0 left-0 right-0 h-48 rounded-b-3xl"
        style={{ background: theme.gradient }}
      />

      <Header title={t('settings.title')} showBack onBack={onBack} />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-6 relative z-10">
        {/* プロフィール */}
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>{t('settings.profile')}</h3>
          <Card onClick={() => setShowProfileModal(true)}>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: theme.gradient }}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{initial}</span>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium" style={{ color: theme.text }}>{displayName}</p>
                <p className="text-sm" style={{ color: theme.textMuted }}>{t('settings.profile_edit')}</p>
              </div>
              <ChevronRight size={18} style={{ color: theme.textMuted }} />
            </div>
          </Card>
        </div>

        {/* 帯の設定 */}
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>{t('settings.belt_settings')}</h3>
          <Card className="space-y-4">
            {/* 帯色 */}
            <div>
              <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>{t('settings.belt_color')}</p>
              <div className="flex gap-2">
                {beltOptions.map((belt) => (
                  <button
                    key={belt.value}
                    onClick={() => setBeltColor(belt.value)}
                    className={`flex-1 py-3 rounded-xl text-center transition-all ${
                      beltColor === belt.value ? 'ring-2 ring-offset-2 scale-105' : ''
                    }`}
                    style={{
                      background: beltThemes[belt.value].gradient,
                    }}
                  >
                    <p className="text-white text-xs font-medium">{t(belt.labelKey)}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* ストライプ */}
            <div>
              <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
                {t('settings.stripes')}: {stripes} / {maxStripes}
              </p>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setStripes(0)}
                  className="px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    background: stripes === 0 ? theme.primary : theme.cardBorder,
                    color: stripes === 0 ? 'white' : theme.textSecondary,
                  }}
                >
                  0
                </button>
                <div className="flex gap-1 flex-1 justify-center">
                  {[...Array(maxStripes)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStripes(i + 1)}
                      className="w-4 h-8 rounded transition-all"
                      style={{
                        background: stripes >= i + 1 ? theme.primary : theme.cardBorder,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* その他の設定 */}
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>{t('settings.notifications')}</h3>
          <div className="space-y-2">
            <Card className="flex items-center gap-4" onClick={() => setShowNotificationModal(true)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}15` }}
              >
                <Bell size={18} style={{ color: theme.primary }} />
              </div>
              <span className="flex-1" style={{ color: theme.text }}>{t('settings.notification_settings')}</span>
              <ChevronRight size={18} style={{ color: theme.textMuted }} />
            </Card>

            <Card className="flex items-center gap-4" onClick={() => setShowPrivacyModal(true)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}15` }}
              >
                <Shield size={18} style={{ color: theme.primary }} />
              </div>
              <span className="flex-1" style={{ color: theme.text }}>{t('settings.privacy_settings')}</span>
              <ChevronRight size={18} style={{ color: theme.textMuted }} />
            </Card>

            <Card className="flex items-center gap-4" onClick={() => setShowLanguageModal(true)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}15` }}
              >
                <Globe size={18} style={{ color: theme.primary }} />
              </div>
              <span className="flex-1" style={{ color: theme.text }}>{t('settings.language_settings')}</span>
              <span className="text-sm" style={{ color: theme.textMuted }}>{languageNames[language]}</span>
              <ChevronRight size={18} style={{ color: theme.textMuted }} />
            </Card>

            <Card className="flex items-center gap-4" onClick={() => setShowExportModal(true)}>
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: `${theme.primary}15` }}
              >
                <Download size={18} style={{ color: theme.primary }} />
              </div>
              <span className="flex-1" style={{ color: theme.text }}>{t('settings.export_data')}</span>
              <ChevronRight size={18} style={{ color: theme.textMuted }} />
            </Card>
          </div>
        </div>

        {/* データ統計 */}
        <div>
          <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>{t('settings.data')}</h3>
          <Card>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold" style={{ color: theme.primary }}>
                  {techniques.length}
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>{t('nav.techniques')}</div>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: theme.primary }}>
                  {flows.length}
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>{t('nav.flows')}</div>
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color: theme.primary }}>
                  {trainingLogs.length}
                </div>
                <div className="text-xs" style={{ color: theme.textMuted }}>{t('nav.diary')}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* ログアウト */}
        <Card 
          className="flex items-center gap-4"
          onClick={async () => {
            if (confirm(t('settings.logout') + '?')) {
              await signOut();
            }
          }}
        >
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(239, 68, 68, 0.15)' }}
          >
            <LogOut size={18} className="text-red-500" />
          </div>
          <span className="text-red-500 flex-1">{t('settings.logout')}</span>
        </Card>

        {/* バージョン情報 */}
        <div className="text-center pt-4">
          <p className="text-xs" style={{ color: theme.textMuted }}>BJJ Hub v1.0.0</p>
          <p className="text-xs mt-1" style={{ color: theme.textMuted }}>© 2025 BJJ Hub</p>
        </div>
      </div>

      {/* プロフィール編集モーダル */}
      {showProfileModal && (
        <ProfileEditModal
          theme={theme}
          profile={profile}
          user={user}
          onClose={() => setShowProfileModal(false)}
          onSave={async (updates) => {
            await updateProfile(updates);
            setShowProfileModal(false);
          }}
        />
      )}

      {/* 言語設定モーダル */}
      {showLanguageModal && (
        <SettingsModal
          theme={theme}
          title={t('settings.language_settings')}
          onClose={() => setShowLanguageModal(false)}
        >
          <div className="space-y-2">
            {(['ja', 'en', 'pt'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setShowLanguageModal(false);
                  showToast(t('toast.saved'));
                }}
                className="w-full p-4 rounded-xl flex items-center justify-between transition-all"
                style={{
                  background: language === lang ? `${theme.primary}15` : theme.card,
                  border: `1px solid ${language === lang ? theme.primary : theme.cardBorder}`,
                }}
              >
                <span style={{ color: theme.text }}>{languageNames[lang]}</span>
                {language === lang && (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: theme.primary }}>
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </SettingsModal>
      )}

      {/* 通知設定モーダル */}
      {showNotificationModal && (
        <SettingsModal
          theme={theme}
          title={t('settings.notification_settings')}
          onClose={() => setShowNotificationModal(false)}
        >
          <div className="space-y-4">
            <ToggleSetting label={t('settings.training_reminder')} defaultChecked={true} theme={theme} />
            <ToggleSetting label={t('settings.group_updates')} defaultChecked={true} theme={theme} />
            <ToggleSetting label={t('settings.weekly_summary')} defaultChecked={false} theme={theme} />
            <p className="text-xs text-center mt-4" style={{ color: theme.textMuted }}>
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
            <p className="text-sm" style={{ color: theme.text }}>
              すべてのデータをJSONファイルとしてエクスポートします。
            </p>
            <Card>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: theme.textSecondary }}>技</span>
                  <span style={{ color: theme.text }}>{techniques.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textSecondary }}>フロー</span>
                  <span style={{ color: theme.text }}>{flows.length}件</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: theme.textSecondary }}>練習記録</span>
                  <span style={{ color: theme.text }}>{trainingLogs.length}件</span>
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
      className="absolute inset-0 bg-black/40 flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 max-h-[80%] overflow-auto animate-slide-up shadow-xl"
        style={{ background: theme.card }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>{title}</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textMuted }} />
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
      <span style={{ color: theme.text }}>{label}</span>
      <button
        onClick={() => setChecked(!checked)}
        className="w-12 h-7 rounded-full transition-all relative"
        style={{
          background: checked ? theme.gradient : theme.cardBorder,
        }}
      >
        <div
          className="w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm"
          style={{
            left: checked ? '26px' : '4px',
          }}
        />
      </button>
    </div>
  );
}

// プロフィール編集モーダル
interface ProfileEditModalProps {
  theme: any;
  profile: any;
  user: any;
  onClose: () => void;
  onSave: (updates: any) => Promise<void>;
}

function ProfileEditModal({ theme, profile, user, onClose, onSave }: ProfileEditModalProps) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile?.display_name || user?.user_metadata?.display_name || '');
  const [bjjStartDate, setBjjStartDate] = useState(profile?.bjj_start_date || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const initial = displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // ファイルサイズチェック（2MB以下）
    if (file.size > 2 * 1024 * 1024) {
      showToast('画像は2MB以下にしてください', 'error');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Supabase Storageにアップロード
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      showToast('画像をアップロードしました');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('アップロードに失敗しました', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        display_name: displayName,
        bjj_start_date: bjjStartDate || null,
        bio: bio || null,
        avatar_url: avatarUrl || null,
      });
      showToast('プロフィールを更新しました');
    } catch (error) {
      showToast('更新に失敗しました', 'error');
    } finally {
      setSaving(false);
    }
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
          <h3 className="font-semibold text-lg" style={{ color: theme.text }}>プロフィール編集</h3>
          <button onClick={onClose}>
            <X size={24} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="space-y-4">
          {/* アバター画像 */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden"
                style={{ background: theme.gradient }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{initial}</span>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: theme.gradient }}
              >
                {uploading ? (
                  <Loader2 size={16} className="text-white animate-spin" />
                ) : (
                  <Camera size={16} className="text-white" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* 表示名 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>表示名</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="表示名を入力"
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 柔術開始日 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>柔術開始日</label>
            <input
              type="date"
              value={bjjStartDate}
              onChange={(e) => setBjjStartDate(e.target.value)}
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 自己紹介 */}
          <div>
            <label className="text-sm mb-2 block" style={{ color: theme.textSecondary }}>自己紹介</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="柔術を始めた理由や目標など..."
              rows={3}
              className="w-full rounded-xl px-4 py-3 outline-none border focus:border-blue-500 resize-none"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: theme.gradient }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : null}
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
