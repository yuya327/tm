import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { getAlbum, listEdits } from "@/lib/supabase/queries";
import { OrderForm } from "./OrderForm";

export default async function OrderPage({
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
      <Link
        href={`/albums/${id}/result`}
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← 結果に戻る
      </Link>
      <h1 className="mt-2 text-2xl font-bold">シール注文</h1>
      <p className="mt-1 text-sm text-stone-600">{album.name}</p>

      <div className="mt-4">
        <OrderForm
          albumId={id}
          edits={edits.map((e) => ({ id: e.id, after_url: e.after_url }))}
        />
      </div>
    </Container>
  );
}
