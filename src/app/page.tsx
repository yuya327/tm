import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LoginForm } from "@/components/LoginForm";

export default function LandingPage() {
  return (
    <>
      <Header />
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

          <LoginForm />

          <p className="mt-6 text-xs text-stone-500">
            ※ アップロードした画像をAI学習には利用しません
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
