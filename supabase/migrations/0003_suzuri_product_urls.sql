-- print_order_items に SUZURI 商品ページ URL を保持するカラムを追加。
-- 注文時に SUZURI API で各 edit からステッカー商品を作成し、その URL を控える。

alter table public.print_order_items
  add column if not exists provider_item_id text,
  add column if not exists product_url text;
