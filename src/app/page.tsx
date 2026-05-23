import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  return (
    <>
      <Header authed={false} />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-md text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white text-xl font-bold">
            T
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
            旅の写真を、<br />
            アートのシールに。
          </h1>
          <p className="mt-4 text-stone-600">
            AIが選別 → スタイル加工 → スーツケースへ
          </p>

          <form className="mt-10 space-y-3 text-left">
            <label className="block text-sm font-medium">
              メールアドレス
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </label>
            <Link
              href="/auth/check-email"
              className="block w-full rounded-lg bg-stone-900 px-4 py-2.5 text-center text-sm font-medium text-white hover:bg-stone-800"
            >
              ログインリンクを送る
            </Link>
          </form>

          <p className="mt-6 text-xs text-stone-500">
            ※ アップロードした画像をAI学習には利用しません
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
