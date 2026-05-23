import Link from "next/link";
import { Container } from "@/components/Container";
import { mockPhotos } from "@/lib/mock/photos";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const items = mockPhotos.slice(0, 7);

  return (
    <Container>
      <Link href={`/albums/${id}/result`} className="text-sm text-stone-500">
        ← 結果に戻る
      </Link>
      <h1 className="mt-2 text-2xl font-bold">シール注文</h1>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">サイズ</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { v: "7x7", label: "7×7cm", note: "おすすめ" },
            { v: "5x5", label: "5×5cm" },
            { v: "10x10", label: "10×10cm" },
            { v: "custom", label: "カスタム" },
          ].map((s, i) => (
            <li key={s.v}>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="size"
                  defaultChecked={i === 0}
                  className="peer sr-only"
                />
                <div className="rounded-lg border-2 border-stone-200 p-3 text-center peer-checked:border-orange-500 peer-checked:bg-orange-50">
                  <p className="font-medium">{s.label}</p>
                  {s.note && (
                    <p className="mt-1 text-xs text-orange-600">{s.note}</p>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">対象画像と枚数</h2>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {items.map((p, i) => (
            <li key={p.id} className="rounded-lg border border-stone-200 p-2">
              <div className="aspect-square overflow-hidden rounded">
                <img src={p.src} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="mt-2 flex items-center justify-center gap-1 text-sm">
                <button className="h-6 w-6 rounded border border-stone-300 hover:bg-stone-50">
                  −
                </button>
                <span className="w-6 text-center">{i === 0 ? 2 : 1}</span>
                <button className="h-6 w-6 rounded border border-stone-300 hover:bg-stone-50">
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-right text-sm text-stone-600">合計 8 枚</p>
      </section>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>小計</dt>
            <dd>¥2,400</dd>
          </div>
          <div className="flex justify-between">
            <dt>送料</dt>
            <dd>¥250</dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold">
            <dt>合計</dt>
            <dd>¥2,650</dd>
          </div>
        </dl>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/albums/${id}/order/confirm`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            注文内容を確認 →
          </Link>
        </div>
      </section>
    </Container>
  );
}
