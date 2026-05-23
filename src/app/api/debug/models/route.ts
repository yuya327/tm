import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    const data = await res.json();
    const models = (data.models ?? []).map((m: {
      name: string;
      supportedGenerationMethods?: string[];
    }) => ({
      name: m.name,
      methods: m.supportedGenerationMethods,
    }));
    const imageCapable = models.filter((m: { name: string }) =>
      m.name.toLowerCase().includes("image")
    );
    return NextResponse.json({ imageCapable, total: models.length, all: models });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
