# Shared Resources

このディレクトリには、全プラットフォーム（Web、iOS、Android）で共通して使用するリソースを配置します。

## ディレクトリ構造

```
shared/
├── docs/                    # 共通ドキュメント
│   ├── privacy-policy.html  # プライバシーポリシー（HTML版）
│   ├── PRIVACY_POLICY.md    # プライバシーポリシー（Markdown版）
│   └── vercel.json          # Vercelデプロイ設定
│
└── assets/                  # 共通アセット（将来追加予定）
    ├── app-icon.png
    └── screenshots/
```

## 使用方法

### プライバシーポリシー

プライバシーポリシーは全プラットフォームで共通です。

**Web公開URL**:
- Vercelでデプロイ: `shared/docs/`をルートとして設定
- アクセスURL: `https://your-domain.vercel.app/privacy-policy.html`

**iOS**:
- App Store Connectに上記URLを記載
- アプリ内でWebViewで表示する場合も同じURLを使用

**Android（将来）**:
- Google Play Consoleに同じURLを記載
- アプリ内でWebViewで表示

### アセット（将来追加予定）

以下のような共通アセットを配置する予定:
- アプリアイコン（各プラットフォーム用に変換）
- スクリーンショット
- プロモーション画像
- ロゴファイル

## 注意事項

- このディレクトリのファイルを変更する場合は、全プラットフォームに影響することに注意してください
- プライバシーポリシーの更新時は、必ず最終更新日を変更してください
- 各プラットフォーム固有のファイルは、各アプリディレクトリ（`apps/web/`, `apps/ios/`, `apps/android/`）に配置してください
