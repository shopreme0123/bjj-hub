# リポジトリ移行ガイド

このガイドでは、旧構造から新しいモノレポ構造への移行手順を説明します。

## 現状

- **旧構造**: ルートディレクトリに直接Next.jsプロジェクト
- **新構造**: `apps/`, `shared/`, `supabase/`に分離されたモノレポ

## 移行手順

### ステップ1: 現在の変更を確認

```bash
cd /Users/shogonakajima/Desktop/files/bjj-hub
git status
```

以下の状態になっているはず:
- 削除ファイル: 旧Next.js構造（`src/`, `public/`, ルート設定ファイル）
- 新規ファイル: iOS実装、`shared/`, `supabase/`, `apps/web/`

### ステップ2: 旧ファイルの削除を確定

```bash
# 削除されたファイルをステージング
git add -u
```

これで以下がステージングされます:
- 削除: `src/`, `public/`, `capacitor.config.ts`, `next.config.js`, etc.
- 変更: `README.md`, `.gitignore`, `package.json`

### ステップ3: 新しいファイルを追加

```bash
# iOS実装を追加
git add apps/ios/

# 共通リソースを追加
git add shared/

# Supabaseスキーマを追加
git add supabase/

# Web版を追加（存在する場合）
git add apps/web/

# Android準備ディレクトリを追加
git add apps/android/

# ルート設定ファイルを追加
git add vercel.json .gitignore

# READMEの更新を追加
git add README.md MIGRATION_GUIDE.md
```

### ステップ4: コミット

```bash
git commit -m "refactor: モノレポ構造に移行

- iOS版をSwiftUIで実装（apps/ios/）
- 共通リソースをshared/に配置（プライバシーポリシー等）
- Supabaseスキーマをsupabase/に整理
- Android版の準備ディレクトリを作成（apps/android/）
- Web版をapps/web/に移動（将来の実装用）
- .gitignoreを全プラットフォーム対応に更新
- vercel.jsonでモノレポ対応設定を追加"
```

### ステップ5: GitHubにプッシュ

```bash
git push origin main
```

### ステップ6: Vercelプロジェクトの再設定

#### 6-1. Web版プロジェクト（現在のbjj-hub）

**Vercelダッシュボードで設定**:
1. https://vercel.com/dashboard にアクセス
2. プロジェクト "bjj-hub" を選択
3. Settings > General > Root Directory
4. **Root Directory**: `apps/web` に変更
5. Save

または、プロジェクトを削除して再作成:
```bash
# 現在のプロジェクトを削除（Vercel Dashboard）
# 新規インポート: GitHub > shopreme0123/bjj-hub
# Root Directory: apps/web
# Framework Preset: Next.js
```

#### 6-2. ドキュメントプロジェクト（新規作成）

プライバシーポリシー用の独立したプロジェクトを作成:

1. Vercel Dashboard > Add New > Project
2. Import Git Repository: shopreme0123/bjj-hub
3. Project Name: `bjj-hub-docs`
4. Root Directory: `shared/docs`
5. Framework Preset: Other
6. Deploy

**公開URL**: `https://bjj-hub-docs.vercel.app/privacy-policy.html`

このURLをApp Store ConnectとGoogle Play Consoleに設定。

### ステップ7: 環境変数の設定（Web版）

Web版をデプロイする場合、Vercel Dashboardで環境変数を設定:

```
NEXT_PUBLIC_SUPABASE_URL=https://hizjdfztqofmrivexzpy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

## トラブルシューティング

### Vercelデプロイが失敗する

**原因**: Root Directoryが正しく設定されていない

**解決方法**:
1. Vercel Dashboard > Settings > General
2. Root Directory を確認・修正
3. Redeploy

### Web版がビルドエラー

**原因**: `apps/web/package.json`の依存関係が不足

**解決方法**:
```bash
cd apps/web
npm install
npm run build  # ローカルでビルド確認
```

### プライバシーポリシーが404

**原因**: `shared/docs/`プロジェクトがデプロイされていない

**解決方法**:
1. Vercel Dashboardで新規プロジェクト作成
2. Root Directory: `shared/docs`
3. Deploy

## 今後の運用

### コミット例

```bash
# iOS版の変更
git add apps/ios/
git commit -m "feat(ios): グループアイコンアップロード機能を追加"

# Android版の変更（将来）
git add apps/android/
git commit -m "feat(android): 初回リリース実装"

# 共通リソースの変更
git add shared/
git commit -m "docs: プライバシーポリシーを更新"

# Supabaseスキーマの変更
git add supabase/
git commit -m "feat(db): 新しいテーブルを追加"
```

### ブランチ戦略

```
main                    # 本番環境（iOS App Store、Android Play Store）
├── develop             # 開発環境
├── feature/xxx         # 機能開発
└── hotfix/xxx          # 緊急修正
```

### リリースフロー

1. `feature/*`ブランチで開発
2. `develop`にマージしてテスト
3. `main`にマージしてリリース
4. タグ付け: `git tag -a v1.0.0 -m "iOS初回リリース"`

## 完了チェックリスト

- [ ] 旧ファイルの削除をコミット
- [ ] 新しいファイルを追加してコミット
- [ ] GitHubにプッシュ
- [ ] Vercel Web版プロジェクトのRoot Directory設定
- [ ] Vercel Docsプロジェクトを新規作成
- [ ] プライバシーポリシーのURLを確認
- [ ] iOS XcodeプロジェクトがビルドできることToを確認

---

**移行完了後の構造**:

```
GitHub: shopreme0123/bjj-hub
├── apps/
│   ├── web/              → Vercel: bjj-hub
│   ├── ios/              → Xcode + App Store Connect
│   └── android/          → Android Studio（将来）
├── shared/
│   └── docs/             → Vercel: bjj-hub-docs
├── supabase/
├── docs/
└── vercel.json
```
