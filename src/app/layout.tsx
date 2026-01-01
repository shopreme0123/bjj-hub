import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BJJ Hub - 柔術テクニック管理',
  description: '柔術の技とコンビネーションを視覚的に管理し、練習の記録と仲間との共有を通じて上達を加速させるアプリ',
  manifest: '/manifest.json',
  themeColor: '#030712',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
