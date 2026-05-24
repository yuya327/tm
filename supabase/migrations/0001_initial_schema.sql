-- ============================================================================
-- Travel Album Art: 初期スキーマ
--
-- Supabase Dashboard → SQL Editor で全文をペーストして実行する。
-- 既に同名テーブルがあるとエラーになるので、初回のみ実行。
-- ============================================================================

-- ============================================================================
-- 1. テーブル定義
-- ============================================================================

-- アルバム
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index if not exists albums_user_id_idx on public.albums(user_id);

-- 写真 (アップロード元画像のメタデータ)
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer,
  -- 解析結果 (Phase 8-3 で更新される、初期はnull)
  face_count integer,
  face_clarity_score real,
  sharpness real,
  phash text,
  cluster_id integer,
  ai_score real,
  -- ユーザ操作
  is_recommended boolean not null default false,
  user_decision text check (user_decision in ('include','exclude')),
  created_at timestamptz not null default now()
);
create index if not exists photos_album_id_idx on public.photos(album_id);

-- 加工結果
create table if not exists public.edits (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  style text not null,
  custom_prompt text,
  result_storage_path text,
  status text not null default 'pending'
    check (status in ('pending','processing','completed','failed')),
  provider text,
  error text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists edits_photo_id_idx on public.edits(photo_id);

-- シール注文
create table if not exists public.print_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  size_cm_width real not null,
  size_cm_height real not null,
  total_quantity integer not null,
  provider text not null check (provider in ('suzuri','stripe')),
  provider_item_id text,
  provider_checkout_url text,
  total_jpy integer,
  status text not null default 'pending'
    check (status in ('pending','created','paid','shipped','cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists print_orders_user_id_idx on public.print_orders(user_id);

-- 注文明細 (1注文に複数 edit を含める用)
create table if not exists public.print_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.print_orders(id) on delete cascade,
  edit_id uuid not null references public.edits(id),
  quantity integer not null default 1
);
create index if not exists print_order_items_order_id_idx on public.print_order_items(order_id);

-- スタイルマスタ (アニメ風 / 水彩風 等)
create table if not exists public.styles (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  prompt_template text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

-- スタイルの初期データ
insert into public.styles (key, label, prompt_template, sort_order) values
  ('anime', 'アニメ風',
    'Transform this photograph into a Japanese anime/manga illustration. Use clean line art, vibrant cel-shaded colors, expressive eyes, and stylized hair. Keep the person''s face, identity, pose, and overall composition recognizable.',
    1),
  ('watercolor', '水彩風',
    'Transform this photograph into a soft watercolor painting. Use gentle washes, subtle paper texture, and muted but warm color palette. Keep the person''s face, identity, pose, and overall composition recognizable.',
    2),
  ('oil', '油絵風',
    'Transform this photograph into a classical oil painting. Use rich textured brush strokes, warm dramatic lighting, and a painterly finish. Keep the person''s face, identity, pose, and overall composition recognizable.',
    3),
  ('pixel', 'ピクセルアート',
    'Transform this photograph into 16-bit pixel art. Use a limited retro game palette, blocky pixels, and clear silhouettes. Keep the person''s face, identity, pose, and overall composition recognizable.',
    4)
on conflict (key) do nothing;

-- ============================================================================
-- 2. Row Level Security (RLS) 有効化
-- ============================================================================

alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.edits enable row level security;
alter table public.print_orders enable row level security;
alter table public.print_order_items enable row level security;
alter table public.styles enable row level security;

-- ============================================================================
-- 3. RLS ポリシー (各ユーザは自分のデータのみアクセス可)
-- ============================================================================

-- Albums: 所有者のみフルアクセス
create policy "albums_select_own" on public.albums for select using (auth.uid() = user_id);
create policy "albums_insert_own" on public.albums for insert with check (auth.uid() = user_id);
create policy "albums_update_own" on public.albums for update using (auth.uid() = user_id);
create policy "albums_delete_own" on public.albums for delete using (auth.uid() = user_id);

-- Photos: album 経由で所有者チェック
create policy "photos_select_own" on public.photos for select using (
  exists (select 1 from public.albums where albums.id = photos.album_id and albums.user_id = auth.uid())
);
create policy "photos_insert_own" on public.photos for insert with check (
  exists (select 1 from public.albums where albums.id = photos.album_id and albums.user_id = auth.uid())
);
create policy "photos_update_own" on public.photos for update using (
  exists (select 1 from public.albums where albums.id = photos.album_id and albums.user_id = auth.uid())
);
create policy "photos_delete_own" on public.photos for delete using (
  exists (select 1 from public.albums where albums.id = photos.album_id and albums.user_id = auth.uid())
);

-- Edits: photo -> album -> user で所有者チェック
create policy "edits_select_own" on public.edits for select using (
  exists (
    select 1 from public.photos
    join public.albums on albums.id = photos.album_id
    where photos.id = edits.photo_id and albums.user_id = auth.uid()
  )
);
create policy "edits_insert_own" on public.edits for insert with check (
  exists (
    select 1 from public.photos
    join public.albums on albums.id = photos.album_id
    where photos.id = edits.photo_id and albums.user_id = auth.uid()
  )
);
create policy "edits_update_own" on public.edits for update using (
  exists (
    select 1 from public.photos
    join public.albums on albums.id = photos.album_id
    where photos.id = edits.photo_id and albums.user_id = auth.uid()
  )
);

-- Print orders: 所有者のみ
create policy "orders_select_own" on public.print_orders for select using (auth.uid() = user_id);
create policy "orders_insert_own" on public.print_orders for insert with check (auth.uid() = user_id);
create policy "orders_update_own" on public.print_orders for update using (auth.uid() = user_id);

-- Order items: order 経由で所有者チェック
create policy "order_items_select_own" on public.print_order_items for select using (
  exists (select 1 from public.print_orders where print_orders.id = print_order_items.order_id and print_orders.user_id = auth.uid())
);
create policy "order_items_insert_own" on public.print_order_items for insert with check (
  exists (select 1 from public.print_orders where print_orders.id = print_order_items.order_id and print_orders.user_id = auth.uid())
);

-- Styles: 全ユーザが active なものを読める (書き込みは管理者のみ = anonでは不可)
create policy "styles_select_active" on public.styles for select using (is_active = true);
