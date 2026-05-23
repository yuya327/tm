import { Container } from "@/components/Container";
import { mockOrders } from "@/lib/mock/photos";

export default function OrdersPage() {
  return (
    <Container>
      <h1 className="text-2xl font-bold">注文履歴</h1>

      <ul className="mt-6 divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {mockOrders.map((o) => (
          <li key={o.id} className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-4 sm:items-center">
            <div>
              <p className="font-mono text-xs text-stone-500">{o.id}</p>
              <p className="mt-1 font-medium">{o.album}</p>
            </div>
            <p className="text-sm text-stone-700">
              {o.qty}枚 / {o.sizeCm}
            </p>
            <p className="text-sm font-semibold">¥{o.totalJpy.toLocaleString()}</p>
            <div className="flex items-center justify-between sm:justify-end sm:gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  o.status === "発送済み"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {o.status}
              </span>
              <a
                href="https://suzuri.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-600 hover:underline"
              >
                SUZURIで詳細 ↗
              </a>
            </div>
          </li>
        ))}
      </ul>

      {mockOrders.length === 0 && (
        <p className="mt-12 text-center text-sm text-stone-500">
          注文履歴はまだありません
        </p>
      )}
    </Container>
  );
}
