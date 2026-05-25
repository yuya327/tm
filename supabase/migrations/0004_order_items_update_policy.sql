-- print_order_items に UPDATE ポリシーがなく、product_url 保存が RLS により暗黙拒否されていた。
-- order_id 経由で所有者一致を確認する update ポリシーを追加する。

create policy "order_items_update_own" on public.print_order_items for update
  using (
    exists (
      select 1 from public.print_orders
      where print_orders.id = print_order_items.order_id
        and print_orders.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.print_orders
      where print_orders.id = print_order_items.order_id
        and print_orders.user_id = auth.uid()
    )
  );
