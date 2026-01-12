'use client';

import React, { useState } from 'react';
import { Bell, Settings, Check, Clock, ChevronRight, Play, Plus, X } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/Header';
import { Technique, TrainingLog } from '@/types';

// YouTubeのURLからサムネイルURLを取得
function getYouTubeThumbnail(url?: string): string | null {
  if (!url) return null;

  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    }
  }

  return null;
}

interface HomeScreenProps {
  onOpenSettings?: () => void;
  onOpenDiary?: () => void;
  onOpenDiaryDetail?: (log: TrainingLog) => void;
  onOpenTechnique?: (technique: Technique) => void;
  onOpenTechniques?: () => void;
}

export function HomeScreen({
  onOpenSettings,
  onOpenDiary,
  onOpenDiaryDetail,
  onOpenTechnique,
  onOpenTechniques,
}: HomeScreenProps) {
  const { theme, stripes, techniques, trainingLogs, profile, beltColor } = useApp();
  const { user } = useAuth();
  const { t, language } = useI18n();
  const [showNotifications, setShowNotifications] = useState(false);

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';

  // 今週の練習日を計算
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1);

  const weekDaysJa = ['月', '火', '水', '木', '金', '土', '日'];
  const weekDaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekDaysPt = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const weekDays = language === 'ja' ? weekDaysJa : language === 'pt' ? weekDaysPt : weekDaysEn;

  const weekPractice = weekDays.map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    return trainingLogs.some(log => log.training_date === dateStr);
  });

  const thisWeekCount = weekPractice.filter(Boolean).length;
  const totalTrainingDays = trainingLogs.length;

  const favoriteTechniques = techniques.filter(t => t.mastery_level === 'favorite');
  const displayTechniques = favoriteTechniques.length > 0 ? favoriteTechniques : techniques.slice(0, 3);

  // 帯の色設定
  const beltColors = {
    white: { main: '#e2e8f0', light: '#f8fafc', dark: '#cbd5e1', shadow: 'rgba(0,0,0,0.15)' },
    blue: { main: '#2563eb', light: '#3b82f6', dark: '#1d4ed8', shadow: 'rgba(0,0,0,0.3)' },
    purple: { main: '#7c3aed', light: '#8b5cf6', dark: '#6d28d9', shadow: 'rgba(0,0,0,0.3)' },
    brown: { main: '#92400e', light: '#b45309', dark: '#78350f', shadow: 'rgba(0,0,0,0.3)' },
    black: { main: '#18181b', light: '#27272a', dark: '#09090b', shadow: 'rgba(0,0,0,0.4)' },
  };
  const belt = beltColors[beltColor];

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* ヘッダー */}
      <div
        className="px-4 py-3 flex items-center justify-between sticky top-0 z-20"
        style={{ background: theme.card, borderBottom: `1px solid ${theme.cardBorder}` }}
      >
        <div className="flex items-center gap-3">
          {/* プロフィールアバター */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden"
            style={{ background: theme.gradient }}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-xs" style={{ color: theme.textMuted }}>{t('home.welcome')}</p>
            <p className="font-bold text-sm" style={{ color: theme.text }}>{displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            icon={<Bell size={18} />}
            onClick={() => setShowNotifications(true)}
          />
          <IconButton
            icon={<Settings size={18} />}
            onClick={onOpenSettings}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-24 space-y-4">
        {/* 帯 & 統計カード */}
        <Card className="!p-4 mt-2">
          {/* 帯を中央配置で大きく表示 */}
          <div className="flex flex-col items-center mb-4 pb-4" style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
            {/* リアルな帯デザイン（大きめ） */}
            <div className="flex mb-3">
              {/* 帯本体（左側） */}
              <div
                className="w-32 h-8 rounded-l-sm relative overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, ${belt.light} 0%, ${belt.main} 30%, ${belt.dark} 100%)`,
                  boxShadow: `0 4px 12px ${belt.shadow}, inset 0 2px 0 ${belt.light}`,
                }}
              >
                {/* 帯の質感（横線） */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
                  }}
                />
                {/* 光沢効果 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 45%)',
                  }}
                />
              </div>
              {/* ストライプ部分（黒帯/赤帯部分） */}
              {/* 黒帯の場合、ストライプ数に応じて幅を動的に調整 */}
              <div
                className="h-8 flex items-center justify-center px-2 relative overflow-hidden"
                style={{
                  width: beltColor === 'black'
                    ? stripes >= 5 ? '96px' : '80px'  // 黒帯：5-6本は96px、それ以下は80px
                    : '64px',  // 他の帯：64px
                  gap: beltColor === 'black' && stripes >= 5 ? '4px' : '6px',  // 5-6本時はギャップを狭める
                  background: beltColor === 'black'
                    ? 'linear-gradient(180deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)'
                    : 'linear-gradient(180deg, #27272a 0%, #18181b 50%, #09090b 100%)',
                  borderLeft: '1px solid rgba(0,0,0,0.3)',
                  borderRight: '1px solid rgba(0,0,0,0.3)',
                }}
              >
                {[...Array(stripes)].map((_, i) => (
                  <div
                    key={i}
                    className="relative"
                    style={{
                      width: beltColor === 'black' ? '8px' : '6px',  // 黒帯のストライプは太めに
                      height: '100%',
                    }}
                  >
                    {/* ストライプ本体 - 帯を巻くように見せる */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(90deg, #d4d4d4 0%, #ffffff 30%, #ffffff 50%, #f5f5f5 70%, #e5e5e5 100%)',
                      }}
                    />
                    {/* 上端の影（巻き込み効果） */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
                      }}
                    />
                    {/* 下端の影（巻き込み効果） */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1"
                      style={{
                        background: 'linear-gradient(0deg, rgba(0,0,0,0.3) 0%, transparent 100%)',
                      }}
                    />
                  </div>
                ))}
              </div>
              {/* 帯本体（右側・短め） */}
              <div
                className="w-6 h-8 rounded-r-sm relative overflow-hidden"
                style={{
                  background: `linear-gradient(180deg, ${belt.light} 0%, ${belt.main} 30%, ${belt.dark} 100%)`,
                  boxShadow: `0 4px 12px ${belt.shadow}, inset 0 2px 0 ${belt.light}`,
                }}
              >
                {/* 帯の質感（横線） */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.05) 3px, rgba(0,0,0,0.05) 4px)',
                  }}
                />
                {/* 光沢効果 */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 45%)',
                  }}
                />
              </div>
            </div>
            <p className="font-bold text-lg" style={{ color: theme.text }}>
              {t(`belt.${beltColor}`)}
            </p>
            {stripes > 0 && (
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                {t('belt.stripes', { count: stripes })}
              </p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold" style={{ color: theme.primary }}>{techniques.length}</p>
              <p className="text-[10px]" style={{ color: theme.textMuted }}>{t('home.stats.techniques')}</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: theme.primary }}>
                {trainingLogs.filter(l => l.training_date.startsWith(today.getFullYear().toString())).length}
              </p>
              <p className="text-[10px]" style={{ color: theme.textMuted }}>{t('home.stats.flows')}</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: theme.primary }}>{totalTrainingDays}</p>
              <p className="text-[10px]" style={{ color: theme.textMuted }}>{t('home.stats.training_days')}</p>
            </div>
          </div>
        </Card>

        {/* 今週の練習 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-sm" style={{ color: theme.text }}>{t('home.this_week')}</h2>
            <span className="text-xs font-medium" style={{ color: theme.primary }}>{t('home.times', { count: thisWeekCount })}</span>
          </div>
          <Card className="!p-3" onClick={onOpenDiary}>
            <div className="flex justify-between">
              {weekDays.map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px]" style={{ color: theme.textMuted }}>{day}</span>
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: weekPractice[i] ? theme.primary : theme.cardBorder }}
                  >
                    {weekPractice[i] && <Check size={12} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 最近の練習 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-sm" style={{ color: theme.text }}>{t('home.recent_training')}</h2>
            <button className="text-xs font-medium" style={{ color: theme.primary }} onClick={onOpenDiary}>
              {t('home.see_all')} →
            </button>
          </div>
          {trainingLogs.length === 0 ? (
            <Card className="text-center py-6" onClick={onOpenDiary}>
              <p className="text-xs" style={{ color: theme.textMuted }}>{t('diary.no_logs')}</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {trainingLogs.slice(0, 3).map((log) => {
                const techniqueNames = log.techniques?.slice(0, 3).map(t => t.name).join('、');
                const displayContent = techniqueNames || log.content || log.notes || t('home.training');
                return (
                  <Card key={log.id} className="!p-3" onClick={() => onOpenDiaryDetail?.(log)}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                        style={{ background: `${theme.primary}15` }}
                      >
                        <span className="text-sm font-bold" style={{ color: theme.primary }}>
                          {log.training_date.split('-')[2]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                          {displayContent}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex items-center gap-1">
                            <Clock size={10} style={{ color: theme.textMuted }} />
                            <span className="text-[10px]" style={{ color: theme.textMuted }}>{log.duration_minutes}min</span>
                          </div>
                          {log.sparring_rounds && log.sparring_rounds > 0 && (
                            <span className="text-[10px]" style={{ color: theme.textMuted }}>
                              スパー{log.sparring_rounds}R
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={14} style={{ color: theme.textMuted }} />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* 技ライブラリ */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-sm" style={{ color: theme.text }}>{t('techniques.title')}</h2>
            <button className="text-xs font-medium" style={{ color: theme.primary }} onClick={onOpenTechniques}>
              {t('home.see_all')} →
            </button>
          </div>
          {techniques.length === 0 ? (
            <Card className="text-center py-6" onClick={onOpenTechniques}>
              <p className="text-xs mb-2" style={{ color: theme.textMuted }}>{t('home.no_techniques')}</p>
              <button className="px-3 py-1.5 rounded-lg text-xs text-white" style={{ background: theme.primary }}>
                {t('home.add_first_technique')}
              </button>
            </Card>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
              {displayTechniques.map((tech) => {
                const thumbnailUrl = getYouTubeThumbnail(tech.video_url);
                return (
                  <Card key={tech.id} className="flex-shrink-0 w-36 !p-2" onClick={() => onOpenTechnique?.(tech)}>
                    <div
                      className="aspect-video rounded-lg mb-2 flex items-center justify-center overflow-hidden relative"
                      style={{ background: `${theme.primary}15` }}
                    >
                      {thumbnailUrl ? (
                        <>
                          <img
                            src={thumbnailUrl}
                            alt={tech.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                              <Play size={12} fill={theme.primary} style={{ color: theme.primary, marginLeft: 1 }} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Play size={20} style={{ color: theme.primary }} />
                      )}
                    </div>
                    <p className="text-xs font-medium truncate" style={{ color: theme.text }}>{tech.name}</p>
                    <p className="text-[10px] truncate" style={{ color: theme.textMuted }}>{tech.name_en}</p>
                  </Card>
                );
              })}
              <div
                className="flex-shrink-0 w-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                style={{ borderColor: theme.cardBorder, minHeight: '100px' }}
                onClick={onOpenTechniques}
              >
                <Plus size={20} style={{ color: theme.textMuted }} className="mb-1" />
                <span className="text-[10px]" style={{ color: theme.textMuted }}>{t('techniques.add')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 通知モーダル */}
      {showNotifications && (
        <div
          className="absolute inset-0 bg-black/40 flex items-start justify-center pt-16 z-50"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="w-[90%] rounded-xl p-4 shadow-xl animate-slide-down"
            style={{ background: theme.card }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm" style={{ color: theme.text }}>{t('settings.notifications')}</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X size={18} style={{ color: theme.textMuted }} />
              </button>
            </div>
            <div className="text-center py-6">
              <Bell size={28} style={{ color: theme.textMuted }} className="mx-auto mb-2" />
              <p className="text-xs" style={{ color: theme.textMuted }}>No new notifications</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
