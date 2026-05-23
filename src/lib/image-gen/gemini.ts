import { GoogleGenAI } from "@google/genai";
import type {
  ImageGenInput,
  ImageGenProvider,
  ImageGenResult,
} from "./interface";
import { buildPrompt } from "./prompts";

const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.5-flash-image-preview";

export class GeminiImageGenProvider implements ImageGenProvider {
  readonly name = "gemini";

  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    this.client = new GoogleGenAI({ apiKey });
  }

  async transform(input: ImageGenInput): Promise<ImageGenResult> {
    const prompt = buildPrompt(input.style, input.customPrompt);
    const mimeType = input.imageBase64.startsWith("/9j/")
      ? "image/jpeg"
      : "image/png";

    const response = await this.client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType, data: input.imageBase64 } },
            { text: prompt },
          ],
        },
      ],
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      const text = parts.find((p) => p.text)?.text;
      throw new Error(
        `Gemini did not return an image. ${text ? `Message: ${text}` : ""}`
      );
    }

    return {
      imageBase64: imagePart.inlineData.data,
      provider: this.name,
    };
  }
}
