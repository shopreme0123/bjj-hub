/** @type {import('next').NextConfig} */
// App Store (iOS/Android) 用の設定
// 使用方法: npm run build:ios

const nextConfig = {
  output: 'export',  // Static Exportを有効化

  // 画像最適化を無効化（Static Exportに必要）
  images: {
    unoptimized: true,
  },

  // トレイリングスラッシュを追加（Capacitorで推奨）
  trailingSlash: true,

  // ベースパスの設定（必要に応じて）
  // basePath: '',
  // assetPrefix: '',
};

module.exports = nextConfig;
