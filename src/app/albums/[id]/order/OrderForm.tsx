"use client";

import { useMemo, useState } from "react";
import type { ProductCatalogRow } from "@/lib/supabase/queries";
import { createOrderAction } from "./actions";

type Edit = {
  id: string;
  after_url: string;
};

export function OrderForm({
  albumId,
  edits,
  products,
}: {
  albumId: string;
  edits: Edit[];
  products: ProductCatalogRow[];
}) {
  const [productId, setProductId] = useState<string>(products[0]?.id ?? "");
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(edits.map((e) => [e.id, 1]))
  );
  const [pending, setPending] = useState(false);

  const product = products.find((p) => p.id === productId);

  const totals = useMemo(() => {
    const totalQty = Object.values(quantities).reduce((s, q) => s + q, 0);
    const subtotal = product ? totalQty * product.sell_price_jpy : 0;
    return { totalQty, subtotal };
  }, [quantities, product]);

  function setQty(editId: string, q: number) {
    setQuantities((prev) => ({ ...prev, [editId]: Math.max(0, q) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (totals.totalQty === 0 || !product) return;
    setPending(true);

    const form = new FormData();
    form.append("albumId", albumId);
    form.append("productCatalogId", product.id);
    form.append(
      "items",
      JSON.stringify(
        edits
          .map((edit) => ({ edit_id: edit.id, quantity: quantities[edit.id] ?? 0 }))
          .filter((i) => i.quantity > 0)
      )
    );

    await createOrderAction(form);
  }

  if (products.length === 0) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        販売中の商品がありません。管理画面で商品を有効化してください。
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">商品を選ぶ</h2>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li key={p.id}>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="productId"
                  checked={productId === p.id}
                  onChange={() => setProductId(p.id)}
                  className="peer sr-only"
                />
                <div className="rounded-lg border-2 border-stone-200 p-3 peer-checked:border-orange-500 peer-checked:bg-orange-50">
                  <p className="font-medium">{p.display_name}</p>
                  <p className="mt-1 text-xs text-stone-500">
                    ¥{p.sell_price_jpy.toLocaleString()}/枚 (税込)
                  </p>
                </div>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">対象画像と枚数</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {edits.map((edit) => (
            <li key={edit.id} className="rounded-lg border border-stone-200 p-2">
              <div className="aspect-square overflow-hidden rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={edit.after_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-sm">
                <button
                  type="button"
                  onClick={() => setQty(edit.id, (quantities[edit.id] ?? 0) - 1)}
                  className="h-6 w-6 rounded border border-stone-300 hover:bg-stone-50"
                >
                  −
                </button>
                <span className="w-6 text-center">{quantities[edit.id] ?? 0}</span>
                <button
                  type="button"
                  onClick={() => setQty(edit.id, (quantities[edit.id] ?? 0) + 1)}
                  className="h-6 w-6 rounded border border-stone-300 hover:bg-stone-50"
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-sm text-stone-600">
          合計 {totals.totalQty}枚
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between font-semibold">
            <dt>商品代金合計 (税込)</dt>
            <dd>¥{totals.subtotal.toLocaleString()}</dd>
          </div>
          <p className="text-xs text-stone-500">
            ※ 送料は SUZURI 側で別途加算されます。
          </p>
        </dl>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={pending || totals.totalQty === 0}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {pending ? "作成中…" : "注文内容を確認 →"}
          </button>
        </div>
      </section>
    </form>
  );
}
