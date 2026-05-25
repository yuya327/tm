import Link from "next/link";
import { Container } from "@/components/Container";
import { listAlbums } from "@/lib/supabase/queries";

export default async function AlbumsPage() {
  const albums = await listAlbums();

  return (
    <Container>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">マイアルバム</h1>
        <Link
          href="/albums/new"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          + 新規作成
        </Link>
      </div>

      {albums.length === 0 ? (
        <div className="mt-12 rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-sm text-stone-600">アルバムはまだありません</p>
          <Link
            href="/albums/new"
            className="mt-4 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            最初のアルバムを作成 →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((a) => (
            <li key={a.id}>
              <Link
                href={`/albums/${a.id}/upload`}
                className="block rounded-xl border border-stone-200 bg-white p-4 transition hover:border-orange-500 hover:shadow-sm"
              >
                <div className="flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-stone-100 text-stone-400">
                  📷
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <h2 className="font-semibold">{a.name}</h2>
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                    {a.photo_count}枚
                  </span>
                </div>
                <p className="mt-1 text-xs text-stone-500">
                  {new Date(a.created_at).toLocaleDateString("ja-JP")}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
