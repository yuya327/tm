import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";
import { getAlbum, listSelectedPhotos } from "@/lib/supabase/queries";
import { StyleForm } from "./StyleForm";

export default async function StylePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const photos = await listSelectedPhotos(id);
  if (photos.length === 0) {
    redirect(`/albums/${id}/recommend`);
  }

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">
        ← アルバム一覧
      </Link>
      <h1 className="mt-2 text-2xl font-bold">{album.name}</h1>
      <StepIndicator current={4} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <StyleForm
          albumId={id}
          photos={photos.map((p) => ({ id: p.id, url: p.url }))}
        />
      </section>
    </Container>
  );
}
