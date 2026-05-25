import { Container } from "@/components/Container";
import { listOrders } from "@/lib/supabase/queries";

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending: { label: "未確定", cls: "bg-stone-100 text-stone-700" },
  created: { label: "決済へ", cls: "bg-amber-100 text-amber-700" },
  paid: { label: "印刷中", cls: "bg-amber-100 text-amber-700" },
  shipped: { label: "発送済み", cls: "bg-emerald-100 text-emerald-700" },
  cancelled: { label: "キャンセル", cls: "bg-red-100 text-red-700" },
};

export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <Container>
      <h1 className="text-2xl font-bold">注文履歴</h1>

      {orders.length === 0 ? (
        <p className="mt-12 text-center text-sm text-stone-500">
          注文履歴はまだありません
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {orders.map((o) => {
            const st = STATUS_LABELS[o.status] ?? {
              label: o.status,
              cls: "bg-stone-100 text-stone-700",
            };
            return (
              <li
                key={o.id}
                className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:items-center"
              >
                <div>
                  <p className="font-mono text-xs text-stone-500">
                    {o.id.slice(0, 8)}…
                  </p>
                  <p className="mt-1 font-medium">{o.album_name ?? "(unknown)"}</p>
                </div>
                <p className="text-sm text-stone-700">
                  {o.total_quantity}枚 / {o.size_cm_width}×{o.size_cm_height}cm
                </p>
                <p className="text-sm font-semibold">
                  ¥{o.total_jpy.toLocaleString()}
                </p>
                <div className="flex items-center justify-between sm:justify-end sm:gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${st.cls}`}>
                    {st.label}
                  </span>
                  {o.provider_checkout_url && (
                    <a
                      href={o.provider_checkout_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-600 hover:underline"
                    >
                      SUZURIで詳細 ↗
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Container>
  );
}
