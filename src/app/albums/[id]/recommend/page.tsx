import Link from "next/link";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";
import { PhotoTile } from "@/components/PhotoTile";
import { mockPhotos } from "@/lib/mock/photos";

export default async function RecommendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recommended = mockPhotos.slice(0, 7);

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">← アルバム一覧</Link>
      <h1 className="mt-2 text-2xl font-bold">京都 春旅</h1>
      <StepIndicator current={3} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">AIのおすすめ 7枚</h2>
          <Link
            href={`/albums/${id}/select`}
            className="text-sm text-orange-600 hover:underline"
          >
            ✎ 選び直す
          </Link>
        </div>
        <p className="mt-1 text-sm text-stone-600">
          顔がはっきり写っている写真を選びました
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {recommended.map((p) => (
            <li key={p.id}>
              <PhotoTile src={p.src} selected starred />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-end">
          <Link
            href={`/albums/${id}/style`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            この7枚で進む →
          </Link>
        </div>
      </section>
    </Container>
  );
}
