import { NextResponse } from "next/server";
import { getImageGenProvider, type Style } from "@/lib/image-gen";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_STYLES: Style[] = ["anime", "watercolor", "oil", "pixel"];

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("image");
    const style = form.get("style") as string | null;
    const customPrompt = (form.get("customPrompt") as string | null) ?? undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "image file is required" }, { status: 400 });
    }
    if (!style || !VALID_STYLES.includes(style as Style)) {
      return NextResponse.json(
        { error: `style must be one of: ${VALID_STYLES.join(", ")}` },
        { status: 400 }
      );
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "image must be 10MB or less" }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const imageBase64 = buffer.toString("base64");

    const provider = getImageGenProvider();
    const result = await provider.transform({
      imageBase64,
      style: style as Style,
      customPrompt,
    });

    return NextResponse.json({
      imageBase64: result.imageBase64,
      provider: result.provider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[/api/transform] failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
