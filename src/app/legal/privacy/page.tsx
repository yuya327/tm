import { Container } from "@/components/Container";

export default function PrivacyPage() {
  return (
    <Container>
      <article className="prose prose-stone mx-auto max-w-3xl">
        <h1 className="text-2xl font-bold">プライバシーポリシー</h1>
        <p className="mt-2 text-sm text-stone-500">最終更新日: 2026-05-23</p>

        <h2 className="mt-8 text-lg font-semibold">収集する情報</h2>
        <ul className="list-disc pl-6 text-sm leading-relaxed text-stone-700">
          <li>メールアドレス（認証のため）</li>
          <li>アップロードされた画像（加工と納品のため）</li>
          <li>注文情報・配送先住所（シール郵送のため）</li>
        </ul>

        <h2 className="mt-6 text-lg font-semibold">第三者への提供</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          画像加工のためAIサービス（Google Gemini 等）に画像を送信します。
          シール印刷・配送のためSUZURIに必要な情報を提供します。
          これらの提供先はAIモデルの学習に画像を利用しないことを確認しています。
        </p>

        <h2 className="mt-6 text-lg font-semibold">保存期間</h2>
        <p className="text-sm leading-relaxed text-stone-700">
          画像はアップロード後90日で自動削除します。
          注文情報は法令の定める期間保存します。
        </p>

        <p className="mt-8 text-xs text-stone-400">※ 本ページは雛形です。</p>
      </article>
    </Container>
  );
}
