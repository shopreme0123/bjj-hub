# Supabase Backend

このディレクトリには、Your BJJのバックエンド（Supabase）に関連するファイルを配置します。

## ディレクトリ構造

```
supabase/
├── migrations/              # データベースマイグレーション
│   └── 001_shared_content.sql
├── functions/               # Edge Functions（将来追加予定）
└── README.md
```

## データベース設定

### プロジェクト情報
- **URL**: `https://hizjdfztqofmrivexzpy.supabase.co`
- **Region**: Tokyo (ap-northeast-1)
- **Database**: PostgreSQL 15

### テーブル一覧

1. **profiles** - ユーザープロフィール
2. **techniques** - 技情報
3. **flows** - 技のフローチャート
4. **training_logs** - 稽古記録
5. **groups** - グループ情報
6. **group_members** - グループメンバー
7. **shared_flows** - 共有フロー
8. **shared_techniques** - 共有技

詳細なスキーマ定義は [../docs/db-design.md](../docs/db-design.md) を参照してください。

## マイグレーション

### 001_shared_content.sql
グループ機能追加のためのマイグレーション:
- `shared_flows` テーブル作成
- `shared_techniques` テーブル作成
- RLSポリシー設定

### 新しいマイグレーションの追加

新しいマイグレーションを追加する場合:

1. `migrations/` ディレクトリに番号付きファイルを作成
   ```bash
   touch supabase/migrations/002_add_feature.sql
   ```

2. SQLを記述
   ```sql
   -- 002_add_feature.sql
   CREATE TABLE new_feature (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. Supabase Dashboard > SQL Editorで実行

## ストレージバケット

### group-icons
- **用途**: グループアイコン画像
- **公開設定**: Public
- **ファイル形式**: JPEG
- **サイズ制限**: 5MB

#### RLSポリシー
```sql
-- 認証済みユーザーがアップロード可能
CREATE POLICY "allow_authenticated_upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'group-icons');

-- 認証済みユーザーが更新可能
CREATE POLICY "allow_authenticated_update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'group-icons');
```

## Row Level Security (RLS)

すべてのテーブルでRLSが有効化されています。

### 主要なポリシー

#### profiles
- ユーザーは自分のプロフィールのみ読み書き可能

#### techniques / flows / training_logs
- ユーザーは自分のデータのみ操作可能

#### groups
- グループメンバーは読み取り可能
- グループ管理者のみ編集可能

#### shared_flows / shared_techniques
- グループメンバーは読み取り可能
- 有効期限切れは自動的に除外

詳細は [../docs/db-design.md](../docs/db-design.md) を参照してください。

## 認証設定

### 有効な認証方法
- Email + Password

### セッション設定
- JWT有効期限: 1時間
- リフレッシュトークン有効期限: 7日

### セキュリティ設定
- メール確認: 有効（本番環境では推奨）
- パスワード要件: 最低6文字

## Edge Functions（将来追加予定）

将来、以下のようなEdge Functionsを追加予定:
- グループ招待コードの検証
- プレミアムサブスクリプションの検証
- 画像リサイズ処理
- 通知送信

## バックアップ

Supabaseは自動的に毎日バックアップを取得します。

手動バックアップが必要な場合:
1. Supabase Dashboard > Database > Backups
2. "Create backup" をクリック

## ローカル開発

ローカルでSupabaseを実行する場合（オプション）:

```bash
# Supabase CLIをインストール
npm install -g supabase

# ローカル環境を起動
supabase start

# マイグレーションを適用
supabase db push
```

## トラブルシューティング

### RLSポリシーエラー
- エラー: "new row violates row-level security policy"
- 解決方法: 該当テーブルのRLSポリシーを確認・修正

### ストレージアップロードエラー
- エラー: 403 Forbidden
- 解決方法: ストレージバケットのRLSポリシーを確認

### 接続エラー
- エラー: "Failed to connect to database"
- 解決方法: 環境変数のSupabase URLとAnon Keyを確認

## 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
