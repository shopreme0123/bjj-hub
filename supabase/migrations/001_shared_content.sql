-- 共有コンテンツ用のテーブルを作成
-- Supabase SQL Editorで実行してください

create table if not exists shared_content (
  id uuid primary key default uuid_generate_v4(),
  content_type text not null check (content_type in ('technique', 'flow')),
  content_data jsonb not null,
  share_code text unique not null,
  visibility text not null check (visibility in ('public', 'link_only')),
  title text not null,
  description text,
  created_by uuid references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- インデックスを作成
create index if not exists idx_shared_content_share_code on shared_content(share_code);
create index if not exists idx_shared_content_visibility on shared_content(visibility);
create index if not exists idx_shared_content_type on shared_content(content_type);
create index if not exists idx_shared_content_created_at on shared_content(created_at desc);

-- Row Level Security (RLS) を有効化
alter table shared_content enable row level security;

-- ポリシー: 誰でも公開コンテンツを閲覧可能
create policy "Public content is viewable by everyone"
  on shared_content for select
  using (visibility = 'public');

-- ポリシー: リンクを知っている人は閲覧可能
create policy "Link-only content is viewable by anyone with the link"
  on shared_content for select
  using (visibility = 'link_only');

-- ポリシー: ログインユーザーは自分のコンテンツを作成可能
create policy "Users can create their own shared content"
  on shared_content for insert
  with check (auth.uid() = created_by);

-- ポリシー: ユーザーは自分のコンテンツを更新可能
create policy "Users can update their own shared content"
  on shared_content for update
  using (auth.uid() = created_by);

-- ポリシー: ユーザーは自分のコンテンツを削除可能
create policy "Users can delete their own shared content"
  on shared_content for delete
  using (auth.uid() = created_by);
