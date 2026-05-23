import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© Travel Album Art</p>
        <nav className="flex flex-wrap gap-4">
          <Link href="/legal/terms" className="hover:text-stone-900">
            利用規約
          </Link>
          <Link href="/legal/privacy" className="hover:text-stone-900">
            プライバシーポリシー
          </Link>
          <Link href="/legal/tokushoho" className="hover:text-stone-900">
            特定商取引法表記
          </Link>
        </nav>
      </div>
    </footer>
  );
}
