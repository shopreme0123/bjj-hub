# BJJ Hub 🥋

柔術の技とコンビネーションを視覚的に管理し、練習の記録と仲間との共有を通じて上達を加速させるアプリ。

## 特徴

- **帯色テーマ**: 白帯〜黒帯まで、あなたの帯色に合わせてアプリのテーマカラーが変わります
- **技ライブラリ**: カテゴリ別に技を管理、YouTube動画と連携
- **フローエディタ**: ドラッグ&ドロップでコンビネーションを視覚的に作成
- **練習日記**: カレンダーで練習を記録、統計で成長を可視化
- **グループ共有**: ジム仲間とコンビネーションを共有

## 技術スタック

- **Web**: Next.js 14 + TypeScript + Tailwind CSS
- **iOS**: SwiftUI + CoreData
- **Android（準備中）**: Kotlin + Jetpack Compose
- **バックエンド**: Supabase (PostgreSQL + Auth + Storage)
- **ホスティング**: Vercel (Web + 共通ドキュメント)

## セットアップ

### 1. 依存関係のインストール（Web）

```bash
npm --prefix apps/web install
```

### 2. 環境変数の設定

`apps/web/.env.example` を `apps/web/.env.local` にコピーして、Supabaseの認証情報を設定:

```bash
cp apps/web/.env.example apps/web/.env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabaseの設定

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. `docs/db-design.md` のSQLを実行してテーブルを作成
3. 認証設定でEmail/Passwordを有効化

### 4. 開発サーバーの起動（Web）

```bash
npm run web:dev
```

http://localhost:3000 でアプリが起動します。

## ディレクトリ構造

```
bjj-hub/
├── apps/
│   ├── web/                 # Next.js Web版
│   ├── ios/                 # SwiftUI iOS版（開発中）
│   └── android/             # Android版（準備中）
├── shared/                  # 全プラットフォーム共通
│   ├── docs/                # プライバシーポリシー等
│   └── assets/              # 共通アセット
├── docs/                    # 開発者向けドキュメント
│   ├── requirements.md
│   └── db-design.md
├── supabase/                # バックエンドスキーマ
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

## プラットフォーム別情報

### iOS版
- 現在開発中
- App Storeリリース準備中
- 詳細: [apps/ios/README.md](apps/ios/README.md)

### Android版
- iOS版リリース後に開発開始予定
- 詳細: [apps/android/README.md](apps/android/README.md)

### Web版
- ランディングページとして機能
- 詳細: [apps/web/](apps/web/)

## 共通リソース

プライバシーポリシーなど、全プラットフォームで共通のリソースは `shared/` ディレクトリに配置されています。

詳細: [shared/README.md](shared/README.md)

## 作者

Shogo Nakajima
