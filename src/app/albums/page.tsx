import Link from "next/link";
import { Container } from "@/components/Container";
import { mockAlbums } from "@/lib/mock/photos";

export default function AlbumsPage() {
  return (
    <Container>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">マイアルバム</h1>
        <Link
          href="/albums/kyoto-spring/upload"
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
        >
          + 新規作成
        </Link>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockAlbums.map((a) => (
          <li key={a.id}>
            <Link
              href={`/albums/${a.id}/recommend`}
              className="block rounded-xl border border-stone-200 bg-white p-4 transition hover:border-orange-500 hover:shadow-sm"
            >
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-stone-100">
                <img
                  src={`https://picsum.photos/seed/${a.id}/600/400`}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <h2 className="font-semibold">{a.name}</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    a.status === "加工中"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {a.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                {a.count}枚 · {a.date}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
