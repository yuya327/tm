import { notFound } from "next/navigation";
import { isCurrentUserAdmin } from "@/lib/supabase/queries";

// /admin 配下は管理者のみ。非管理者には 404 を返す（存在自体を隠す）。
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) notFound();

  return <>{children}</>;
}
