import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";
import { getAlbum, listPhotos } from "@/lib/supabase/queries";
import { UploadForm } from "./UploadForm";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const existingPhotos = await listPhotos(id);
  const hasPhotos = existingPhotos.length > 0;

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500 hover:text-stone-900">
        ← アルバム一覧に戻る
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{album.name}</h1>
      <StepIndicator current={1} />

      {hasPhotos && (
        <section className="mt-2 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              このアルバムには既に <strong>{existingPhotos.length}枚</strong>{" "}
              の写真があります。
            </p>
            <Link
              href={`/albums/${id}/recommend`}
              className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-800"
            >
              既存写真で続ける →
            </Link>
          </div>
        </section>
      )}

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">
          {hasPhotos ? "写真を追加でアップロード" : "画像をアップロード"}
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          最大100枚・画像のみ（JPG/PNG/WEBP/HEIC）
        </p>

        <UploadForm albumId={id} />
      </section>
    </Container>
  );
}
