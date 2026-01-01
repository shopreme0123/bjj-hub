'use client';

import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, X, GitBranch, BookOpen, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useApp } from '@/lib/context';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { TrainingLog, Technique, Flow } from '@/types';

interface DiaryScreenProps {
  onOpenDetail?: (log: TrainingLog) => void;
}

export function DiaryScreen({ onOpenDetail }: DiaryScreenProps) {
  const { theme, trainingLogs, addTrainingLog, getLogByDate, techniques } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('calendar');
  const [showAddModal, setShowAddModal] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // カレンダーの空白セル
  const blankDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  // その日に練習があるかどうか
  const hasPractice = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return trainingLogs.some(log => log.training_date === dateStr);
  };

  // 月間の練習回数
  const monthlyCount = trainingLogs.filter(log => {
    const logDate = new Date(log.training_date);
    return logDate.getMonth() === currentMonth.getMonth() && 
           logDate.getFullYear() === currentMonth.getFullYear();
  }).length;

  // 月間の練習時間
  const monthlyMinutes = trainingLogs
    .filter(log => {
      const logDate = new Date(log.training_date);
      return logDate.getMonth() === currentMonth.getMonth() && 
             logDate.getFullYear() === currentMonth.getFullYear();
    })
    .reduce((sum, log) => sum + (log.duration_minutes || 0), 0);

  const handleAddLog = (data: Omit<TrainingLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    addTrainingLog(data);
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="absolute top-0 left-0 right-0 h-48 opacity-20 pointer-events-none"
        style={{ background: theme.gradient }}
      />

      <Header
        title="練習日記"
        rightAction={
          <button
            className="p-2 rounded-full relative z-10"
            style={{ background: theme.card }}
            onClick={(e) => {
              e.stopPropagation();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} style={{ color: theme.primary }} />
          </button>
        }
      />

      {/* タブ */}
      <div className="flex gap-2 px-5 pb-4 relative z-10">
        {[
          { id: 'calendar', label: 'カレンダー' },
          { id: 'stats', label: '統計' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: activeTab === tab.id ? theme.gradient : 'transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
              border: activeTab === tab.id ? 'none' : `1px solid ${theme.cardBorder}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto px-5 pb-24 relative z-10">
        {activeTab === 'calendar' ? (
          <>
            {/* カレンダー */}
            <Card className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft size={20} className="text-white/40" />
                </button>
                <span className="text-white font-medium">
                  {format(currentMonth, 'yyyy年M月', { locale: ja })}
                </span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight size={20} className="text-white/40" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
                  <div key={d} className="py-2 text-white/30 text-xs">
                    {d}
                  </div>
                ))}

                {/* 空白セル */}
                {blankDays.map((_, i) => (
                  <div key={`blank-${i}`} className="aspect-square" />
                ))}

                {/* 日付セル */}
                {days.map((day) => {
                  const dayNum = day.getDate();
                  const practiced = hasPractice(day);
                  const isSelected =
                    selectedDate && format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

                  return (
                    <button
                      key={dayNum}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs relative transition-all ${isSelected ? 'ring-2 ring-white' : ''}`}
                      style={{
                        background: practiced ? theme.gradient : 'transparent',
                        boxShadow: practiced ? `0 2px 10px ${theme.primary}40` : 'none',
                      }}
                    >
                      <span
                        className={`${
                          practiced ? 'text-white font-medium' : 'text-white/40'
                        }`}
                      >
                        {dayNum}
                      </span>
                      {isToday(day) && (
                        <div
                          className="absolute -bottom-0.5 w-1 h-1 rounded-full"
                          style={{ background: theme.accent }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* 選択日の詳細 */}
            {selectedDate && (
              <div>
                <h3 className="text-white/50 text-sm font-medium mb-3">
                  {format(selectedDate, 'M月d日（E）', { locale: ja })}
                </h3>
                {(() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const log = getLogByDate(dateStr);
                  
                  if (log) {
                    return (
                      <Card onClick={() => onOpenDetail?.(log)}>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock size={14} style={{ color: theme.accent }} />
                          <span className="text-white/70 text-sm">
                            {log.start_time} - {log.end_time}（{log.duration_minutes}分）
                          </span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed mb-3">
                          {log.notes || log.content}
                        </p>
                        {log.sparring_rounds && (
                          <p className="text-white/50 text-xs">
                            スパーリング {log.sparring_rounds}本
                          </p>
                        )}
                        <div className="flex items-center justify-end mt-3">
                          <ChevronRight size={16} className="text-white/20" />
                        </div>
                      </Card>
                    );
                  } else {
                    return (
                      <Card className="text-center py-6">
                        <p className="text-white/50 text-sm mb-3">練習記録がありません</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 rounded-lg text-sm"
                          style={{ background: theme.gradient, color: 'white' }}
                        >
                          記録を追加
                        </button>
                      </Card>
                    );
                  }
                })()}
              </div>
            )}

            {/* 最近の練習一覧 */}
            {trainingLogs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white/50 text-sm font-medium mb-3">最近の練習</h3>
                <div className="space-y-2">
                  {trainingLogs.slice(0, 5).map((log) => (
                    <Card 
                      key={log.id} 
                      className="flex items-center gap-3"
                      onClick={() => onOpenDetail?.(log)}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex flex-col items-center justify-center"
                        style={{ background: theme.gradient }}
                      >
                        <span className="text-white text-xs">
                          {log.training_date.split('-')[2]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{log.notes || log.content}</p>
                        <p className="text-white/40 text-xs">{log.duration_minutes}分</p>
                      </div>
                      <ChevronRight size={16} className="text-white/20" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* 統計画面 */
          <div className="space-y-4">
            {/* 月間サマリー */}
            <Card>
              <h3 className="text-white/50 text-sm mb-4">
                {format(currentMonth, 'yyyy年M月', { locale: ja })}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                    {monthlyCount}
                  </div>
                  <div className="text-xs text-white/40">練習回数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                    {Math.round(monthlyMinutes / 60 * 10) / 10}
                  </div>
                  <div className="text-xs text-white/40">時間</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                    {trainingLogs.length}
                  </div>
                  <div className="text-xs text-white/40">総練習回数</div>
                </div>
              </div>
            </Card>

            {/* よく使う技 */}
            <Card>
              <h3 className="text-white/50 text-sm mb-4">登録済みの技 TOP5</h3>
              <div className="space-y-3">
                {techniques.slice(0, 5).map((tech, i) => (
                  <div key={tech.id} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm text-white/50">{i + 1}</span>
                    <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${100 - i * 15}%`,
                          background: theme.gradient,
                        }}
                      />
                    </div>
                    <span className="text-sm text-white w-24 truncate">{tech.name}</span>
                  </div>
                ))}
                {techniques.length === 0 && (
                  <p className="text-white/30 text-sm text-center py-4">
                    技が登録されていません
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 練習追加モーダル */}
      {showAddModal && (
        <AddTrainingModal 
          theme={theme} 
          onClose={() => setShowAddModal(false)}
          onSave={handleAddLog}
          initialDate={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
        />
      )}
    </div>
  );
}

// 練習追加モーダル
interface AddTrainingModalProps {
  theme: any;
  onClose: () => void;
  onSave: (data: Omit<TrainingLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  initialDate?: string;
}

function AddTrainingModal({ theme, onClose, onSave, initialDate }: AddTrainingModalProps) {
  const [date, setDate] = useState(initialDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState('19:00');
  const [endTime, setEndTime] = useState('20:30');
  const [content, setContent] = useState('');
  const [notes, setNotes] = useState('');
  const [sparringRounds, setSparringRounds] = useState('');
  const [condition, setCondition] = useState(3);

  // 時間から分数を計算
  const calculateDuration = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  const handleSubmit = () => {
    onSave({
      training_date: date,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: calculateDuration(),
      content: content || undefined,
      notes: notes || undefined,
      condition,
      sparring_rounds: sparringRounds ? parseInt(sparringRounds) : undefined,
    });
  };

  return (
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-5 max-h-[85%] overflow-auto animate-slide-up"
        style={{ background: theme.bg }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-white font-semibold text-lg">練習を記録</h3>
          <button onClick={onClose}>
            <X size={24} className="text-white/60" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 日付 */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">日付 *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-white/30"
            />
          </div>

          {/* 時間 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-sm mb-2 block">開始時刻</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-white/30"
              />
            </div>
            <div>
              <label className="text-white/50 text-sm mb-2 block">終了時刻</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-white/30"
              />
            </div>
          </div>

          {/* コンディション */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">コンディション</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setCondition(n)}
                  className="flex-1 py-3 rounded-lg transition-all"
                  style={{
                    background: n <= condition ? theme.gradient : theme.card,
                  }}
                >
                  <span className="text-white text-sm">{n}</span>
                </button>
              ))}
            </div>
          </div>

          {/* スパーリング本数 */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">スパーリング本数</label>
            <input
              type="number"
              value={sparringRounds}
              onChange={(e) => setSparringRounds(e.target.value)}
              placeholder="例: 5"
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30"
            />
          </div>

          {/* 内容 */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">練習内容</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例: テクニック練習、スパーリング"
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30"
            />
          </div>

          {/* メモ */}
          <div>
            <label className="text-white/50 text-sm mb-2 block">気づき・メモ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="うまくいったこと、改善点など..."
              rows={3}
              className="w-full bg-white/5 rounded-xl px-4 py-3 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-white/30 resize-none"
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl text-white font-semibold mt-4"
            style={{ background: theme.gradient }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// 練習日記詳細画面
interface DiaryDetailProps {
  log: TrainingLog;
  onBack: () => void;
  onOpenTechnique?: (technique: Technique) => void;
  onOpenFlow?: (flow: Flow) => void;
}

export function DiaryDetailScreen({ log, onBack, onOpenTechnique, onOpenFlow }: DiaryDetailProps) {
  const { theme, techniques, flows, deleteTrainingLog } = useApp();

  const handleDelete = () => {
    if (confirm('この練習記録を削除しますか？')) {
      deleteTrainingLog(log.id);
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <Header
        title={format(new Date(log.training_date), 'M月d日（E）', { locale: ja })}
        showBack
        onBack={onBack}
      />

      <div className="flex-1 overflow-auto px-5 pb-24 space-y-4">
        {/* 時間・基本情報 */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-sm">時間</span>
              <span className="text-white">
                {log.start_time} - {log.end_time}（{log.duration_minutes}分）
              </span>
            </div>
            {log.sparring_rounds && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">スパーリング</span>
                <span className="text-white">{log.sparring_rounds}本</span>
              </div>
            )}
            {log.condition && (
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">コンディション</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="w-4 h-4 rounded-full"
                      style={{
                        background: n <= log.condition! ? theme.gradient : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 内容 */}
        {log.content && (
          <Card>
            <h3 className="text-white/50 text-sm mb-2">練習内容</h3>
            <p className="text-white">{log.content}</p>
          </Card>
        )}

        {/* メモ */}
        {log.notes && (
          <Card>
            <h3 className="text-white/50 text-sm mb-2">気づき・メモ</h3>
            <p className="text-white leading-relaxed">{log.notes}</p>
          </Card>
        )}

        {/* 削除ボタン */}
        <button
          onClick={handleDelete}
          className="w-full py-3 rounded-xl text-red-400 flex items-center justify-center gap-2"
          style={{ background: 'rgba(239, 68, 68, 0.1)' }}
        >
          <Trash2 size={18} />
          この記録を削除
        </button>
      </div>
    </div>
  );
}
