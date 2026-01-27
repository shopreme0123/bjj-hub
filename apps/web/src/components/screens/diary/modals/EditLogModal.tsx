'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { TrainingLog } from '@/types';

interface EditLogModalProps {
  theme: any;
  log: TrainingLog;
  onClose: () => void;
  onSave: (updates: Partial<TrainingLog>) => Promise<void>;
}

export function EditLogModal({ theme, log, onClose, onSave }: EditLogModalProps) {
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
        className="w-full rounded-t-3xl px-4 pt-4 pb-8 animate-slide-up"
        style={{ background: theme.bg, maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold" style={{ color: theme.text }}>記録を編集</h3>
          <button onClick={onClose}>
            <X size={22} style={{ color: theme.textSecondary }} />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden space-y-2.5 px-1" style={{ maxHeight: 'calc(80vh - 80px)' }}>
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
          <div className="grid grid-cols-2 gap-2">
            <div className="min-w-0">
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>開始</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg px-2 py-2 outline-none border focus:border-blue-500 text-sm box-border"
                style={{ background: theme.card, color: theme.text, borderColor: theme.cardBorder }}
              />
            </div>
            <div className="min-w-0">
              <label className="text-xs mb-1 block" style={{ color: theme.textSecondary }}>終了</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg px-2 py-2 outline-none border focus:border-blue-500 text-sm box-border"
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
