'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useApp } from '@/lib/context';

interface AdBannerProps {
  variant?: 'banner' | 'rectangle' | 'inline';
  className?: string;
}

// 広告のプレースホルダー（実際の広告SDKに置き換え可能）
export function AdBanner({ variant = 'banner', className = '' }: AdBannerProps) {
  const { theme } = useApp();
  const [isVisible, setIsVisible] = useState(true);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    // 広告の読み込みをシミュレート
    const timer = setTimeout(() => setAdLoaded(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const dimensions = {
    banner: { height: '50px', width: '100%' },
    rectangle: { height: '250px', width: '300px' },
    inline: { height: '100px', width: '100%' },
  };

  const style = dimensions[variant];

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        ...style,
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '8px',
      }}
    >
      {/* 広告コンテンツ */}
      <div className="absolute inset-0 flex items-center justify-center">
        {adLoaded ? (
          <div className="text-center px-4">
            {/* 実際の広告はここに表示される */}
            {/* Google AdSense や他の広告ネットワークのコードをここに配置 */}
            <div
              className="flex items-center justify-center gap-2"
              style={{ color: theme.textMuted }}
            >
              <span className="text-xs px-2 py-0.5 rounded" style={{ background: theme.bg }}>
                AD
              </span>
              <span className="text-xs">広告スペース</span>
            </div>
            {variant !== 'banner' && (
              <p className="text-xs mt-2" style={{ color: theme.textMuted }}>
                プレミアムで広告を非表示に
              </p>
            )}
          </div>
        ) : (
          <div className="animate-pulse flex items-center justify-center">
            <div
              className="h-4 w-24 rounded"
              style={{ background: theme.bg }}
            />
          </div>
        )}
      </div>

      {/* 閉じるボタン（インライン広告のみ） */}
      {variant === 'inline' && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-1 p-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.3)' }}
        >
          <X size={12} className="text-white" />
        </button>
      )}
    </div>
  );
}

// ネイティブ広告風コンポーネント（リスト内に挿入）
export function NativeAd() {
  const { theme } = useApp();

  return (
    <div
      className="p-3 rounded-xl"
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: `${theme.primary}15` }}
        >
          <span className="text-lg">📢</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: theme.bg, color: theme.textMuted }}
            >
              広告
            </span>
          </div>
          <p className="text-sm font-medium mt-0.5" style={{ color: theme.text }}>
            BJJ道衣・ラッシュガード
          </p>
          <p className="text-xs" style={{ color: theme.textMuted }}>
            高品質の練習用品をチェック
          </p>
        </div>
        <button
          className="px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: theme.primary, color: 'white' }}
        >
          詳細
        </button>
      </div>
    </div>
  );
}
