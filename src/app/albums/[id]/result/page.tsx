import Link from "next/link";
import { Container } from "@/components/Container";
import { mockPhotos } from "@/lib/mock/photos";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const results = mockPhotos.slice(0, 7);

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">← アルバム一覧</Link>
      <h1 className="mt-2 text-2xl font-bold">京都 春旅</h1>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">加工完了！</h2>
        <p className="mt-1 text-sm text-stone-600">
          Before / After を比較できます
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((p) => (
            <li key={p.id} className="rounded-lg border border-stone-200 p-2">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <p className="mb-1 text-center text-[10px] text-stone-500">Before</p>
                  <div className="aspect-square overflow-hidden rounded">
                    <img src={p.src} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-center text-[10px] text-orange-600">After</p>
                  <div className="aspect-square overflow-hidden rounded">
                    <img
                      src={p.src.replace("picsum.photos", "picsum.photos")}
                      alt=""
                      className="h-full w-full object-cover saturate-150 contrast-110"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <button className="rounded bg-stone-100 px-2 py-1 hover:bg-stone-200">
                  ⬇ DL
                </button>
                <button className="rounded bg-stone-100 px-2 py-1 hover:bg-stone-200">
                  ↻ 再生成
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm hover:bg-stone-50">
            全部まとめてZIPで保存
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-6">
        <h3 className="font-semibold">シールにして送ってもらう</h3>
        <p className="mt-1 text-sm text-stone-700">
          スーツケースに貼れる耐水・耐光のシール（7×7cm標準）
        </p>
        <Link
          href={`/albums/${id}/order`}
          className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          シールを注文する →
        </Link>
      </section>
    </Container>
  );
}
