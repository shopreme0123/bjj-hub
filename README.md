# BJJ Hub 🥋

柔術の技とコンビネーションを視覚的に管理し、練習の記録と仲間との共有を通じて上達を加速させるアプリ。

## 特徴

- **帯色テーマ**: 白帯〜黒帯まで、あなたの帯色に合わせてアプリのテーマカラーが変わります
- **技ライブラリ**: カテゴリ別に技を管理、YouTube動画と連携
- **フローエディタ**: ドラッグ&ドロップでコンビネーションを視覚的に作成
- **練習日記**: カレンダーで練習を記録、統計で成長を可視化
- **グループ共有**: ジム仲間とコンビネーションを共有

## 技術スタック

- **フロントエンド**: Next.js 14 + TypeScript + Tailwind CSS
- **フローエディタ**: React Flow
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage)
- **ホスティング**: Vercel

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env.local` にコピーして、Supabaseの認証情報を設定:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabaseの設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `docs/db-design.md` のSQLを実行してテーブルを作成
3. 認証設定でEmail/Passwordを有効化

### 4. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリが起動します。

## ディレクトリ構造

```
bjj-hub/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # グローバルスタイル
│   │   ├── layout.tsx       # ルートレイアウト
│   │   └── page.tsx         # メインページ
│   ├── components/
│   │   ├── screens/         # 画面コンポーネント
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── TechniquesScreen.tsx
│   │   │   ├── FlowsScreen.tsx
│   │   │   ├── DiaryScreen.tsx
│   │   │   ├── GroupsScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   └── ui/              # UIコンポーネント
│   │       ├── Card.tsx
│   │       ├── Header.tsx
│   │       └── BottomNav.tsx
│   ├── lib/
│   │   ├── context.tsx      # React Context (テーマ管理)
│   │   └── supabase.ts      # Supabaseクライアント
│   └── types/
│       └── index.ts         # TypeScript型定義
├── public/
│   └── manifest.json        # PWA マニフェスト
├── docs/
│   ├── requirements.md      # 要件定義書
│   └── db-design.md         # DB設計書
└── README.md
```

## 開発フェーズ

### Phase 1: MVP ✅
- [x] プロジェクト構造
- [x] 帯色テーマシステム
- [x] 技ライブラリ（カテゴリ・一覧・詳細）
- [x] フローエディタ（ドラッグ&ドロップ）
- [x] 練習日記（カレンダー・統計）
- [x] グループ機能（UI）

### Phase 2: バックエンド連携
- [ ] Supabase認証
- [ ] データの永続化
- [ ] リアルタイム同期

### Phase 3: 機能拡張
- [ ] YouTube動画埋め込み
- [ ] フロー共有機能
- [ ] オフライン対応

## ライセンス

MIT

## 作者

Shogo
