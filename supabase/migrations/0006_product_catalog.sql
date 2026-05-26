-- 商品カタログ。
-- 注文時にここから商品を選び、SUZURI API へ itemId / variantId / price(マージン) を渡す。
-- 初期はステッカーのみ。後で Tシャツ / マグ等を追加する想定。

create table if not exists public.product_catalog (
  id uuid primary key default gen_random_uuid(),
  suzuri_item_id integer not null,
  suzuri_variant_id integer not null,
  name text not null,
  display_name text not null,
  -- SUZURI 原価 (税抜)
  base_price_jpy integer not null,
  -- 我々の販売価格 (税込)。SUZURI に渡すマージンはこの値から逆算する。
  sell_price_jpy integer not null,
  enabled boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_catalog enable row level security;

-- 商品カタログは全ユーザー閲覧可 (有効なもののみ)。
create policy "product_catalog_select_enabled" on public.product_catalog for select
  using (enabled = true);

-- INSERT / UPDATE / DELETE は admin_users に登録された user_id のみ。
create policy "product_catalog_admin_insert" on public.product_catalog for insert
  with check (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );
create policy "product_catalog_admin_update" on public.product_catalog for update
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );
create policy "product_catalog_admin_delete" on public.product_catalog for delete
  using (
    exists (select 1 from public.admin_users where user_id = auth.uid())
  );

-- ステッカーの初期データ。
-- SUZURI ステッカー M / ホワイト: item id=11, variant id=606, 原価¥466(税抜) / ¥512(税込)
-- 初期販売価格は ¥700(税込) → マージン約 ¥170(税抜)
insert into public.product_catalog (
  suzuri_item_id, suzuri_variant_id, name, display_name,
  base_price_jpy, sell_price_jpy, enabled, sort_order
) values (
  11, 606, 'sticker', 'ステッカー (M / ホワイト)',
  466, 700, true, 1
) on conflict do nothing;
