'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Mail, Lock, User, Eye, EyeOff, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n';
import { validatePassword, validateEmail, validateDisplayName } from '@/lib/security';

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

  // パスワード強度のリアルタイムチェック
  const passwordValidation = useMemo(() => {
    if (!password || mode !== 'signup') return null;
    return validatePassword(password);
  }, [password, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // メールバリデーション
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setError(emailValidation.error || 'メールアドレスが無効です');
        setLoading(false);
        return;
      }

      if (mode === 'signup') {
        // 表示名バリデーション
        const nameValidation = validateDisplayName(displayName);
        if (!nameValidation.isValid) {
          setError(nameValidation.error || '表示名を入力してください');
          setLoading(false);
          return;
        }

        // パスワード強度チェック
        const pwValidation = validatePassword(password);
        if (!pwValidation.isValid) {
          setError(pwValidation.errors[0]);
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

  const { t } = useI18n();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: '#f8fafc' }}>
      {/* ロゴ */}
      <div className="mb-8 text-center">
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden"
          style={{ background: '#000' }}
        >
          <div className="w-20 h-20 relative">
            <Image
              src="/bjj-logo.png"
              alt="BJJ Hub"
              fill
              className="object-contain"
            />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">BJJ Hub</h1>
        <p className="text-slate-500 text-sm mt-1">{t('auth.welcome')}</p>
      </div>

      {/* フォーム */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('settings.display_name')}
                className="w-full bg-white rounded-xl pl-12 pr-4 py-4 text-slate-800 outline-none placeholder:text-slate-400 border border-slate-200 focus:border-blue-500 transition shadow-sm"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email')}
              required
              className="w-full bg-white rounded-xl pl-12 pr-4 py-4 text-slate-800 outline-none placeholder:text-slate-400 border border-slate-200 focus:border-blue-500 transition shadow-sm"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password')}
              required
              minLength={8}
              className="w-full bg-white rounded-xl pl-12 pr-12 py-4 text-slate-800 outline-none placeholder:text-slate-400 border border-slate-200 focus:border-blue-500 transition shadow-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* パスワード強度インジケーター（新規登録時のみ） */}
          {mode === 'signup' && password && passwordValidation && (
            <div className="space-y-2">
              {/* 強度バー */}
              <div className="flex gap-1">
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordValidation.strength === 'weak' ? 'bg-red-400' :
                    passwordValidation.strength === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordValidation.strength === 'medium' ? 'bg-yellow-400' :
                    passwordValidation.strength === 'strong' ? 'bg-green-400' : 'bg-slate-200'
                  }`}
                />
                <div
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    passwordValidation.strength === 'strong' ? 'bg-green-400' : 'bg-slate-200'
                  }`}
                />
              </div>
              {/* 要件チェックリスト */}
              <div className="text-xs space-y-1">
                <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-slate-400'}`}>
                  {password.length >= 8 ? <Check size={12} /> : <X size={12} />}
                  <span>8文字以上</span>
                </div>
                <div className={`flex items-center gap-1 ${/[a-zA-Z]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                  {/[a-zA-Z]/.test(password) ? <Check size={12} /> : <X size={12} />}
                  <span>英字を含む</span>
                </div>
                <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-slate-400'}`}>
                  {/[0-9]/.test(password) ? <Check size={12} /> : <X size={12} />}
                  <span>数字を含む</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {message && (
            <p className="text-green-500 text-sm text-center">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)' }}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : mode === 'signin' ? (
              t('auth.login')
            ) : (
              t('auth.signup')
            )}
          </button>
        </form>

        {/* 切り替え */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            {mode === 'signin' ? t('auth.no_account') : t('auth.have_account')}
          </p>
          <button
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError('');
              setMessage('');
            }}
            className="text-blue-600 text-sm font-medium mt-1"
          >
            {mode === 'signin' ? t('auth.signup') : t('auth.login')}
          </button>
        </div>
      </div>
    </div>
  );
}
