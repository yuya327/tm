import type {
  ImageGenInput,
  ImageGenProvider,
  ImageGenResult,
} from "./interface";

// 開発・テスト用の無料スタブ。入力画像をそのまま返すだけ。
// API は一切呼ばないので課金ゼロ・即時応答。
// 本番品質を確認したい時は IMAGE_GEN_PROVIDER=gemini に切り替える。
export class StubImageGenProvider implements ImageGenProvider {
  readonly name = "stub";

  async transform(input: ImageGenInput): Promise<ImageGenResult> {
    // わずかに遅延させて「処理してる感」を出す
    await new Promise((r) => setTimeout(r, 300 + Math.random() * 700));
    return {
      imageBase64: input.imageBase64,
      provider: this.name,
      costUsd: 0,
    };
  }
}
