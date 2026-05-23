import type { ImageGenProvider } from "./interface";
import { GeminiImageGenProvider } from "./gemini";

export type { Style, ImageGenInput, ImageGenResult, ImageGenProvider } from "./interface";
export { STYLE_LABELS } from "./interface";

let cached: ImageGenProvider | undefined;

export function getImageGenProvider(): ImageGenProvider {
  if (cached) return cached;

  const name = process.env.IMAGE_GEN_PROVIDER ?? "gemini";

  switch (name) {
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is required for IMAGE_GEN_PROVIDER=gemini");
      }
      cached = new GeminiImageGenProvider(apiKey);
      return cached;
    }
    default:
      throw new Error(`Unknown IMAGE_GEN_PROVIDER: ${name}`);
  }
}
