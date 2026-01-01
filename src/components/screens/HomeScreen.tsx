'use client';

import React, { useState } from 'react';
import { Bell, Settings, Flame, Check, Clock, ChevronRight, Play, Plus, X } from 'lucide-react';
import { useApp } from '@/lib/context';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Technique, TrainingLog } from '@/types';

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
  const { theme, stripes, techniques, trainingLogs } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  // 今週の練習日を計算
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // 月曜日

  const weekDays = ['月', '火', '水', '木', '金', '土', '日'];
  const weekPractice = weekDays.map((_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    return trainingLogs.some(log => log.training_date === dateStr);
  });

  // 連続練習日数を計算
  let streak = 0;
  for (let i = weekPractice.length - 1; i >= 0; i--) {
    if (weekPractice[i]) streak++;
    else if (streak > 0) break;
  }

  // 今月の練習回数
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();
  const monthlyCount = trainingLogs.filter(log => {
    const logDate = new Date(log.training_date);
    return logDate.getMonth() === thisMonth && logDate.getFullYear() === thisYear;
  }).length;

  // 累計時間
  const totalHours = Math.round(
    trainingLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0) / 60 * 10
  ) / 10;

  // 得意技（favorite）
  const favoriteTechniques = techniques.filter(t => t.mastery_level === 'favorite');
  const displayTechniques = favoriteTechniques.length > 0 ? favoriteTechniques : techniques.slice(0, 3);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー背景グラデーション */}
      <div
        className="absolute top-0 left-0 right-0 h-72 opacity-30 pointer-events-none"
        style={{ background: theme.gradient }}
      />

      <Header
        title=""
        rightAction={
          <div className="flex gap-2 relative z-10">
            <button
              className="p-2 rounded-full"
              style={{ background: theme.card }}
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={18} color="white" className="opacity-70" />
            </button>
            <button
              className="p-2 rounded-full"
              style={{ background: theme.card }}
              onClick={onOpenSettings}
            >
              <Settings size={18} color="white" className="opacity-70" />
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-6 relative z-10">
        {/* プロフィールカード */}
        <div 
          className="flex items-center gap-4 py-2 cursor-pointer"
          onClick={onOpenSettings}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: theme.gradient }}
          >
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Shogo</h2>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="h-3 w-20 rounded-full flex items-center justify-end px-1 gap-0.5"
                style={{ background: theme.gradient }}
              >
                {[...Array(stripes)].map((_, i) => (
                  <div key={i} className="h-2 w-1 bg-white rounded-sm" />
                ))}
              </div>
              <span className="text-white/50 text-sm">{stripes}ストライプ</span>
            </div>
          </div>
        </div>

        {/* 週間練習 */}
        <Card onClick={onOpenDiary}>
          <div className="flex justify-between items-center mb-4">
            <span className="text-white/50 text-sm font-medium">今週の練習</span>
            {streak > 0 && (
              <div className="flex items-center gap-1">
                <Flame size={16} style={{ color: theme.accent }} />
                <span style={{ color: theme.accent }} className="text-sm font-semibold">
                  {streak}日連続
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {weekDays.map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-500"
                  style={{
                    background: weekPractice[i] ? theme.gradient : 'rgba(255,255,255,0.05)',
                    boxShadow: weekPractice[i] ? `0 4px 20px ${theme.primary}40` : 'none',
                  }}
                >
                  {weekPractice[i] && <Check size={16} className="text-white" />}
                </div>
                <span className={`text-xs ${weekPractice[i] ? 'text-white' : 'text-white/30'}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* 統計サマリー */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '今月', value: monthlyCount.toString(), unit: '回' },
            { label: '累計', value: totalHours.toString(), unit: '時間' },
            { label: '技数', value: techniques.length.toString(), unit: '個' },
          ].map((stat, i) => (
            <Card key={i} className="text-center py-5" onClick={i < 2 ? onOpenDiary : onOpenTechniques}>
              <div className="text-2xl font-bold text-white">
                {stat.value}
                <span className="text-sm font-normal text-white/40 ml-0.5">
                  {stat.unit}
                </span>
              </div>
              <div className="text-xs text-white/40 mt-1">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* 最近の練習 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm font-semibold">最近の練習</h3>
            <button 
              className="text-sm font-medium" 
              style={{ color: theme.primary }}
              onClick={onOpenDiary}
            >
              すべて
            </button>
          </div>
          {trainingLogs.length === 0 ? (
            <Card className="text-center py-6" onClick={onOpenDiary}>
              <p className="text-white/40 text-sm mb-2">練習記録がありません</p>
              <p className="text-white/30 text-xs">日記タブから記録を追加しましょう</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {trainingLogs.slice(0, 3).map((log) => (
                <Card 
                  key={log.id} 
                  className="flex items-center gap-4"
                  onClick={() => onOpenDiaryDetail?.(log)}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex flex-col items-center justify-center"
                    style={{ background: theme.gradient }}
                  >
                    <span className="text-white text-xs">
                      {log.training_date.split('-')[2]}
                    </span>
                    <span className="text-white/60 text-[10px]">
                      {new Date(log.training_date).toLocaleDateString('ja-JP', { weekday: 'short' })}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{log.notes || log.content || '練習'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={12} className="text-white/30" />
                      <span className="text-white/30 text-xs">{log.duration_minutes}分</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* 得意技 / 登録技 */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-white/70 text-sm font-semibold">
              {favoriteTechniques.length > 0 ? '得意技' : '登録した技'}
            </h3>
            <button 
              className="text-sm font-medium" 
              style={{ color: theme.primary }}
              onClick={onOpenTechniques}
            >
              すべて
            </button>
          </div>
          {techniques.length === 0 ? (
            <Card className="text-center py-6" onClick={onOpenTechniques}>
              <p className="text-white/40 text-sm mb-2">技が登録されていません</p>
              <p className="text-white/30 text-xs">技タブから技を追加しましょう</p>
            </Card>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
              {displayTechniques.map((tech) => (
                <Card 
                  key={tech.id} 
                  className="flex-shrink-0 w-36"
                  onClick={() => onOpenTechnique?.(tech)}
                >
                  <div
                    className="aspect-video rounded-lg mb-3 flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary}20, ${theme.primary}40)`,
                    }}
                  >
                    <Play size={24} style={{ color: theme.primary }} />
                  </div>
                  <p className="text-white text-sm font-medium truncate">{tech.name}</p>
                  <p className="text-white/30 text-xs mt-0.5 truncate">{tech.name_en}</p>
                </Card>
              ))}
              {/* 技を追加ボタン */}
              <div 
                className="flex-shrink-0 w-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer"
                style={{ borderColor: theme.cardBorder, minHeight: '140px' }}
                onClick={onOpenTechniques}
              >
                <Plus size={24} className="text-white/30 mb-2" />
                <span className="text-white/30 text-xs">技を追加</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 通知モーダル */}
      {showNotifications && (
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 z-50 animate-fade-in"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="w-[90%] rounded-2xl p-5 animate-slide-up"
            style={{ background: theme.bg }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">通知</h3>
              <button onClick={() => setShowNotifications(false)}>
                <X size={20} className="text-white/60" />
              </button>
            </div>
            <div className="text-center py-8">
              <Bell size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-white/40 text-sm">新しい通知はありません</p>
              <p className="text-white/30 text-xs mt-2">
                練習リマインダーやグループ通知がここに表示されます
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
