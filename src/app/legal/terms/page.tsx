import { Container } from "@/components/Container";

export default function TermsPage() {
  return (
    <Container>
      <article className="prose prose-stone mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">利用規約</h1>
        <p className="mt-2 text-sm text-stone-500">最終更新日: 2026-05-23</p>

        <h2 className="mt-8 text-lg font-semibold">第1条（適用）</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          本規約は、当サービス（Travel Album Art）が提供する写真アップロード・AI加工・シール販売の利用に関する条件を定めるものです。
        </p>

        <h2 className="mt-6 text-lg font-semibold">第2条（アップロード画像）</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          利用者は、アップロードする画像について、被写体本人または保護者の同意を得ているものとします。
          当サービスはアップロードされた画像をAIモデルの学習に利用しません。
        </p>

        <h2 className="mt-6 text-lg font-semibold">第3条（加工結果の著作権）</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          AI加工後の画像の利用権は利用者に帰属します。商用利用も可能です。
        </p>

        <h2 className="mt-6 text-lg font-semibold">第4条（禁止事項）</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          法令違反・公序良俗違反・他人の権利を侵害する画像のアップロード、
          および当サービスの運営を妨害する行為を禁止します。
        </p>

        <p className="mt-8 text-xs text-stone-400">※ 本ページは雛形です。実運用前に弁護士監修を予定。</p>
      </article>
    </Container>
  );
}
