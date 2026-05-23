import Link from "next/link";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";

export default async function UploadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500 hover:text-stone-900">
        ← アルバム一覧に戻る
      </Link>
      <h1 className="mt-2 text-2xl font-bold">京都 春旅</h1>
      <StepIndicator current={1} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">画像をアップロード</h2>
        <p className="mt-1 text-sm text-stone-600">
          最大100枚・画像のみ（JPG/PNG/HEIC対応）
        </p>

        <label className="mt-6 flex aspect-[3/1] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-500 hover:border-orange-400 hover:bg-orange-50">
          <span className="text-3xl">⬆</span>
          <p className="mt-2 text-sm font-medium">ここにドラッグ&ドロップ</p>
          <p className="text-xs">または<span className="ml-1 text-orange-600 underline">ファイルを選択</span></p>
          <input type="file" multiple accept="image/*" className="hidden" />
        </label>

        <div className="mt-6 space-y-2 text-sm">
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-stone-300 text-orange-600" />
            <span>被写体本人または保護者の同意を得ています</span>
          </label>
          <label className="flex items-start gap-2">
            <input type="checkbox" className="mt-1 h-4 w-4 rounded border-stone-300 text-orange-600" />
            <span>顔画像をAI解析に使うことに同意します</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/albums/${id}/analyzing`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            解析を開始 →
          </Link>
        </div>
      </section>
    </Container>
  );
}
