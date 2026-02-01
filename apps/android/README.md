# Your BJJ - Android版

Your BJJのAndroid版ネイティブアプリです。iOS版と同等の機能を提供します。

## 技術スタック

- **言語**: Kotlin
- **UI**: Jetpack Compose
- **アーキテクチャ**: MVVM + Clean Architecture
- **依存性注入**: Hilt
- **ネットワーク**: Supabase Kotlin SDK
- **ローカルデータベース**: Room
- **設定管理**: DataStore
- **認証・バックエンド**: Supabase（iOS版と共通）

## プロジェクト構造

```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/yourbjj/android/
│   │       │   ├── ui/                    # Compose UI
│   │       │   │   ├── diary/             # 日記画面
│   │       │   │   ├── techniques/        # 技一覧・詳細
│   │       │   │   ├── settings/          # 設定画面
│   │       │   │   └── theme/             # テーマシステム
│   │       │   ├── data/                  # データレイヤー
│   │       │   │   ├── local/             # Room DB
│   │       │   │   ├── remote/            # Supabase API
│   │       │   │   └── repository/        # リポジトリ
│   │       │   ├── domain/                # ビジネスロジック
│   │       │   │   ├── model/             # データモデル
│   │       │   │   └── usecase/           # ユースケース
│   │       │   ├── MainActivity.kt        # メインアクティビティ
│   │       │   └── YourBJJApplication.kt  # アプリケーションクラス
│   │       ├── res/
│   │       │   ├── values/                # 日本語リソース
│   │       │   ├── values-en/             # 英語リソース
│   │       │   └── drawable/              # アイコン・画像
│   │       └── AndroidManifest.xml
│   ├── build.gradle.kts
│   └── proguard-rules.pro
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

## 主要機能

### 実装済み

- ✅ プロジェクト構造
- ✅ Gradle設定
- ✅ データモデル（iOS版と互換）
- ✅ Supabaseクライアント
- ✅ BeltThemeシステム（iOS版と同等）
- ✅ Material 3テーマ
- ✅ ナビゲーション構造
- ✅ 多言語対応（日本語・英語）
- ✅ 基本画面のスケルトン
  - 日記画面
  - 技画面
  - 設定画面

### 今後の実装予定

- [ ] 認証画面
- [ ] 日記の作成・編集・削除
- [ ] 技の作成・編集・削除
- [ ] カレンダービュー
- [ ] 動画管理
- [ ] バックアップ・復元
- [ ] プレミアム機能
- [ ] Google Play Billing

## iOS版との違い

### 共通部分
- Supabaseバックエンド（データベース、認証、ストレージ）
- ビジネスロジック
- BeltThemeカラースキーム
- データモデル構造

### プラットフォーム固有
- **iOS**: SwiftUI + CoreData
- **Android**: Jetpack Compose + Room
- **iOS**: UserDefaults
- **Android**: DataStore
- **iOS**: StoreKit 2
- **Android**: Google Play Billing

## 開発環境

### 必要なもの
- Android Studio Iguana (2023.2.1) 以降
- JDK 17
- Android SDK (API 26-34)
- Kotlin 1.9.22

### セットアップ

1. Android Studioでプロジェクトを開く
2. `local.properties` にSupabase認証情報を追加（または`build.gradle.kts`を編集）
3. Gradleの同期
4. エミュレータまたは実機で実行

### Supabase設定

iOS版と同じSupabaseプロジェクトを使用:
- URL: `https://hizjdfztqofmrivexzpy.supabase.co`
- `app/build.gradle.kts`の`SUPABASE_ANON_KEY`を設定

## ビルド

```bash
# デバッグビルド
./gradlew assembleDebug

# リリースビルド
./gradlew assembleRelease

# APKのインストール
./gradlew installDebug
```

## テスト

```bash
# ユニットテスト
./gradlew test

# インストゥルメンテーションテスト
./gradlew connectedAndroidTest
```

## 多言語対応

リソースファイルで多言語対応を実装:
- `res/values/strings.xml` - 日本語（デフォルト）
- `res/values-en/strings.xml` - 英語

## ライセンス

All rights reserved.
