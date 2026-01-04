'use client';

import React, { useState } from 'react';
import { Bell, Settings, Check, Clock, ChevronRight, Play, Plus, X } from 'lucide-react';
import { useApp } from '@/lib/context';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { Card } from '@/components/ui/Card';
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
  const initial = displayName.charAt(0).toUpperCase();

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

  const beltBgColor = beltColor === 'white' ? '#e2e8f0' : 
                     beltColor === 'blue' ? '#2563eb' :
                     beltColor === 'purple' ? '#7c3aed' :
                     beltColor === 'brown' ? '#92400e' : '#18181b';

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* ヘッダー背景 */}
      <div
        className="absolute top-0 left-0 right-0 h-64 rounded-b-3xl"
        style={{ background: theme.gradient }}
      />

      {/* ヘッダー */}
      <div className="px-5 pt-12 pb-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-white/70 text-sm">{t('home.welcome')}</p>
            <h1 className="text-white text-xl font-bold">{displayName}</h1>
          </div>
          <div className="flex gap-2">
            <button
              className="p-2 rounded-full bg-white/20"
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={18} className="text-white" />
            </button>
            <button
              className="p-2 rounded-full bg-white/20"
              onClick={onOpenSettings}
            >
              <Settings size={18} className="text-white" />
            </button>
          </div>
        </div>

        {/* 帯表示 */}
        <div className="bg-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-4 rounded-full flex items-center justify-end pr-1 gap-0.5"
              style={{ background: beltBgColor }}
            >
              {[...Array(stripes)].map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-1.5 bg-white rounded-sm"
                  style={{
                    border: beltColor === 'white' ? '1px solid rgba(0,0,0,0.2)' : 'none',
                    boxShadow: beltColor === 'white' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                  }}
                />
              ))}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold">
                {t(`belt.${beltColor}`)} {stripes > 0 ? t('belt.stripes', { count: stripes }) : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="px-5 -mt-2 relative z-20">
        <Card className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>{techniques.length}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>{t('home.stats.techniques')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>
                {trainingLogs.filter(l => l.training_date.startsWith(today.getFullYear().toString())).length}
              </p>
              <p className="text-xs" style={{ color: theme.textMuted }}>{t('home.stats.flows')}</p>
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: theme.primary }}>{totalTrainingDays}</p>
              <p className="text-xs" style={{ color: theme.textMuted }}>{t('home.stats.training_days')}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-5 mt-5">
        {/* 今週の練習 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold" style={{ color: theme.text }}>{t('home.this_week')}</h2>
            <span className="text-sm" style={{ color: theme.primary }}>{t('home.times', { count: thisWeekCount })}</span>
          </div>
          <Card className="p-4" onClick={onOpenDiary}>
            <div className="flex justify-between">
              {weekDays.map((day, i) => (
                <div key={day} className="flex flex-col items-center gap-2">
                  <span className="text-xs" style={{ color: theme.textMuted }}>{day}</span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ background: weekPractice[i] ? theme.gradient : theme.cardBorder }}
                  >
                    {weekPractice[i] && <Check size={14} className="text-white" />}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 最近の練習 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold" style={{ color: theme.text }}>{t('home.recent_training')}</h2>
            <button className="text-sm font-medium" style={{ color: theme.primary }} onClick={onOpenDiary}>
              {t('home.see_all')} →
            </button>
          </div>
          {trainingLogs.length === 0 ? (
            <Card className="text-center py-6" onClick={onOpenDiary}>
              <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>{t('diary.no_logs')}</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {trainingLogs.slice(0, 3).map((log) => (
                <Card key={log.id} className="flex items-center gap-4" onClick={() => onOpenDiaryDetail?.(log)}>
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: `${theme.primary}15` }}
                  >
                    <span className="text-sm font-bold" style={{ color: theme.primary }}>
                      {log.training_date.split('-')[2]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                      {log.notes || log.content || 'Training'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} style={{ color: theme.textMuted }} />
                      <span className="text-xs" style={{ color: theme.textMuted }}>{log.duration_minutes}min</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: theme.textMuted }} />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 技ライブラリ */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold" style={{ color: theme.text }}>{t('techniques.title')}</h2>
            <button className="text-sm font-medium" style={{ color: theme.primary }} onClick={onOpenTechniques}>
              {t('home.see_all')} →
            </button>
          </div>
          {techniques.length === 0 ? (
            <Card className="text-center py-6" onClick={onOpenTechniques}>
              <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>{t('home.no_techniques')}</p>
              <button className="px-4 py-2 rounded-lg text-sm text-white" style={{ background: theme.gradient }}>
                {t('home.add_first_technique')}
              </button>
            </Card>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
              {displayTechniques.map((tech) => {
                const thumbnailUrl = getYouTubeThumbnail(tech.video_url);
                return (
                  <Card key={tech.id} className="flex-shrink-0 w-44" onClick={() => onOpenTechnique?.(tech)}>
                    <div
                      className="aspect-video rounded-lg mb-3 flex items-center justify-center overflow-hidden relative"
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
                            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                              <Play size={16} fill={theme.primary} style={{ color: theme.primary, marginLeft: 2 }} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Play size={24} style={{ color: theme.primary }} />
                      )}
                    </div>
                    <p className="text-sm font-medium truncate" style={{ color: theme.text }}>{tech.name}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: theme.textMuted }}>{tech.name_en}</p>
                  </Card>
                );
              })}
              <div
                className="flex-shrink-0 w-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                style={{ borderColor: theme.cardBorder, minHeight: '140px' }}
                onClick={onOpenTechniques}
              >
                <Plus size={24} style={{ color: theme.textMuted }} className="mb-2" />
                <span className="text-xs" style={{ color: theme.textMuted }}>{t('techniques.add')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 通知モーダル */}
      {showNotifications && (
        <div
          className="absolute inset-0 bg-black/40 flex items-start justify-center pt-20 z-50 animate-fade-in"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="w-[90%] rounded-2xl p-5 shadow-xl animate-slide-down"
            style={{ background: theme.card }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold" style={{ color: theme.text }}>{t('settings.notifications')}</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X size={20} style={{ color: theme.textMuted }} />
              </button>
            </div>
            <div className="text-center py-8">
              <Bell size={32} style={{ color: theme.textMuted }} className="mx-auto mb-3" />
              <p className="text-sm" style={{ color: theme.textSecondary }}>No new notifications</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
