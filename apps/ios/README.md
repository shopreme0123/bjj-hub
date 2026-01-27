# iOS (SwiftUI) 移行メモ

ここにSwiftUI版のXcodeプロジェクトを追加します。

## 進め方（例）

1. Xcodeで新規のiOS App（SwiftUI）を作成
2. この `apps/ios` 配下に保存
3. Supabase連携をSwiftで実装

## Supabase設定

`apps/ios/BJJHub/BJJHub/SupabaseService.swift` の `SupabaseConfig` を編集して、
`SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_USER_ID` を入力してください。

## 予定

- 画面構成の移植
- 認証/データ同期の実装
- Push通知などのネイティブ機能
