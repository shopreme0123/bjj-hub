'use client';

import React, { useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';

// AdSense Publisher ID
const ADSENSE_CLIENT = 'ca-pub-3394335051689473';

// 広告スロットID（AdSenseダッシュボードで作成後に設定）
const AD_SLOTS = {
  banner: '1234567890',      // 横長バナー用スロット
  rectangle: '2345678901',   // 長方形用スロット
  inline: '3456789012',      // インフィード用スロット
  native: '4567890123',      // ネイティブ用スロット
};

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdBannerProps {
  variant?: 'banner' | 'rectangle' | 'inline';
  className?: string;
}

export function AdBanner({ variant = 'banner', className = '' }: AdBannerProps) {
  const { theme } = useApp();
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    // 広告を一度だけ読み込む
    if (adRef.current && !isAdLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  const adFormats = {
    banner: { style: { display: 'block', height: '50px' }, format: 'horizontal' },
    rectangle: { style: { display: 'block', width: '300px', height: '250px' }, format: 'rectangle' },
    inline: { style: { display: 'block', height: '100px' }, format: 'fluid' },
  };

  const config = adFormats[variant];

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={{
        ...config.style,
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '8px',
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOTS[variant]}
        data-ad-format={config.format === 'fluid' ? 'fluid' : 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ネイティブ広告風コンポーネント（インフィード広告）
export function NativeAd() {
  const { theme } = useApp();
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (adRef.current && !isAdLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }
  }, []);

  return (
    <div
      className="p-3 rounded-xl overflow-hidden"
      style={{
        background: theme.card,
        border: `1px solid ${theme.cardBorder}`,
        minHeight: '100px',
      }}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOTS.native}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
      />
    </div>
  );
}
