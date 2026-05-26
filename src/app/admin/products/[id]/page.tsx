import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { getProduct } from "@/lib/supabase/queries";
import { ProductEditForm } from "./ProductEditForm";

export default async function AdminProductEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <Container>
      <Link
        href="/admin/products"
        className="text-sm text-stone-500 hover:text-stone-900"
      >
        ← 商品カタログ
      </Link>
      <h1 className="mt-2 text-2xl font-bold">商品を編集</h1>
      <p className="mt-1 text-sm text-stone-600">{product.display_name}</p>

      <div className="mt-6">
        <ProductEditForm product={product} />
      </div>
    </Container>
  );
}
