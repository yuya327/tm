import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";
import { getAlbum, listPhotos } from "@/lib/supabase/queries";
import { PhotoSelector } from "./PhotoSelector";

export default async function RecommendPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const photos = await listPhotos(id);
  if (photos.length === 0) {
    redirect(`/albums/${id}/upload`);
  }

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">
        ← アルバム一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{album.name}</h1>
      <StepIndicator current={3} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">加工する写真を選ぶ</h2>
        <PhotoSelector albumId={id} initialPhotos={photos} />
      </section>
    </Container>
  );
}
