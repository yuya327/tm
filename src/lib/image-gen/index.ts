import type { ImageGenProvider } from "./interface";
import { GeminiImageGenProvider } from "./gemini";
import { StubImageGenProvider } from "./stub";

export type { Style, ImageGenInput, ImageGenResult, ImageGenProvider } from "./interface";
export { STYLE_LABELS } from "./interface";

let cached: ImageGenProvider | undefined;
let cachedName: string | undefined;

export function getImageGenProvider(): ImageGenProvider {
  const name = process.env.IMAGE_GEN_PROVIDER ?? "gemini";
  if (cached && cachedName === name) return cached;

  switch (name) {
    case "stub": {
      cached = new StubImageGenProvider();
      cachedName = name;
      return cached;
    }
    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is required for IMAGE_GEN_PROVIDER=gemini");
      }
      cached = new GeminiImageGenProvider(apiKey);
      cachedName = name;
      return cached;
    }
    default:
      throw new Error(`Unknown IMAGE_GEN_PROVIDER: ${name}`);
  }
}
