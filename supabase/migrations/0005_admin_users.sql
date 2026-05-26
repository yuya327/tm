-- 管理者ユーザー管理。
-- 商品カタログ編集など特権操作は admin_users に登録された user_id のみ可。

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- 管理者自身のみ自身の admin レコードを参照可（is_admin チェック用）
create policy "admin_users_select_self" on public.admin_users for select
  using (auth.uid() = user_id);

-- 初期管理者の投入。email でルックアップして user_id を確定する。
-- email が auth.users に未登録なら挿入されず、後で再実行すれば OK。
insert into public.admin_users (user_id, email)
select id, email from auth.users where email = 'yuyakitamura327@gmail.com'
on conflict do nothing;
