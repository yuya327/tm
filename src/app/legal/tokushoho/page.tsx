import { Container } from "@/components/Container";

export default function TokushohoPage() {
  return (
    <Container authed={false}>
      <article className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">特定商取引法に基づく表記</h1>
        <p className="mt-2 text-sm text-stone-500">最終更新日: 2026-05-23</p>

        <dl className="mt-8 divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white text-sm">
          {[
            ["事業者名", "（プロト中・後で記入）"],
            ["所在地", "（プロト中・後で記入）"],
            ["連絡先", "support@example.com"],
            ["販売価格", "各商品ページに記載（送料込み）"],
            ["支払方法", "クレジットカード（提携先SUZURI経由）"],
            ["商品の引き渡し時期", "決済完了後5〜10営業日"],
            ["返品・交換", "印刷物の特性上、製品不良以外は返品不可"],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3">
              <dt className="text-stone-500">{k}</dt>
              <dd className="col-span-2">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-xs text-stone-400">※ 本ページは雛形です。本番開始前に確定します。</p>
      </article>
    </Container>
  );
}
