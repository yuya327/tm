import Link from "next/link";
import { Container } from "@/components/Container";
import { calcSuzuriMargin, listAllProducts } from "@/lib/supabase/queries";

export default async function AdminProductsPage() {
  const products = await listAllProducts();

  return (
    <Container>
      <Link href="/admin" className="text-sm text-stone-500 hover:text-stone-900">
        ← 管理
      </Link>
      <h1 className="mt-2 text-2xl font-bold">商品カタログ</h1>
      <p className="mt-1 text-sm text-stone-600">
        販売中の商品。販売価格を変えるとSUZURIに渡すマージンが自動計算されます。
      </p>

      <table className="mt-6 w-full text-sm">
        <thead className="border-b border-stone-200 text-left text-xs text-stone-500">
          <tr>
            <th className="py-2">表示名</th>
            <th className="py-2">SUZURI</th>
            <th className="py-2 text-right">原価(税抜)</th>
            <th className="py-2 text-right">販売価格(税込)</th>
            <th className="py-2 text-right">マージン</th>
            <th className="py-2 text-center">公開</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const margin = calcSuzuriMargin(p.sell_price_jpy, p.base_price_jpy);
            return (
              <tr key={p.id} className="border-b border-stone-100">
                <td className="py-3">
                  <div className="font-medium">{p.display_name}</div>
                  <div className="text-xs text-stone-500">{p.name}</div>
                </td>
                <td className="py-3 text-xs text-stone-600">
                  item {p.suzuri_item_id} / var {p.suzuri_variant_id}
                </td>
                <td className="py-3 text-right">¥{p.base_price_jpy.toLocaleString()}</td>
                <td className="py-3 text-right font-medium">
                  ¥{p.sell_price_jpy.toLocaleString()}
                </td>
                <td className="py-3 text-right text-stone-600">¥{margin.toLocaleString()}</td>
                <td className="py-3 text-center">
                  {p.enabled ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      ON
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                      OFF
                    </span>
                  )}
                </td>
                <td className="py-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="text-xs text-orange-600 hover:underline"
                  >
                    編集
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {products.length === 0 && (
        <p className="mt-6 text-sm text-stone-500">商品が登録されていません。</p>
      )}
    </Container>
  );
}
