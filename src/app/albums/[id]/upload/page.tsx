import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";
import { getAlbum } from "@/lib/supabase/queries";
import { UploadForm } from "./UploadForm";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500 hover:text-stone-900">
        ← アルバム一覧に戻る
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{album.name}</h1>
      <StepIndicator current={1} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">画像をアップロード</h2>
        <p className="mt-1 text-sm text-stone-600">
          最大100枚・画像のみ（JPG/PNG/WEBP/HEIC）
        </p>

        <UploadForm albumId={id} />
      </section>
    </Container>
  );
}
