import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./LogoutButton";

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded-md bg-orange-500" />
          Travel Album Art
        </Link>

        {user ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/albums" className="hover:text-orange-600">
              アルバム
            </Link>
            <Link href="/orders" className="hover:text-orange-600">
              注文履歴
            </Link>
            <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-700">
              {user.email}
            </span>
            <LogoutButton />
          </nav>
        ) : (
          <Link
            href="/legal/terms"
            className="text-sm text-stone-500 hover:text-stone-900"
          >
            利用規約
          </Link>
        )}
      </div>
    </header>
  );
}
