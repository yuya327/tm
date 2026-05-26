import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getOrder } from "@/lib/supabase/queries";
import { handoffToSuzuriAction } from "../actions";

export default async function OrderConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { id } = await params;
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect(`/albums/${id}/order`);
  }

  const order = await getOrder(orderId);
  if (!order) notFound();

  return (
    <Container>
      <Link
        href={`/albums/${id}/order`}
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← 仕様に戻る
      </Link>
      <h1 className="mt-2 text-2xl font-bold">注文確認</h1>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">数量</dt>
            <dd className="font-medium">{order.total_quantity} 枚</dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold">
            <dt>商品代金合計 (税込)</dt>
            <dd>¥{order.total_jpy.toLocaleString()}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-stone-500">
          ※ 送料は SUZURI 側で別途加算されます。
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm">
        <p className="font-medium">この先は SUZURI で手続きします</p>
        <p className="mt-2 text-stone-700">
          「決済に進む」を押すと、加工済み画像から <strong>SUZURI</strong> 上にステッカー商品が作成され、
          各商品ページのリンク一覧が表示されます。住所入力・決済・印刷・発送は SUZURI 側で行います。
        </p>
      </section>

      <form action={handoffToSuzuriAction} className="mt-4">
        <input type="hidden" name="orderId" value={order.id} />
        <input type="hidden" name="albumId" value={id} />
        <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-6">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              required
              className="mt-1 h-4 w-4 rounded border-stone-300 text-orange-600"
            />
            <span>
              <Link href="/legal/terms" className="underline">
                利用規約
              </Link>
              ・
              <Link href="/legal/tokushoho" className="underline">
                特商法表記
              </Link>
              に同意します
            </span>
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
            >
              SUZURI で商品を作成 →
            </button>
          </div>
        </div>
      </form>
    </Container>
  );
}
