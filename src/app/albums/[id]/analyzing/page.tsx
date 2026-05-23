import Link from "next/link";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";

export default async function AnalyzingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">← アルバム一覧</Link>
      <h1 className="mt-2 text-2xl font-bold">京都 春旅</h1>
      <StepIndicator current={2} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-10 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
        <h2 className="mt-6 text-lg font-semibold">AIが写真を選んでいます</h2>

        <div className="mx-auto mt-6 max-w-md">
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div className="h-full w-2/3 rounded-full bg-orange-500" />
          </div>
          <p className="mt-2 text-sm text-stone-600">68 / 87 枚</p>
        </div>

        <ul className="mx-auto mt-6 max-w-md space-y-1 text-left text-sm text-stone-700">
          <li>✓ 顔のクリアさを判定</li>
          <li>… 似ている写真をまとめています</li>
        </ul>

        <Link
          href={`/albums/${id}/recommend`}
          className="mt-8 inline-block text-xs text-stone-400 underline"
        >
          [プロト用] 完了画面へ
        </Link>
      </section>
    </Container>
  );
}
