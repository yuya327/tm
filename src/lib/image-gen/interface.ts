// 画像生成 API の抽象化レイヤ。
// 呼び出し側は `getImageGenProvider()` 経由でのみ利用し、
// 具体実装 (Gemini / OpenAI / FLUX 等) を直接 import しない。

export type Style = "anime" | "watercolor" | "oil" | "pixel";

export const STYLE_LABELS: Record<Style, string> = {
  anime: "アニメ風",
  watercolor: "水彩風",
  oil: "油絵風",
  pixel: "ピクセルアート",
};

export interface ImageGenInput {
  /** 元画像 (Base64 エンコード済み、data URI prefix 無し) */
  imageBase64: string;
  /** 加工スタイル */
  style: Style;
  /** ユーザの自由記述 (例: "表情を明るく、肌をきれいに") */
  customPrompt?: string;
}

export interface ImageGenResult {
  /** 生成画像 (Base64) */
  imageBase64: string;
  /** どのプロバイダで生成したか (ログ・課金集計用) */
  provider: string;
  /** 概算コスト USD (取得できる場合のみ) */
  costUsd?: number;
}

export interface ImageGenProvider {
  readonly name: string;
  transform(input: ImageGenInput): Promise<ImageGenResult>;
}
