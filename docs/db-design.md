# BJJ Hub データベース設計書

## 1. ER図（概要）

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  categories │       │   groups    │
└──────┬──────┘       └──────┬──────┘       └──────┬──────┘
       │                     │                     │
       │ 1:N                 │ 1:N                 │ 1:N
       ▼                     ▼                     ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ techniques  │◄──────│             │       │group_members│
└──────┬──────┘       │             │       └─────────────┘
       │              │             │              │
       │              │   flows     │◄─────────────┘
       │              │             │        shared_flows
       │              └──────┬──────┘
       │                     │
       │              ┌──────┴──────┐
       │              │             │
       │              ▼             ▼
       │       ┌───────────┐ ┌───────────┐
       └──────►│flow_nodes │ │flow_edges │
               └───────────┘ └───────────┘

┌─────────────┐
│training_logs│──────► training_log_techniques (中間)
└─────────────┘──────► training_log_flows (中間)
```

---

## 2. テーブル定義

### 2.1 users（ユーザー）

Supabase Authと連携。追加のプロフィール情報を保存。

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(50) NOT NULL,
  avatar_url TEXT,
  belt_color VARCHAR(20) DEFAULT 'white',  -- white/blue/purple/brown/black
  belt_stripes INTEGER DEFAULT 0 CHECK (belt_stripes >= 0 AND belt_stripes <= 4),
  bjj_start_date DATE,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_users_display_name ON users(display_name);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | Supabase Auth のユーザーID |
| display_name | VARCHAR(50) | 表示名 |
| avatar_url | TEXT | プロフィール画像URL |
| belt_color | VARCHAR(20) | 帯色 |
| belt_stripes | INTEGER | ストライプ数（0-4） |
| bjj_start_date | DATE | 柔術開始日 |
| bio | TEXT | 自己紹介 |

---

### 2.2 categories（カテゴリ/ポジション）

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,  -- NULLならプリセット
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_preset BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_parent_id ON categories(parent_id);

-- ユニーク制約（同一ユーザー内で同名カテゴリ不可）
CREATE UNIQUE INDEX idx_categories_unique_name 
  ON categories(COALESCE(user_id, '00000000-0000-0000-0000-000000000000'), name);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | カテゴリID |
| user_id | UUID | 作成者（NULLならシステムプリセット） |
| name | VARCHAR(100) | カテゴリ名 |
| parent_id | UUID | 親カテゴリ（階層構造用） |
| sort_order | INTEGER | 表示順 |
| is_preset | BOOLEAN | プリセットフラグ |

**プリセットデータ例:**
```sql
INSERT INTO categories (name, parent_id, is_preset, sort_order) VALUES
-- 大分類
('ガード（ボトム）', NULL, true, 1),
('トップポジション', NULL, true, 2),
('スタンド', NULL, true, 3),
('タートル', NULL, true, 4),
('レッグロック', NULL, true, 5);

-- 小分類（ガード）
INSERT INTO categories (name, parent_id, is_preset, sort_order)
SELECT name, (SELECT id FROM categories WHERE name = 'ガード（ボトム）'), true, sort_order
FROM (VALUES 
  ('クローズドガード', 1),
  ('ハーフガード', 2),
  ('オープンガード', 3),
  ('デラヒーバ', 4),
  ('リバースデラヒーバ', 5),
  ('スパイダーガード', 6),
  ('ラッソーガード', 7),
  ('Xガード', 8),
  ('50/50', 9),
  ('バタフライガード', 10),
  ('シングルレッグXガード', 11)
) AS t(name, sort_order);
```

---

### 2.3 techniques（技）

```sql
CREATE TABLE techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),  -- 英語名（任意）
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  technique_type VARCHAR(50) NOT NULL,  -- sweep/pass/submission/escape/takedown/other
  description TEXT,
  video_url TEXT,  -- YouTube URL
  video_type VARCHAR(20) DEFAULT 'youtube',  -- youtube/uploaded（将来拡張）
  tags TEXT[] DEFAULT '{}',  -- PostgreSQL配列
  difficulty VARCHAR(20),  -- beginner/intermediate/advanced
  mastery_level VARCHAR(20) DEFAULT 'learning',  -- learning/learned/favorite
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_techniques_user_id ON techniques(user_id);
CREATE INDEX idx_techniques_category_id ON techniques(category_id);
CREATE INDEX idx_techniques_technique_type ON techniques(technique_type);
CREATE INDEX idx_techniques_tags ON techniques USING GIN(tags);

-- 全文検索用（日本語対応は別途設定必要）
CREATE INDEX idx_techniques_name ON techniques(name);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 技ID |
| user_id | UUID | 作成者 |
| name | VARCHAR(200) | 技名 |
| name_en | VARCHAR(200) | 英語名（任意） |
| category_id | UUID | カテゴリ |
| technique_type | VARCHAR(50) | 種類（スイープ/パス/サブミッション等） |
| description | TEXT | 説明・メモ |
| video_url | TEXT | 動画URL |
| video_type | VARCHAR(20) | 動画タイプ |
| tags | TEXT[] | タグ配列 |
| difficulty | VARCHAR(20) | 難易度 |
| mastery_level | VARCHAR(20) | 習得状況 |

---

### 2.4 flows（コンビネーション/フロー）

```sql
CREATE TABLE flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_flows_user_id ON flows(user_id);
CREATE INDEX idx_flows_tags ON flows USING GIN(tags);
CREATE INDEX idx_flows_is_favorite ON flows(user_id, is_favorite);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | フローID |
| user_id | UUID | 作成者 |
| name | VARCHAR(200) | フロー名 |
| description | TEXT | 説明 |
| tags | TEXT[] | タグ配列 |
| is_favorite | BOOLEAN | お気に入りフラグ |

---

### 2.5 flow_nodes（フローのノード）

フローエディタ上の各ノード（技カード）の位置と情報

```sql
CREATE TABLE flow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  technique_id UUID REFERENCES techniques(id) ON DELETE SET NULL,
  
  -- ノード情報（技がない場合のラベル用）
  label VARCHAR(200),
  node_type VARCHAR(50) DEFAULT 'technique',  -- technique/condition/note
  
  -- React Flow用の位置情報
  position_x FLOAT NOT NULL DEFAULT 0,
  position_y FLOAT NOT NULL DEFAULT 0,
  
  -- スタイル情報（任意）
  style JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_flow_nodes_flow_id ON flow_nodes(flow_id);
CREATE INDEX idx_flow_nodes_technique_id ON flow_nodes(technique_id);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | ノードID |
| flow_id | UUID | 所属フロー |
| technique_id | UUID | 紐づく技（任意） |
| label | VARCHAR(200) | ラベル（技がない場合） |
| node_type | VARCHAR(50) | ノードタイプ |
| position_x | FLOAT | X座標 |
| position_y | FLOAT | Y座標 |
| style | JSONB | スタイル情報 |

---

### 2.6 flow_edges（フローのエッジ/接続）

ノード間の矢印（接続）情報

```sql
CREATE TABLE flow_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES flow_nodes(id) ON DELETE CASCADE,
  
  -- 分岐条件ラベル
  label VARCHAR(200),  -- 「相手が姿勢を起こしたら」等
  
  -- エッジタイプ（色分け用）
  edge_type VARCHAR(50) DEFAULT 'default',  -- default/success/counter
  
  -- スタイル情報
  style JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_flow_edges_flow_id ON flow_edges(flow_id);
CREATE INDEX idx_flow_edges_source ON flow_edges(source_node_id);
CREATE INDEX idx_flow_edges_target ON flow_edges(target_node_id);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | エッジID |
| flow_id | UUID | 所属フロー |
| source_node_id | UUID | 接続元ノード |
| target_node_id | UUID | 接続先ノード |
| label | VARCHAR(200) | 条件ラベル |
| edge_type | VARCHAR(50) | エッジタイプ（色分け用） |
| style | JSONB | スタイル情報 |

---

### 2.7 groups（グループ/ジム）

```sql
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_url TEXT,
  invite_code VARCHAR(20) UNIQUE,  -- 招待コード
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_groups_created_by ON groups(created_by);
CREATE INDEX idx_groups_invite_code ON groups(invite_code);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | グループID |
| name | VARCHAR(100) | グループ名 |
| description | TEXT | 説明 |
| icon_url | TEXT | アイコンURL |
| invite_code | VARCHAR(20) | 招待コード |
| created_by | UUID | 作成者 |

---

### 2.8 group_members（グループメンバー）

```sql
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',  -- admin/member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(group_id, user_id)
);

-- インデックス
CREATE INDEX idx_group_members_group_id ON group_members(group_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | ID |
| group_id | UUID | グループ |
| user_id | UUID | ユーザー |
| role | VARCHAR(20) | 役割（admin/member） |
| joined_at | TIMESTAMPTZ | 参加日時 |

---

### 2.9 shared_flows（共有フロー）

```sql
CREATE TABLE shared_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(flow_id, group_id)
);

-- インデックス
CREATE INDEX idx_shared_flows_flow_id ON shared_flows(flow_id);
CREATE INDEX idx_shared_flows_group_id ON shared_flows(group_id);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | ID |
| flow_id | UUID | 共有するフロー |
| group_id | UUID | 共有先グループ |
| shared_by | UUID | 共有したユーザー |
| shared_at | TIMESTAMPTZ | 共有日時 |

---

### 2.10 training_logs（練習日記）

```sql
CREATE TABLE training_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  training_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,  -- 練習時間（分）
  content TEXT,  -- 練習内容
  notes TEXT,  -- 気づき・反省
  condition INTEGER CHECK (condition >= 1 AND condition <= 5),  -- 体調（1-5）
  sparring_rounds INTEGER,  -- スパーリング本数
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_training_logs_user_id ON training_logs(user_id);
CREATE INDEX idx_training_logs_training_date ON training_logs(training_date);
CREATE INDEX idx_training_logs_user_date ON training_logs(user_id, training_date);
```

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | ID |
| user_id | UUID | ユーザー |
| training_date | DATE | 練習日 |
| start_time | TIME | 開始時刻 |
| end_time | TIME | 終了時刻 |
| duration_minutes | INTEGER | 練習時間（分） |
| content | TEXT | 練習内容 |
| notes | TEXT | 気づき・反省 |
| condition | INTEGER | 体調（1-5） |
| sparring_rounds | INTEGER | スパー本数 |

---

### 2.11 training_log_techniques（練習日記×技）

```sql
CREATE TABLE training_log_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id UUID NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  technique_id UUID NOT NULL REFERENCES techniques(id) ON DELETE CASCADE,
  
  UNIQUE(training_log_id, technique_id)
);

-- インデックス
CREATE INDEX idx_tlt_training_log_id ON training_log_techniques(training_log_id);
CREATE INDEX idx_tlt_technique_id ON training_log_techniques(technique_id);
```

---

### 2.12 training_log_flows（練習日記×フロー）

```sql
CREATE TABLE training_log_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_log_id UUID NOT NULL REFERENCES training_logs(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  
  UNIQUE(training_log_id, flow_id)
);

-- インデックス
CREATE INDEX idx_tlf_training_log_id ON training_log_flows(training_log_id);
CREATE INDEX idx_tlf_flow_id ON training_log_flows(flow_id);
```

---

## 3. Row Level Security (RLS) ポリシー

Supabaseでデータアクセス制御を行うためのRLSポリシー。

```sql
-- 全テーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_log_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_log_flows ENABLE ROW LEVEL SECURITY;

-- users: 自分のプロフィールのみ編集可、他ユーザーは閲覧のみ
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- categories: プリセットは全員閲覧可、カスタムは自分のみ
CREATE POLICY "Anyone can view preset categories" ON categories 
  FOR SELECT USING (is_preset = true OR user_id = auth.uid());
CREATE POLICY "Users can manage own categories" ON categories 
  FOR ALL USING (user_id = auth.uid());

-- techniques: 自分の技のみアクセス可
CREATE POLICY "Users can manage own techniques" ON techniques 
  FOR ALL USING (user_id = auth.uid());

-- flows: 自分のフロー + 共有されたフローを閲覧可
CREATE POLICY "Users can manage own flows" ON flows 
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view shared flows" ON flows 
  FOR SELECT USING (
    id IN (
      SELECT flow_id FROM shared_flows sf
      JOIN group_members gm ON sf.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- flow_nodes, flow_edges: フローの所有者のみ
CREATE POLICY "Users can manage own flow nodes" ON flow_nodes 
  FOR ALL USING (
    flow_id IN (SELECT id FROM flows WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can view shared flow nodes" ON flow_nodes 
  FOR SELECT USING (
    flow_id IN (
      SELECT flow_id FROM shared_flows sf
      JOIN group_members gm ON sf.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own flow edges" ON flow_edges 
  FOR ALL USING (
    flow_id IN (SELECT id FROM flows WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can view shared flow edges" ON flow_edges 
  FOR SELECT USING (
    flow_id IN (
      SELECT flow_id FROM shared_flows sf
      JOIN group_members gm ON sf.group_id = gm.group_id
      WHERE gm.user_id = auth.uid()
    )
  );

-- groups: メンバーは閲覧可、管理者は編集可
CREATE POLICY "Group members can view group" ON groups 
  FOR SELECT USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Group admins can update group" ON groups 
  FOR UPDATE USING (
    id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Users can create groups" ON groups 
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- group_members: メンバーは閲覧可、管理者は追加・削除可
CREATE POLICY "Group members can view members" ON group_members 
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );
CREATE POLICY "Group admins can manage members" ON group_members 
  FOR ALL USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid() AND role = 'admin')
  );

-- shared_flows: 自分のフローを共有可、メンバーは閲覧可
CREATE POLICY "Users can share own flows" ON shared_flows 
  FOR INSERT WITH CHECK (
    shared_by = auth.uid() AND
    flow_id IN (SELECT id FROM flows WHERE user_id = auth.uid())
  );
CREATE POLICY "Group members can view shared flows" ON shared_flows 
  FOR SELECT USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
  );

-- training_logs: 自分の日記のみ
CREATE POLICY "Users can manage own training logs" ON training_logs 
  FOR ALL USING (user_id = auth.uid());

-- training_log_techniques, training_log_flows: 日記の所有者のみ
CREATE POLICY "Users can manage own log techniques" ON training_log_techniques 
  FOR ALL USING (
    training_log_id IN (SELECT id FROM training_logs WHERE user_id = auth.uid())
  );
CREATE POLICY "Users can manage own log flows" ON training_log_flows 
  FOR ALL USING (
    training_log_id IN (SELECT id FROM training_logs WHERE user_id = auth.uid())
  );
```

---

## 4. 便利なビュー/関数

### 4.1 練習統計ビュー

```sql
CREATE VIEW training_stats AS
SELECT 
  user_id,
  COUNT(*) as total_sessions,
  SUM(duration_minutes) as total_minutes,
  AVG(duration_minutes) as avg_duration,
  COUNT(DISTINCT DATE_TRUNC('week', training_date)) as weeks_trained,
  MAX(training_date) as last_training_date
FROM training_logs
GROUP BY user_id;
```

### 4.2 よく使う技ランキング

```sql
CREATE VIEW technique_usage_ranking AS
SELECT 
  t.user_id,
  t.id as technique_id,
  t.name as technique_name,
  COUNT(tlt.id) as usage_count
FROM techniques t
LEFT JOIN training_log_techniques tlt ON t.id = tlt.technique_id
GROUP BY t.user_id, t.id, t.name
ORDER BY usage_count DESC;
```

### 4.3 招待コード生成関数

```sql
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

---

## 5. データ例

### 技の登録例

```sql
INSERT INTO techniques (user_id, name, name_en, category_id, technique_type, description, tags, mastery_level)
VALUES (
  'user-uuid-here',
  '三角絞め',
  'Triangle Choke',
  (SELECT id FROM categories WHERE name = 'クローズドガード'),
  'submission',
  '足を相手の首と腕に絡めて絞める。角度が重要。',
  ARRAY['#絞め技', '#クローズドガード系', '#得意技'],
  'favorite'
);
```

### フローの登録例

```sql
-- フロー作成
INSERT INTO flows (id, user_id, name, description, tags)
VALUES (
  'flow-uuid-here',
  'user-uuid-here',
  '三角絞めからの派生',
  'クローズドガードからの三角絞め、相手の反応による分岐',
  ARRAY['#三角絞め系', '#クローズドガード']
);

-- ノード追加
INSERT INTO flow_nodes (flow_id, technique_id, position_x, position_y) VALUES
('flow-uuid-here', 'tech-closed-guard-uuid', 250, 0),
('flow-uuid-here', 'tech-triangle-setup-uuid', 250, 100),
('flow-uuid-here', 'tech-triangle-uuid', 100, 250),
('flow-uuid-here', 'tech-omoplata-uuid', 400, 250);

-- エッジ追加（分岐）
INSERT INTO flow_edges (flow_id, source_node_id, target_node_id, label, edge_type) VALUES
('flow-uuid-here', 'node-1-uuid', 'node-2-uuid', NULL, 'default'),
('flow-uuid-here', 'node-2-uuid', 'node-3-uuid', '相手が姿勢を起こす', 'success'),
('flow-uuid-here', 'node-2-uuid', 'node-4-uuid', '相手が潜ってくる', 'counter');
```

---

## 6. マイグレーション順序

1. `users`
2. `categories`（プリセットデータ含む）
3. `techniques`
4. `flows`
5. `flow_nodes`
6. `flow_edges`
7. `groups`
8. `group_members`
9. `shared_flows`
10. `training_logs`
11. `training_log_techniques`
12. `training_log_flows`
13. RLSポリシー適用
14. ビュー/関数作成

---

*作成日: 2025年1月*
