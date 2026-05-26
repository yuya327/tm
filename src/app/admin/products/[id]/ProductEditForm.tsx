"use client";

import { useState } from "react";
import type { ProductCatalogRow } from "@/lib/supabase/queries";
import { updateProductAction } from "./actions";

export function ProductEditForm({ product }: { product: ProductCatalogRow }) {
  const [sellPrice, setSellPrice] = useState(product.sell_price_jpy);

  // SUZURI 渡しマージン (税抜) の即時プレビュー
  const totalTaxOut = Math.round(sellPrice / 1.1);
  const margin = Math.max(0, totalTaxOut - product.base_price_jpy);

  return (
    <form action={updateProductAction} className="space-y-6">
      <input type="hidden" name="id" value={product.id} />

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">基本情報</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-stone-600">表示名</span>
            <input
              type="text"
              name="display_name"
              defaultValue={product.display_name}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="text-xs text-stone-600">並び順</span>
            <input
              type="number"
              name="sort_order"
              defaultValue={product.sort_order}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
          </label>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-stone-50 p-3 text-sm">
          <div>
            <div className="text-xs text-stone-500">SUZURI item ID</div>
            <div className="font-medium">{product.suzuri_item_id}</div>
          </div>
          <div>
            <div className="text-xs text-stone-500">SUZURI variant ID</div>
            <div className="font-medium">{product.suzuri_variant_id}</div>
          </div>
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="enabled"
            defaultChecked={product.enabled}
            className="h-4 w-4 rounded border-stone-300 text-orange-600"
          />
          <span>注文画面に表示する（公開）</span>
        </label>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">価格</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-stone-50 p-3">
            <div className="text-xs text-stone-500">原価 (税抜)</div>
            <div className="mt-1 text-lg font-semibold">
              ¥{product.base_price_jpy.toLocaleString()}
            </div>
            <div className="mt-1 text-[10px] text-stone-500">SUZURI 固定</div>
          </div>

          <label className="block">
            <span className="text-xs text-stone-600">販売価格 (税込)</span>
            <input
              type="number"
              name="sell_price_jpy"
              value={sellPrice}
              onChange={(e) => setSellPrice(Number.parseInt(e.target.value, 10) || 0)}
              min={1}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
            />
            <span className="mt-1 block text-[10px] text-stone-500">
              ユーザーに見せる金額
            </span>
          </label>

          <div className="rounded-lg bg-orange-50 p-3">
            <div className="text-xs text-stone-600">SUZURI 渡しマージン</div>
            <div className="mt-1 text-lg font-semibold text-orange-700">
              ¥{margin.toLocaleString()}
            </div>
            <div className="mt-1 text-[10px] text-stone-500">
              (税込売価 ÷ 1.1) − 原価
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          保存
        </button>
      </div>
    </form>
  );
}
