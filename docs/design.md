# 設計ドキュメント

## 1. プロジェクト概要

旅行写真をAIでイラスト化し、シールとして郵送するWebサービス。

**フロー**:
1. ユーザが旅行のアルバム画像をアップロード
2. AIが選別（顔がクリアな画像を残し、類似画像を除外）
3. ユーザに推薦7枚を提示、追加/除外を確認
4. スタイル選択（アニメ風 / 水彩風 / 油絵風 / ピクセルアート）+ 自由記述
5. 加工結果のダウンロード
6. シール注文（任意） → 7×7cm 等のサイズ指定 → SUZURI 経由で印刷・発送

## 2. 確定要件

| 項目 | 内容 |
|---|---|
| ターゲット | 個人 / 身内向けプロトタイプ（最速リリース重視） |
| 1アルバム上限 | 100枚、画像のみ（動画対象外） |
| アップロード | 端末ローカルのみ |
| 選別基準 | 顔のクリアさ（後段イラスト化の精度担保のため） |
| 推薦枚数 | 7枚 |
| スタイル | アニメ風 / 水彩風 / 油絵風 / ピクセルアート（DB管理で追加可） |
| シール | 7×7cm 標準、サイズ指定可。スーツケース用途 |
| 印刷・決済 | Phase A: SUZURI API / 将来: Stripe + 自前印刷業者 |
| デプロイ | Vercel + Supabase Cloud（無料Tier） |

## 3. 技術スタック（Phase A 構成）

| レイヤ | 採用 | 備考 |
|---|---|---|
| フレームワーク | Next.js 16 (App Router) | Turbopack 有効 |
| UI | Tailwind CSS v4 / shadcn/ui | shadcn は Phase 8 で導入 |
| 言語 | TypeScript | |
| 認証 | Supabase Auth (Magic Link) | |
| DB | Supabase Postgres | |
| ストレージ | Supabase Storage | |
| 画像生成 | **Gemini 2.5 Flash Image (無料Tier)** | Phase B で OpenAI / FLUX と比較 |
| 顔判定 | Google Cloud Vision API | 無料1,000ユニット/月 |
| 重複除去 | pHash (perceptual hash) | クラスタ内最高スコアを代表 |
| 印刷・販売 | SUZURI API | 抽象化レイヤ経由で将来差替可能 |
| ホスティング | Vercel Hobby | git push で自動デプロイ |

## 4. アーキテクチャ

```
[Browser]
  │  ① 画像アップロード (max 100枚)
  ▼
[Next.js (Vercel)]
  │
  ├─ Supabase Auth (Magic Link)
  ├─ Supabase Storage  ← 元画像 / 加工後画像
  ├─ Supabase Postgres ← メタデータ・注文
  │
  ├─ /api/analyze        ── Google Vision (顔検出・ぼかし) + pHash
  ├─ /api/transform      ── ImageGenProvider (現状 Gemini)
  └─ /api/order          ── PrintProvider (現状 SUZURI)
```

### 抽象化レイヤ

| レイヤ | 場所 | 役割 |
|---|---|---|
| `ImageGenProvider` | `src/lib/image-gen/interface.ts` | 画像生成 API 切替（Gemini ⇄ OpenAI ⇄ FLUX） |
| `PrintProvider` | `src/lib/print-providers/interface.ts` | 印刷・販売 API 切替（SUZURI ⇄ Stripe） |

呼び出し側は環境変数 (`IMAGE_GEN_PROVIDER` / `PRINT_PROVIDER`) で実装を選択する。

## 5. データモデル（Supabase Postgres）

```sql
albums          (id, user_id, name, created_at)
photos          (id, album_id, storage_path,
                 face_count, face_clarity_score, sharpness, phash,
                 cluster_id, ai_score,
                 is_recommended, user_decision /* include/exclude/none */)
edits           (id, photo_id, style, custom_prompt,
                 result_storage_path, status, error, created_at)
print_orders    (id, user_id, edit_ids[], size_cm, qty,
                 provider /* 'suzuri'|'stripe' */,
                 provider_item_id, provider_checkout_url,
                 status, created_at)
styles          (id, key, label, prompt_template, sort_order, is_active)
```

## 6. 主要ユーザーフロー

1. ログイン (Magic Link)
2. アルバム作成 → 画像ドロップ (最大100枚)
3. 解析（バックグラウンド）: Vision API + pHash
4. 推薦7枚を提示
5. ユーザ選別 (追加 / 除外)
6. スタイル選択 + 自由記述
7. 加工実行 (Gemini, 1枚 ~5〜15秒)
8. 結果プレビュー + ダウンロード
9. シール注文 (任意) → サイズ・枚数 → SUZURI 商品ページへ遷移
10. SUZURI 側で住所入力・決済・印刷・発送

詳細な画面遷移は [`screen_flow.md`](screen_flow.md) を参照。

## 7. フェーズ計画

| Phase | 内容 |
|---|---|
| Phase 0 | 環境準備 |
| Phase 1 | アカウント作成 (GitHub / Vercel / Supabase / Google AI Studio) |
| Phase 2 | Next.js 雛形生成 |
| Phase 3 | CLAUDE.md / docs / 抽象化フォルダ配置 |
| Phase 4 | GitHub へ push |
| Phase 5 | Vercel 連携 |
| Phase 6 | Supabase プロジェクト作成 |
| Phase 7 | 環境変数設定 & 動作確認 |
| Phase 8 | 機能実装 (Gemini 無料Tier 利用) |
| Phase 9 | リリース直前: 有料画像API比較 |
| Phase 10 | 本番リリース |

## 8. リスク・注意点

- **「ジブリ風」表現禁止**。商標・著作権リスク回避のため UI / プロンプト両方で使わない
- **顔写真の AI 渡し** はユーザ同意取得必須（Phase 8-2 のチェックボックス）
- **SUZURI 連携** は商品ページ遷移型のため、住所・決済 UI は自前で持てない（将来 Stripe で内製化）
- **画像生成コスト**: Phase A は無料Tier、Phase B 移行時にレート制限・予算アラート設定
- **顔判定** の閾値は実画像でチューニング前提（`detectionConfidence` + `blurredLikelihood`）

## 9. 開いている論点

リリース前に確定が必要：

- 価格モデル（1枚 × 枚数 / シート単位）
- 配送ポリシー（返品・キャンセル・破損時）
- 特商法・プライバシー・利用規約の最終文面
- 未成年被写体への明示同意フロー
- 管理画面の必要性（Phase A は Supabase Studio + SUZURI ダッシュボード代用）
