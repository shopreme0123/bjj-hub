'use client';

import React, { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight, Clock, X, GitBranch, BookOpen, Trash2, Pencil, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, getDay, addMonths, subMonths } from 'date-fns';
import { ja, enUS, ptBR } from 'date-fns/locale';
import { useApp } from '@/lib/context';
import { useI18n } from '@/lib/i18n';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { TrainingLog, Technique, Flow } from '@/types';

// 時間を「HH:mm」形式に変換（秒を除去）
const formatTime = (time: string | null | undefined): string => {
  if (!time) return '';
  // "HH:mm:ss" or "HH:mm" format
  return time.substring(0, 5);
};

interface DiaryScreenProps {
  onOpenDetail?: (log: TrainingLog) => void;
}

export function DiaryScreen({ onOpenDetail }: DiaryScreenProps) {
  const { theme, trainingLogs, addTrainingLog, getLogsByDate, techniques } = useApp();
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'stats'>('calendar');
  const [showAddModal, setShowAddModal] = useState(false);

  // 言語に応じたロケール
  const dateLocale = language === 'ja' ? ja : language === 'pt' ? ptBR : enUS;

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

  // その日の練習数
  const getPracticeCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return getLogsByDate(dateStr).length;
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

  const handleAddLog = async (data: Omit<TrainingLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await addTrainingLog(data);
    setShowAddModal(false);
    showToast('練習を記録しました');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      <div
        className="absolute top-0 left-0 right-0 h-48 rounded-b-3xl"
        style={{ background: theme.gradient }}
      />

      <Header
        title={t('diary.title')}
        rightAction={
          <button
            className="p-2 rounded-full relative z-10 bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddModal(true);
            }}
          >
            <Plus size={18} className="text-white" />
          </button>
        }
      />

      {/* タブ */}
      <div className="flex gap-2 px-5 pb-4 relative z-10">
        {[
          { id: 'calendar', label: language === 'ja' ? 'カレンダー' : 'Calendar' },
          { id: 'stats', label: language === 'ja' ? '統計' : 'Stats' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{
              background: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.2)',
              color: activeTab === tab.id ? theme.primary : 'white',
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
                  <ChevronLeft size={20} style={{ color: theme.textMuted }} />
                </button>
                <span className="font-medium" style={{ color: theme.text }}>
                  {format(currentMonth, language === 'ja' ? 'yyyy年M月' : 'MMMM yyyy', { locale: dateLocale })}
                </span>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight size={20} style={{ color: theme.textMuted }} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {(language === 'ja' ? ['日', '月', '火', '水', '木', '金', '土'] : 
                  language === 'pt' ? ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] :
                  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d) => (
                  <div key={d} className="py-2 text-xs" style={{ color: theme.textMuted }}>
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
                      className="aspect-square rounded-lg flex items-center justify-center text-xs relative transition-all"
                      style={{
                        background: practiced ? theme.gradient : 'transparent',
                        boxShadow: practiced ? `0 2px 10px ${theme.primary}40` : (isSelected ? `0 0 0 2px ${theme.primary}` : 'none'),
                      }}
                    >
                      <span
                        style={{ 
                          color: practiced ? 'white' : theme.textSecondary,
                          fontWeight: practiced ? 500 : 400,
                        }}
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                    {format(selectedDate, language === 'ja' ? 'M月d日（E）' : 'EEEE, MMMM d', { locale: dateLocale })}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs"
                    style={{ background: theme.gradient, color: 'white' }}
                  >
                    <Plus size={14} />
                    記録を追加
                  </button>
                </div>
                {(() => {
                  const dateStr = format(selectedDate, 'yyyy-MM-dd');
                  const logs = getLogsByDate(dateStr);
                  
                  if (logs.length > 0) {
                    return (
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <Card key={log.id} onClick={() => onOpenDetail?.(log)}>
                            <div className="flex items-center gap-2 mb-2">
                              <Clock size={14} style={{ color: theme.accent }} />
                              <span className="text-sm" style={{ color: theme.text }}>
                                {formatTime(log.start_time)} - {formatTime(log.end_time)}（{log.duration_minutes}分）
                              </span>
                            </div>
                            <p className="text-sm leading-relaxed mb-2" style={{ color: theme.text }}>
                              {log.notes || log.content || '練習'}
                            </p>
                            {log.sparring_rounds && (
                              <p className="text-xs" style={{ color: theme.textSecondary }}>
                                スパーリング {log.sparring_rounds}本
                              </p>
                            )}
                            <div className="flex items-center justify-end mt-2">
                              <ChevronRight size={16} style={{ color: theme.textMuted }} />
                            </div>
                          </Card>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <Card className="text-center py-6">
                        <p className="text-sm" style={{ color: theme.textSecondary }}>この日の練習記録はありません</p>
                      </Card>
                    );
                  }
                })()}
              </div>
            )}

            {/* 最近の練習一覧 */}
            {trainingLogs.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3" style={{ color: theme.textSecondary }}>最近の練習</h3>
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
                        <p className="text-sm truncate" style={{ color: theme.text }}>{log.notes || log.content}</p>
                        <p className="text-xs" style={{ color: theme.textSecondary }}>{log.duration_minutes}分</p>
                      </div>
                      <ChevronRight size={16} style={{ color: theme.textMuted }} />
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
              <h3 className="text-sm mb-4" style={{ color: theme.textSecondary }}>
                {format(currentMonth, language === 'ja' ? 'yyyy年M月' : 'MMMM yyyy', { locale: dateLocale })}
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                    {monthlyCount}
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>練習回数</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                    {Math.round(monthlyMinutes / 60 * 10) / 10}
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>時間</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: theme.accent }}>
                    {trainingLogs.length}
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>総練習回数</div>
                </div>
              </div>
            </Card>

            {/* よく使う技 */}
            <Card>
              <h3 className="text-sm mb-4" style={{ color: theme.textSecondary }}>登録済みの技 TOP5</h3>
              <div className="space-y-3">
                {techniques.slice(0, 5).map((tech, i) => (
                  <div key={tech.id} className="flex items-center gap-3">
                    <span className="w-6 text-center text-sm" style={{ color: theme.textSecondary }}>{i + 1}</span>
                    <div className="flex-1 rounded-full h-6 overflow-hidden" style={{ background: theme.cardBorder }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${100 - i * 15}%`,
                          background: theme.gradient,
                        }}
                      />
                    </div>
                    <span className="text-sm w-24 truncate" style={{ color: theme.text }}>{tech.name}</span>
                  </div>
                ))}
                {techniques.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: theme.textMuted }}>
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
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(0, duration); // マイナスにならないようにする
  };

  const duration = calculateDuration();
  const isValidTime = duration > 0;

  const handleSubmit = () => {
    if (!isValidTime) return;
    onSave({
      training_date: date,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: duration,
      content: content || undefined,
      notes: notes || undefined,
      condition,
      sparring_rounds: sparringRounds ? parseInt(sparringRounds) : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl px-4 pt-4 pb-6 animate-slide-up overflow-hidden"
        style={{ background: theme.bg, maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold" style={{ color: theme.text }}>練習を記録</h3>
          <button onClick={onClose}>
            <X size={22} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden space-y-2.5 px-2" style={{ maxHeight: 'calc(85vh - 70px)' }}>
          {/* 日付 */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>日付 *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-500 text-sm box-border"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 時間 */}
          <div className="flex gap-3">
            <div className="flex-1 min-w-0">
              <label className="text-xs mb-1.5 block" style={{ color: theme.textSecondary }}>開始</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 outline-none border focus:border-blue-500 text-sm box-border"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs mb-1.5 block" style={{ color: theme.textSecondary }}>終了</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 outline-none border focus:border-blue-500 text-sm box-border"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
            </div>
          </div>
          
          {/* 練習時間表示 */}
          <div 
            className="text-center py-1.5 rounded-lg text-sm"
            style={{ 
              color: isValidTime ? theme.textSecondary : '#ef4444',
              background: isValidTime ? 'transparent' : 'rgba(239, 68, 68, 0.1)',
            }}
          >
            {isValidTime ? (
              <span>練習時間: {Math.floor(duration / 60)}時間{duration % 60}分</span>
            ) : (
              <span>終了時刻は開始時刻より後に</span>
            )}
          </div>

          {/* コンディション + スパー */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>コンディション</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCondition(n)}
                    className="flex-1 py-1.5 rounded-lg transition-all"
                    style={{
                      background: n <= condition ? theme.gradient : theme.card,
                      border: n <= condition ? 'none' : `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    <span style={{ color: n <= condition ? 'white' : theme.text }} className="text-sm">{n}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>スパー本数</label>
              <input
                type="number"
                min="0"
                value={sparringRounds}
                onChange={(e) => setSparringRounds(e.target.value)}
                placeholder="例: 5"
                className="w-full rounded-lg px-3 py-1.5 outline-none border focus:border-blue-500 text-sm"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
            </div>
          </div>

          {/* 内容 */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>練習内容</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例: テクニック練習、スパーリング"
              className="w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-500 text-sm"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* メモ */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>気づき・メモ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="うまくいったこと、改善点など..."
              rows={2}
              className="w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-500 resize-none text-sm"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!isValidTime}
            className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50"
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
  const { theme, techniques, flows, deleteTrainingLog, updateTrainingLog } = useApp();
  const { showToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentLog, setCurrentLog] = useState(log);

  const handleDelete = () => {
    if (confirm('この練習記録を削除しますか？')) {
      deleteTrainingLog(currentLog.id);
      onBack();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: theme.bg }}>
      {/* グラデーション背景 - ヘッダー部分 */}
      <div
        className="absolute top-0 left-0 right-0 h-20 z-0"
        style={{ background: theme.gradient }}
      />

      <Header
        title={format(new Date(currentLog.training_date), 'M月d日（E）', { locale: ja })}
        showBack
        onBack={onBack}
      />

      <div className="flex-1 overflow-auto px-5 pb-24 pt-4 space-y-4 relative z-10">
        {/* 時間・基本情報 */}
        <Card>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: theme.textSecondary }}>時間</span>
              <span style={{ color: theme.text }}>
                {formatTime(currentLog.start_time)} - {formatTime(currentLog.end_time)}（{currentLog.duration_minutes}分）
              </span>
            </div>
            {currentLog.sparring_rounds && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: theme.textSecondary }}>スパーリング</span>
                <span style={{ color: theme.text }}>{currentLog.sparring_rounds}本</span>
              </div>
            )}
            {currentLog.condition && (
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: theme.textSecondary }}>コンディション</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="w-4 h-4 rounded-full"
                      style={{
                        background: n <= currentLog.condition! ? theme.gradient : theme.cardBorder,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 内容 */}
        {currentLog.content && (
          <Card>
            <h3 className="text-sm mb-2" style={{ color: theme.textSecondary }}>練習内容</h3>
            <p style={{ color: theme.text }}>{currentLog.content}</p>
          </Card>
        )}

        {/* メモ */}
        {currentLog.notes && (
          <Card>
            <h3 className="text-sm mb-2" style={{ color: theme.textSecondary }}>気づき・メモ</h3>
            <p className="leading-relaxed" style={{ color: theme.text }}>{currentLog.notes}</p>
          </Card>
        )}

        {/* 編集ボタン */}
        <button
          onClick={() => setShowEditModal(true)}
          className="w-full py-3 rounded-xl flex items-center justify-center gap-2"
          style={{ background: theme.card, border: `1px solid ${theme.cardBorder}`, color: theme.text }}
        >
          <Pencil size={16} />
          この記録を編集
        </button>

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

      {/* 編集モーダル */}
      {showEditModal && (
        <EditLogModal
          theme={theme}
          log={currentLog}
          onClose={() => setShowEditModal(false)}
          onSave={async (updates) => {
            await updateTrainingLog(currentLog.id, updates);
            setCurrentLog({ ...currentLog, ...updates });
            setShowEditModal(false);
            showToast('記録を更新しました');
          }}
        />
      )}
    </div>
  );
}

// 日記編集モーダル
interface EditLogModalProps {
  theme: any;
  log: TrainingLog;
  onClose: () => void;
  onSave: (updates: Partial<TrainingLog>) => Promise<void>;
}

function EditLogModal({ theme, log, onClose, onSave }: EditLogModalProps) {
  const [date, setDate] = useState(log.training_date);
  const [startTime, setStartTime] = useState(log.start_time || '19:00');
  const [endTime, setEndTime] = useState(log.end_time || '21:00');
  const [content, setContent] = useState(log.content || '');
  const [notes, setNotes] = useState(log.notes || '');
  const [sparringRounds, setSparringRounds] = useState(log.sparring_rounds?.toString() || '');
  const [condition, setCondition] = useState(log.condition || 3);
  const [saving, setSaving] = useState(false);

  const calculateDuration = () => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    return Math.max(0, duration);
  };

  const duration = calculateDuration();
  const isValidTime = duration > 0;

  const handleSubmit = async () => {
    if (!isValidTime) return;
    setSaving(true);
    await onSave({
      training_date: date,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: duration,
      content: content || undefined,
      notes: notes || undefined,
      condition,
      sparring_rounds: sparringRounds ? parseInt(sparringRounds) : undefined,
    });
    setSaving(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl px-4 pt-4 pb-6 animate-slide-up"
        style={{ background: theme.bg, maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold" style={{ color: theme.text }}>記録を編集</h3>
          <button onClick={onClose}>
            <X size={22} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="overflow-y-auto space-y-2.5 px-2" style={{ maxHeight: 'calc(85vh - 70px)' }}>
          {/* 日付 */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>日付 *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-500 text-sm box-border"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 時間 */}
          <div className="flex gap-3">
            <div className="flex-1 min-w-0">
              <label className="text-xs mb-1.5 block" style={{ color: theme.textSecondary }}>開始</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 outline-none border focus:border-blue-500 text-sm box-border"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <label className="text-xs mb-1.5 block" style={{ color: theme.textSecondary }}>終了</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg px-3 py-2.5 outline-none border focus:border-blue-500 text-sm box-border"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
            </div>
          </div>
          
          {/* 練習時間表示 */}
          <div 
            className="text-center py-1.5 rounded-lg text-sm"
            style={{ 
              color: isValidTime ? theme.textSecondary : '#ef4444',
              background: isValidTime ? 'transparent' : 'rgba(239, 68, 68, 0.1)',
            }}
          >
            {isValidTime ? (
              <span>練習時間: {Math.floor(duration / 60)}時間{duration % 60}分</span>
            ) : (
              <span>終了時刻は開始時刻より後に</span>
            )}
          </div>

          {/* コンディション + スパー */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>コンディション</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setCondition(n)}
                    className="flex-1 py-1.5 rounded-lg transition-all"
                    style={{
                      background: n <= condition ? theme.gradient : theme.card,
                      border: n <= condition ? 'none' : `1px solid ${theme.cardBorder}`,
                    }}
                  >
                    <span className="text-sm" style={{ color: n <= condition ? 'white' : theme.text }}>{n}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>スパー本数</label>
              <input
                type="number"
                min="0"
                value={sparringRounds}
                onChange={(e) => setSparringRounds(e.target.value)}
                placeholder="例: 5"
                className="w-full rounded-lg px-3 py-1.5 outline-none border focus:border-blue-500 text-sm"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
            </div>
          </div>

          {/* 内容 */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>練習内容</label>
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例: テクニック練習、スパーリング"
              className="w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-500 text-sm"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* メモ */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>気づき・メモ</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="うまくいったこと、改善点など..."
              rows={2}
              className="w-full rounded-lg px-3 py-2 outline-none border focus:border-blue-500 resize-none text-sm"
              style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
            />
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!isValidTime || saving}
            className="w-full py-3 rounded-xl text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: theme.gradient }}
          >
            {saving && <Loader2 size={18} className="animate-spin" />}
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
