import Link from "next/link";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";

const total = 7;
const done = 2;

export default async function TransformingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">← アルバム一覧</Link>
      <h1 className="mt-2 text-2xl font-bold">京都 春旅</h1>
      <StepIndicator current={5} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-10 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
        <h2 className="mt-6 text-lg font-semibold">アニメ風に加工中</h2>

        <ul className="mx-auto mt-6 flex max-w-md justify-center gap-2">
          {Array.from({ length: total }).map((_, i) => (
            <li
              key={i}
              className={`flex h-10 w-10 items-center justify-center rounded-md border text-sm ${
                i < done
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : i === done
                    ? "border-orange-500 bg-orange-100 text-orange-600 animate-pulse"
                    : "border-stone-200 bg-stone-50 text-stone-300"
              }`}
            >
              {i < done ? "✓" : i === done ? "⟳" : ""}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-stone-600">
          {done} / {total} 完了（約 90 秒）
        </p>

        <p className="mt-6 text-xs text-stone-500">
          ※ このページを閉じてもOK。完了時にメールでお知らせします。
        </p>

        <Link
          href={`/albums/${id}/result`}
          className="mt-8 inline-block text-xs text-stone-400 underline"
        >
          [プロト用] 完了画面へ
        </Link>
      </section>
    </Container>
  );
}
