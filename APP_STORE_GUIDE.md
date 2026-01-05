# App Store 公開ガイド

## 前提条件

### 必須項目
- ✅ Apple Developer アカウント（年間 $99 USD）
- ✅ macOS（Xcode が必要）
- ✅ Node.js & npm（インストール済み）

### 必要な素材
- アプリアイコン（1024x1024px）
- スクリーンショット（iPhone各サイズ）
- プライバシーポリシー URL
- アプリの説明文

---

## 方法1: Capacitor を使用（推奨）

### ステップ1: Capacitor のインストール

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios

# Capacitorの初期化
npx cap init
```

**設定内容**:
- App name: `BJJ Hub`
- App ID: `com.yourname.bjjhub`（逆ドメイン形式）
- Web directory: `out`（Next.js のエクスポート先）

### ステップ2: Next.js を Static Export に設定

`next.config.js` を編集:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 追加
  images: {
    unoptimized: true,  // 追加（Static Exportに必要）
  },
}

module.exports = nextConfig
```

### ステップ3: ビルドとiOSプロジェクト作成

```bash
# Next.jsアプリをビルド
npm run build

# iOSプロジェクトを追加
npx cap add ios

# ビルドをiOSプロジェクトにコピー
npx cap copy ios

# Xcodeで開く
npx cap open ios
```

### ステップ4: Xcode での設定

1. **Bundle Identifier を設定**
   - Project Navigator → App → Signing & Capabilities
   - Bundle Identifier: `com.yourname.bjjhub`

2. **Team を選択**
   - Team: あなたの Apple Developer アカウント

3. **アプリアイコンを追加**
   - Assets.xcassets → AppIcon
   - 各サイズのアイコンを追加

4. **Info.plist を編集**
   - Display Name: `BJJ Hub`
   - Version: `1.0.0`
   - Build: `1`

### ステップ5: 必要な権限の追加（必要に応じて）

`ios/App/App/Info.plist` に追加:

```xml
<key>NSCameraUsageDescription</key>
<string>動画の撮影に使用します</string>

<key>NSPhotoLibraryUsageDescription</key>
<string>写真の選択に使用します</string>
```

### ステップ6: ビルドとテスト

```bash
# シミュレーターで起動
npx cap run ios

# または Xcode から実行ボタン（▶️）
```

---

## 方法2: React Native（フルリライト）

### 特徴
- ✅ 完全なネイティブアプリ
- ❌ 全コードを React Native で書き直す必要あり
- ❌ 時間がかかる（数週間〜数ヶ月）

### 手順概要
1. React Native プロジェクト作成
2. UI を React Native コンポーネントで再実装
3. ナビゲーションを React Navigation で実装
4. Supabase SDK を React Native 用に設定

**推奨度**: ⭐⭐☆☆☆（時間がある場合のみ）

---

## App Store Connect の設定

### 1. アプリを登録

1. [App Store Connect](https://appstoreconnect.apple.com) にログイン
2. 「マイApp」→「＋」→「新規App」
3. 情報を入力:
   - プラットフォーム: iOS
   - 名前: BJJ Hub
   - 主言語: 日本語
   - Bundle ID: `com.yourname.bjjhub`
   - SKU: `bjj-hub-001`（任意のユニークID）

### 2. アプリ情報を入力

**必須項目**:
- App名（30文字以内）
- サブタイトル（30文字以内）
- 説明文（4000文字以内）
- キーワード（100文字以内、カンマ区切り）
- カテゴリ: スポーツ、ヘルスケア/フィットネス
- 年齢制限: 4+

**スクリーンショット**:
- iPhone 6.7" (iPhone 15 Pro Max など)
- iPhone 6.5" (iPhone 14 Pro Max など)
- 各サイズ 3-10枚

### 3. プライバシーポリシー

**必須**: プライバシーポリシーのURL

簡易版を `public/privacy-policy.html` に作成:

```html
<!DOCTYPE html>
<html>
<head>
  <title>BJJ Hub - プライバシーポリシー</title>
  <meta charset="utf-8">
</head>
<body>
  <h1>プライバシーポリシー</h1>

  <h2>収集する情報</h2>
  <p>当アプリは以下の情報を収集します：</p>
  <ul>
    <li>メールアドレス（ログイン用）</li>
    <li>技術データ（アプリ使用状況）</li>
  </ul>

  <h2>情報の使用目的</h2>
  <p>収集した情報は以下の目的で使用します：</p>
  <ul>
    <li>アカウント管理</li>
    <li>サービスの提供・改善</li>
  </ul>

  <h2>情報の共有</h2>
  <p>お客様の個人情報を第三者に販売または共有することはありません。</p>

  <h2>お問い合わせ</h2>
  <p>Email: your-email@example.com</p>
</body>
</html>
```

デプロイ後のURL: `https://your-domain.com/privacy-policy.html`

### 4. 審査用情報

**テストアカウント**（必要な場合）:
```
メールアドレス: test@example.com
パスワード: TestPassword123!
```

**審査メモ**:
```
このアプリはブラジリアン柔術の技術を管理するためのアプリです。

テスト方法:
1. テストアカウントでログイン
2. 「技」タブから技を追加
3. 「フロー」タブでフローを作成
4. 共有機能をテスト
```

---

## ビルドとアップロード

### 1. Archive を作成

Xcode で:
1. メニュー → Product → Archive
2. 数分待つ
3. Organizer が開く

### 2. App Store Connect にアップロード

Organizer で:
1. 作成した Archive を選択
2. 「Distribute App」をクリック
3. 「App Store Connect」を選択
4. 「Upload」をクリック
5. 証明書を選択（自動管理推奨）
6. 「Upload」で完了

### 3. TestFlight でテスト

1. App Store Connect でビルドが処理されるまで待つ（10-30分）
2. 「TestFlight」タブ → ビルドを選択
3. 「テスター」を招待してテスト

### 4. 審査に提出

1. App Store Connect → バージョン情報
2. ビルドを選択
3. すべての情報を入力
4. 「審査に提出」をクリック

**審査期間**: 通常 1-3日

---

## よくある審査リジェクト理由と対策

### 1. ログイン必須
**問題**: アプリがログインなしで使えない
**対策**:
- ゲストモード（ログインなしでも基本機能が使える）を追加
- または、デモアカウントを提供

### 2. 機能が少ない
**問題**: Webサイトと変わらない
**対策**:
- プッシュ通知を追加
- オフライン機能を強化
- ネイティブ機能（カメラ、位置情報など）を活用

### 3. プライバシーポリシーがない
**対策**: 必ず設置する（上記参照）

### 4. スクリーンショットが不適切
**対策**:
- 実際のアプリ画面を使用
- 日本語設定で撮影
- 高解像度

---

## パフォーマンス最適化（Capacitor使用時）

### capacitor.config.ts の設定

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.bjjhub',
  appName: 'BJJ Hub',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: false,
    },
  },
};

export default config;
```

---

## チェックリスト

### 開発前
- [ ] Apple Developer アカウント作成
- [ ] アプリアイコン準備（1024x1024px）
- [ ] プライバシーポリシー作成

### 開発中
- [ ] Capacitor インストール
- [ ] Next.js を Static Export に設定
- [ ] iOS プロジェクト作成
- [ ] Xcode で動作確認

### 公開前
- [ ] スクリーンショット撮影
- [ ] App Store Connect でアプリ登録
- [ ] TestFlight でテスト
- [ ] プライバシーポリシー公開

### 公開
- [ ] Archive 作成
- [ ] App Store Connect にアップロード
- [ ] 審査に提出

---

## 参考リンク

- [Capacitor 公式ドキュメント](https://capacitorjs.com/docs)
- [App Store 審査ガイドライン](https://developer.apple.com/app-store/review/guidelines/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

## サポートが必要な場合

1. Apple Developer Forums
2. Capacitor Community Discord
3. Stack Overflow
