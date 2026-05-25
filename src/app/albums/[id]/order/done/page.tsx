import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import {
  getOrder,
  listOrderItemsWithProductUrl,
} from "@/lib/supabase/queries";

export default async function OrderDonePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { id } = await params;
  const { orderId } = await searchParams;
  if (!orderId) redirect(`/albums/${id}/order`);

  const order = await getOrder(orderId);
  if (!order) notFound();

  const items = await listOrderItemsWithProductUrl(orderId);

  return (
    <Container>
      <Link
        href="/orders"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← 注文履歴
      </Link>
      <h1 className="mt-2 text-2xl font-bold">SUZURI 商品ページ</h1>

      <section className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm">
        <p className="font-medium">商品の作成が完了しました</p>
        <p className="mt-2 text-stone-700">
          各カードの「SUZURI で購入」から、SUZURI のページに移動して住所入力・決済を行ってください。
        </p>
      </section>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <li
            key={it.id}
            className="overflow-hidden rounded-xl border border-stone-200 bg-white"
          >
            <div className="aspect-square w-full bg-stone-100">
              {it.after_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.after_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="p-3 text-sm">
              <p className="text-xs text-stone-500">数量: {it.quantity}枚</p>
              {it.product_url ? (
                <a
                  href={it.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block rounded-lg bg-stone-900 px-3 py-2 text-center text-xs font-medium text-white hover:bg-stone-800"
                >
                  SUZURI で購入 →
                </a>
              ) : (
                <p className="mt-2 text-xs text-red-600">商品URL未取得</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </Container>
  );
}
