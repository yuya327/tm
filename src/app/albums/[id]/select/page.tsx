import Link from "next/link";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";
import { PhotoTile } from "@/components/PhotoTile";
import { mockPhotos } from "@/lib/mock/photos";

export default async function SelectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">← アルバム一覧</Link>
      <h1 className="mt-2 text-2xl font-bold">京都 春旅</h1>
      <StepIndicator current={3} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">選び直す</h2>
          <span className="text-sm text-stone-500">選択中: 7 / 最大 10</span>
        </div>

        <div className="mt-4 flex gap-2 text-xs">
          <button className="rounded-full bg-stone-900 px-3 py-1.5 text-white">
            おすすめのみ
          </button>
          <button className="rounded-full border border-stone-300 bg-white px-3 py-1.5">
            全件表示 (87)
          </button>
        </div>

        <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
          {mockPhotos.map((p, i) => (
            <li key={p.id}>
              <PhotoTile
                src={p.src}
                starred={p.starred}
                selected={i < 7}
              />
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-stone-500">★ = AIおすすめ / ✓ = 採用</p>

        <div className="mt-8 flex justify-end">
          <Link
            href={`/albums/${id}/style`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            確定して次へ →
          </Link>
        </div>
      </section>
    </Container>
  );
}
