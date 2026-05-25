import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getAlbum, listEdits } from "@/lib/supabase/queries";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const edits = await listEdits(id);
  if (edits.length === 0) {
    redirect(`/albums/${id}/style`);
  }

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">
        ← アルバム一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{album.name}</h1>

      <section className="mt-4 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">加工完了！</h2>
        <p className="mt-1 text-sm text-stone-600">
          {edits.length}枚の加工結果。Before / After で確認できます。
        </p>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {edits.map((e) => (
            <li key={e.id} className="rounded-lg border border-stone-200 p-2">
              <div className="grid grid-cols-2 gap-1">
                <div>
                  <p className="mb-1 text-center text-[10px] text-stone-500">
                    Before
                  </p>
                  <div className="aspect-square overflow-hidden rounded">
                    <img
                      src={e.before_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-center text-[10px] text-orange-600">
                    After
                  </p>
                  <div className="aspect-square overflow-hidden rounded">
                    <img
                      src={e.after_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-end">
                <a
                  href={e.after_url}
                  download={`${e.id}.png`}
                  className="rounded bg-stone-100 px-2 py-1 text-xs hover:bg-stone-200"
                >
                  ⬇ DL
                </a>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-6">
        <h3 className="font-semibold">シールにして送ってもらう</h3>
        <p className="mt-1 text-sm text-stone-700">
          スーツケースに貼れる耐水・耐光のシール（7×7cm 標準）
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
