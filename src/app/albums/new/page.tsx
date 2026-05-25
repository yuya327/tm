import Link from "next/link";
import { Container } from "@/components/Container";
import { createAlbumAction } from "../actions";

export default function NewAlbumPage() {
  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500 hover:text-stone-900">
        ← アルバム一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">新しいアルバムを作成</h1>

      <form action={createAlbumAction} className="mt-6 max-w-md space-y-4">
        <label className="block text-sm font-medium">
          アルバム名
          <input
            type="text"
            name="name"
            required
            maxLength={64}
            placeholder="例: 京都 春旅"
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </label>

        <div className="flex gap-3">
          <Link
            href="/albums"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm hover:bg-stone-50"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            作成して画像をアップロード →
          </button>
        </div>
      </form>
    </Container>
  );
}
