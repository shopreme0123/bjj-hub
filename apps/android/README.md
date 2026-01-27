# BJJ Hub - Android版（準備中）

このディレクトリは、将来のAndroid版アプリ開発用に予約されています。

## 開発予定

現在はiOS版の開発とリリースを優先しています。Android版の開発は、iOS版のリリース後に開始予定です。

## 技術スタック（予定）

- **言語**: Kotlin
- **UI**: Jetpack Compose
- **アーキテクチャ**: MVVM + Clean Architecture
- **依存性注入**: Hilt
- **ネットワーク**: Retrofit + OkHttp
- **データベース**: Room（ローカル）
- **認証・バックエンド**: Supabase（iOSと共通）

## 参考実装

Android版の実装時は、以下を参考にしてください:

### iOS版の実装
- ディレクトリ: `../ios/BJJHub/`
- データモデル: `../ios/BJJHub/BJJHub/Models.swift`
- API通信: `../ios/BJJHub/BJJHub/SupabaseService.swift`
- ローカルストレージ: `../ios/BJJHub/BJJHub/LocalStorageManager.swift`

### 共通リソース
- プライバシーポリシー: `../../shared/docs/PRIVACY_POLICY.md`
- データベース設計: `../../docs/db-design.md`
- 要件定義: `../../docs/requirements.md`

### Supabase設定
iOS版と同じSupabaseプロジェクトを使用:
- URL: `https://hizjdfztqofmrivexzpy.supabase.co`
- 認証: JWT + Email/Password
- ストレージバケット: `group-icons`

## セットアップ予定

### プロジェクト作成
```bash
# Android Studioで新規プロジェクト作成
# - Empty Compose Activity
# - Package name: com.bjjhub.android
# - Minimum SDK: API 26 (Android 8.0)
```

### 主要な依存関係
```gradle
// build.gradle.kts (app)
dependencies {
    // Jetpack Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")

    // Supabase
    implementation("io.github.jan-tennert.supabase:postgrest-kt")
    implementation("io.github.jan-tennert.supabase:gotrue-kt")
    implementation("io.github.jan-tennert.supabase:storage-kt")

    // Networking
    implementation("com.squareup.retrofit2:retrofit")
    implementation("com.squareup.okhttp3:okhttp")

    // DI
    implementation("com.google.dagger:hilt-android")

    // Room
    implementation("androidx.room:room-runtime")
    implementation("androidx.room:room-ktx")
}
```

### ディレクトリ構造（予定）
```
android/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── java/com/bjjhub/
│   │       │   ├── ui/              # Compose UI
│   │       │   │   ├── auth/        # 認証画面
│   │       │   │   ├── techniques/  # 技一覧・詳細
│   │       │   │   ├── diary/       # 稽古日記
│   │       │   │   ├── flows/       # フローエディタ
│   │       │   │   ├── groups/      # グループ
│   │       │   │   └── settings/    # 設定
│   │       │   ├── data/            # データレイヤー
│   │       │   │   ├── local/       # Room DB
│   │       │   │   ├── remote/      # Supabase API
│   │       │   │   └── repository/  # リポジトリ
│   │       │   ├── domain/          # ビジネスロジック
│   │       │   │   ├── model/       # データモデル
│   │       │   │   └── usecase/     # ユースケース
│   │       │   └── di/              # Hilt モジュール
│   │       ├── res/
│   │       │   ├── values/
│   │       │   │   ├── colors.xml   # 帯色定義
│   │       │   │   └── strings.xml
│   │       │   └── drawable/
│   │       └── AndroidManifest.xml
│   └── build.gradle.kts
├── build.gradle.kts
└── settings.gradle.kts
```

## iOSとの違い

### iOS版の特徴
- SwiftUIによるネイティブUI
- CoreData + JSONファイルの二重ストレージ
- UserDefaultsでの設定管理
- StoreKit 2でのIAP

### Android版で実装予定
- Jetpack ComposeによるネイティブUI
- Room + DataStoreでのストレージ
- SharedPreferencesまたはDataStoreでの設定管理
- Google Play Billingでのサブスクリプション

### 共通部分
- Supabaseバックエンド（データベース、認証、ストレージ）
- ビジネスロジック（技管理、フロー、グループなど）
- プライバシーポリシー
- プレミアムプランの機能（広告非表示、無制限保存）

## デプロイ予定

### Google Play Console
- **アプリ名**: BJJ Hub
- **パッケージ名**: com.bjjhub.android
- **カテゴリ**: スポーツ
- **プライバシーポリシーURL**: `https://your-domain.vercel.app/privacy-policy.html`

### ストア掲載情報
iOS版と同様の情報を使用:
- 説明文
- スクリーンショット（Android用に調整）
- アプリアイコン

## 開発開始のタイミング

以下の条件が満たされたら、Android版の開発を開始します:

1. ✅ iOS版がApp Storeにリリース済み
2. ✅ iOS版のバグが安定
3. ✅ ユーザーフィードバックを反映
4. ✅ Android開発環境のセットアップ完了

---

**現在のステータス**: 準備中（iOS版開発中）
**予定開始時期**: iOS版リリース後
