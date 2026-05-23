@AGENTS.md

# プロジェクト概要

旅行写真をAIでイラスト化し、シールとして郵送するWebサービス。
ユーザはアルバムをアップロード → AI が選別 → スタイル加工 → ダウンロード or シール注文。

詳細設計は [`docs/design.md`](docs/design.md)、画面遷移は [`docs/screen_flow.md`](docs/screen_flow.md) を参照。

# コミュニケーション

- 回答は日本語
- コード内コメントも日本語で可
- 実装前に不明点があれば必ず質問する
- 仕様が曖昧な場合は勝手に決めず、選択肢を提示して確認

# 技術スタック

- Next.js 16 (App Router) / TypeScript / Tailwind CSS v4
- Supabase (Auth / Postgres / Storage)
- 画像生成: Gemini 2.5 Flash Image（Phase A: 無料Tier）
  - Phase B でリリース直前に OpenAI gpt-image-1 / FLUX と比較して採用決定
- 顔判定: Google Cloud Vision API（無料Tier 月1,000まで）
- シール販売: SUZURI API（将来 Stripe + 自前印刷に切替予定）

# 絶対ルール

- 「ジブリ風」など特定スタジオ名は使わない（UI / プロンプト両方）。代わりに「アニメ風」「水彩風」「油絵風」「ピクセルアート」を使う
- 画像生成は `src/lib/image-gen/interface.ts` の `ImageGenProvider` 経由でのみ呼ぶ。実装を直接 import しない
- 印刷業者連携は `src/lib/print-providers/interface.ts` の `PrintProvider` 経由でのみ呼ぶ
- 環境変数を追加するときは `.env.example` を先に更新してから `.env.local` を編集
- Supabase の DB スキーマ変更は必ず migration ファイルを作る（`supabase/migrations/` は手動編集禁止）
- アップロード画像を外部 API に渡すときは、ユーザ同意済みであることを前提とする（Phase 8-2 のチェックボックスで取得）

# よく使うコマンド

- 開発サーバー起動: `npm run dev`
- 型チェック: `npx tsc --noEmit`
- Lint: `npm run lint`
- ビルド確認: `npm run build`

# 重要な注意

- Next.js 16 は破壊的変更を含む新バージョン。実装時は `node_modules/next/dist/docs/` を必ず参照（`AGENTS.md` 参照）
- React 19 / Tailwind v4 も同様に新しい挙動あり
- Windows + OneDrive 配下を避け、`C:\Users\yuyak\dev\tm` で開発している
