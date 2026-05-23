import type { Style } from "./interface";

const STYLE_PROMPTS: Record<Style, string> = {
  anime:
    "Transform this photograph into a Japanese anime/manga illustration. " +
    "Use clean line art, vibrant cel-shaded colors, expressive eyes, and stylized hair. " +
    "Keep the person's face, identity, pose, and overall composition recognizable.",
  watercolor:
    "Transform this photograph into a soft watercolor painting. " +
    "Use gentle washes, subtle paper texture, and muted but warm color palette. " +
    "Keep the person's face, identity, pose, and overall composition recognizable.",
  oil:
    "Transform this photograph into a classical oil painting. " +
    "Use rich textured brush strokes, warm dramatic lighting, and a painterly finish. " +
    "Keep the person's face, identity, pose, and overall composition recognizable.",
  pixel:
    "Transform this photograph into 16-bit pixel art. " +
    "Use a limited retro game palette, blocky pixels, and clear silhouettes. " +
    "Keep the person's face, identity, pose, and overall composition recognizable.",
};

export function buildPrompt(style: Style, customPrompt?: string): string {
  const base = STYLE_PROMPTS[style];
  const custom = customPrompt?.trim()
    ? `\n\nAdditional request from the user: ${customPrompt.trim()}`
    : "";
  return base + custom;
}
