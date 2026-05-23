import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function CheckEmailPage() {
  return (
    <>
      <Header authed={false} />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600">
            ✉
          </div>
          <h1 className="mt-4 text-xl font-bold">メールを送信しました</h1>
          <p className="mt-3 text-sm text-stone-600">
            ご入力いただいたメールアドレス宛にログインリンクをお送りしました。<br />
            メール内のリンクをクリックしてログインしてください。
          </p>
          <p className="mt-6 text-xs text-stone-500">
            ※ 数分待っても届かない場合は迷惑メールフォルダをご確認ください
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-orange-600 hover:underline"
          >
            ← トップに戻る
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
