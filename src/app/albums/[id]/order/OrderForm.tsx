"use client";

import { useMemo, useState } from "react";
import { SIZE_OPTIONS, calcTotal, type SizeKey } from "./pricing";
import { createOrderAction } from "./actions";

type Edit = {
  id: string;
  after_url: string;
};

export function OrderForm({
  albumId,
  edits,
}: {
  albumId: string;
  edits: Edit[];
}) {
  const [sizeKey, setSizeKey] = useState<SizeKey>("7x7");
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(edits.map((e) => [e.id, 1]))
  );
  const [pending, setPending] = useState(false);

  const summary = useMemo(
    () =>
      calcTotal(
        sizeKey,
        edits.map((e) => quantities[e.id] ?? 0)
      ),
    [sizeKey, quantities, edits]
  );

  function setQty(editId: string, q: number) {
    setQuantities((prev) => ({ ...prev, [editId]: Math.max(0, q) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (summary.totalQty === 0) return;
    setPending(true);

    const form = new FormData();
    form.append("albumId", albumId);
    form.append("size", sizeKey);
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

  return (
    <form onSubmit={handleSubmit}>
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">サイズ</h2>
        <ul className="mt-3 grid grid-cols-3 gap-3">
          {SIZE_OPTIONS.map((s) => (
            <li key={s.key}>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="size"
                  checked={sizeKey === s.key}
                  onChange={() => setSizeKey(s.key)}
                  className="peer sr-only"
                />
                <div className="rounded-lg border-2 border-stone-200 p-3 text-center peer-checked:border-orange-500 peer-checked:bg-orange-50">
                  <p className="font-medium">{s.label}</p>
                  <p className="mt-1 text-xs text-stone-500">¥{s.unitJpy}/枚</p>
                  {s.recommended && (
                    <p className="mt-1 text-[10px] text-orange-600">おすすめ</p>
                  )}
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
          合計 {summary.totalQty}枚
        </p>
      </section>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>小計</dt>
            <dd>¥{summary.subtotal.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between">
            <dt>送料</dt>
            <dd>¥{summary.shipping.toLocaleString()}</dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold">
            <dt>合計</dt>
            <dd>¥{summary.total.toLocaleString()}</dd>
          </div>
        </dl>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={pending || summary.totalQty === 0}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {pending ? "作成中…" : "注文内容を確認 →"}
          </button>
        </div>
      </section>
    </form>
  );
}
