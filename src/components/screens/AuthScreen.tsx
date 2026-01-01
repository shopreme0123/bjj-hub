'use client';

import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export function AuthScreen({ onSuccess }: AuthScreenProps) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!displayName.trim()) {
          setError('表示名を入力してください');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('このメールアドレスは既に登録されています');
          } else {
            setError(error.message);
          }
        } else {
          setMessage('確認メールを送信しました。メールを確認してください。');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('メールアドレスまたはパスワードが正しくありません');
          } else {
            setError(error.message);
          }
        } else {
          onSuccess?.();
        }
      }
    } catch (err) {
      setError('エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#030712' }}>
      {/* ロゴ */}
      <div className="mb-8 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}
        >
          <span className="text-3xl font-bold text-white">BJJ</span>
        </div>
        <h1 className="text-2xl font-bold text-white">BJJ Hub</h1>
        <p className="text-white/40 text-sm mt-1">柔術テクニック管理アプリ</p>
      </div>

      {/* フォーム */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名"
                className="w-full bg-white/5 rounded-xl pl-12 pr-4 py-4 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-blue-500/50 transition"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレス"
              required
              className="w-full bg-white/5 rounded-xl pl-12 pr-4 py-4 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-blue-500/50 transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード"
              required
              minLength={6}
              className="w-full bg-white/5 rounded-xl pl-12 pr-12 py-4 text-white outline-none placeholder:text-white/30 border border-white/10 focus:border-blue-500/50 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {message && (
            <p className="text-green-400 text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : mode === 'signin' ? (
              'ログイン'
            ) : (
              'アカウント作成'
            )}
          </button>
        </form>

        {/* 切り替え */}
        <div className="mt-6 text-center">
          <p className="text-white/40 text-sm">
            {mode === 'signin' ? 'アカウントをお持ちでない方は' : '既にアカウントをお持ちの方は'}
          </p>
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setMessage('');
            }}
            className="text-blue-400 text-sm font-medium mt-1"
          >
            {mode === 'signin' ? '新規登録' : 'ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
}
