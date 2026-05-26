-- 注文アイテムに「どの商品カタログを選んだか」を保持する。
-- 既存行への影響を避けるため nullable で追加。
-- product_catalog 行の物理削除を防ぐため on delete restrict。

alter table public.print_order_items
  add column if not exists product_catalog_id uuid references public.product_catalog(id) on delete restrict;

create index if not exists print_order_items_catalog_id_idx on public.print_order_items(product_catalog_id);
