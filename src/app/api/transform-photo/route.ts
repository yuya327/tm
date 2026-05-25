import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getImageGenProvider, type Style } from "@/lib/image-gen";

export const runtime = "nodejs";
export const maxDuration = 60;

const VALID_STYLES: Style[] = ["anime", "watercolor", "oil", "pixel"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const photoId: string | undefined = body.photoId;
    const style: string | undefined = body.style;
    const customPrompt: string | undefined = body.customPrompt;

    if (!photoId) {
      return NextResponse.json({ error: "photoId is required" }, { status: 400 });
    }
    if (!style || !VALID_STYLES.includes(style as Style)) {
      return NextResponse.json(
        { error: `style must be one of: ${VALID_STYLES.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }

    const { data: photo, error: photoErr } = await supabase
      .from("photos")
      .select("id, album_id, storage_path")
      .eq("id", photoId)
      .maybeSingle();

    if (photoErr || !photo) {
      return NextResponse.json({ error: "写真が見つかりません" }, { status: 404 });
    }

    const { data: blob, error: dlErr } = await supabase.storage
      .from("originals")
      .download(photo.storage_path);

    if (dlErr || !blob) {
      return NextResponse.json(
        { error: "元画像のダウンロードに失敗" },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await blob.arrayBuffer());
    const base64 = buffer.toString("base64");

    const editId = crypto.randomUUID();
    await supabase.from("edits").insert({
      id: editId,
      photo_id: photoId,
      style,
      custom_prompt: customPrompt ?? null,
      status: "processing",
      provider: "gemini",
    });

    try {
      const provider = getImageGenProvider();
      const result = await provider.transform({
        imageBase64: base64,
        style: style as Style,
        customPrompt,
      });

      const resultPath = `${user.id}/${photo.album_id}/${editId}.png`;
      const resultBuffer = Buffer.from(result.imageBase64, "base64");

      const { error: upErr } = await supabase.storage
        .from("edits")
        .upload(resultPath, resultBuffer, {
          contentType: "image/png",
          upsert: false,
        });
      if (upErr) throw upErr;

      await supabase
        .from("edits")
        .update({
          status: "completed",
          result_storage_path: resultPath,
          completed_at: new Date().toISOString(),
        })
        .eq("id", editId);

      return NextResponse.json({ editId, status: "completed" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      await supabase
        .from("edits")
        .update({ status: "failed", error: msg })
        .eq("id", editId);
      return NextResponse.json({ error: msg, editId }, { status: 500 });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    console.error("[/api/transform-photo] failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
