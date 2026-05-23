import Link from "next/link";
import { Container } from "@/components/Container";

export default async function OrderConfirmPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <Link href={`/albums/${id}/order`} className="text-sm text-stone-500">
        ← 仕様に戻る
      </Link>
      <h1 className="mt-2 text-2xl font-bold">注文確認</h1>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-stone-500">サイズ</dt>
            <dd className="font-medium">7×7cm</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-stone-500">数量</dt>
            <dd className="font-medium">8 枚</dd>
          </div>
          <div className="flex justify-between border-t border-stone-200 pt-3 text-base font-semibold">
            <dt>合計</dt>
            <dd>¥2,650（税込・送料込）</dd>
          </div>
        </dl>
      </section>

      <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm">
        <p className="font-medium">この先はSUZURIのページで手続きします</p>
        <p className="mt-2 text-stone-700">
          提携先 <strong>SUZURI</strong> にて住所入力・決済・印刷・発送を行います。
          決済完了後、本サイトの「注文履歴」で進捗を確認できます。
        </p>
      </section>

      <div className="mt-4 space-y-3 rounded-xl border border-stone-200 bg-white p-6">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-stone-300 text-orange-600"
          />
          <span>
            <Link href="/legal/terms" className="underline">利用規約</Link>
            ・
            <Link href="/legal/tokushoho" className="underline">特商法表記</Link>
            に同意します
          </span>
        </label>

        <div className="flex justify-end">
          <a
            href="https://suzuri.jp/"
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            SUZURIで決済に進む →
          </a>
        </div>
      </div>
    </Container>
  );
}
