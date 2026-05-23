import Link from "next/link";
import { Container } from "@/components/Container";
import { StepIndicator } from "@/components/StepIndicator";
import { STYLE_LABELS } from "@/lib/image-gen/interface";

const STYLES = (Object.keys(STYLE_LABELS) as Array<keyof typeof STYLE_LABELS>).map(
  (key) => ({
    key,
    label: STYLE_LABELS[key],
    preview: `https://picsum.photos/seed/${key}/300/300`,
  })
);

export default async function StylePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Container>
      <Link href="/albums" className="text-sm text-stone-500">← アルバム一覧</Link>
      <h1 className="mt-2 text-2xl font-bold">京都 春旅</h1>
      <StepIndicator current={4} />

      <section className="mt-2 rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-base font-semibold">どのスタイルに加工しますか？</h2>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STYLES.map((s, i) => (
            <li key={s.key}>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="style"
                  defaultChecked={i === 0}
                  className="peer sr-only"
                />
                <div className="rounded-xl border-2 border-stone-200 bg-white p-2 peer-checked:border-orange-500 peer-checked:ring-2 peer-checked:ring-orange-200">
                  <div className="aspect-square overflow-hidden rounded-lg bg-stone-100">
                    <img src={s.preview} alt="" className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-2 text-center text-sm font-medium">{s.label}</p>
                </div>
              </label>
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <label className="block text-sm font-medium">
            追加の要望（自由記述・任意）
          </label>
          <textarea
            rows={3}
            placeholder="例) 表情をもっと明るく、肌をきれいに"
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-stone-500">対象: 7枚 × 1スタイル</p>
          <Link
            href={`/albums/${id}/transforming`}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800"
          >
            加工を開始 →
          </Link>
        </div>
      </section>
    </Container>
  );
}
