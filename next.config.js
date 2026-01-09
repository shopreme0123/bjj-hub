/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const securityHeaders = [
  {
    // XSS攻撃対策
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // クリックジャッキング対策
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    // MIMEタイプスニッフィング対策
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // リファラー情報の制御
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // 権限ポリシー
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

const nextConfig = {
  async headers() {
    return [
      {
        // 全てのルートに適用
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
