import Link from "next/link";
import { Container } from "@/components/Container";

export default function AdminDashboardPage() {
  return (
    <Container>
      <h1 className="text-2xl font-bold">管理</h1>
      <p className="mt-1 text-sm text-stone-600">
        商品カタログ・価格・販売状態の管理を行います。
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <li>
          <Link
            href="/admin/products"
            className="block rounded-xl border border-stone-200 bg-white p-5 hover:border-orange-500"
          >
            <h2 className="font-semibold">商品カタログ</h2>
            <p className="mt-1 text-sm text-stone-600">
              販売中の商品種別・販売価格・有効状態を編集します。
            </p>
          </Link>
        </li>
      </ul>
    </Container>
  );
}
