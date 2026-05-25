"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STYLE_LABELS, type Style } from "@/lib/image-gen/interface";

const STYLES = Object.entries(STYLE_LABELS) as [Style, string][];

type Photo = { id: string; url: string };
type ProgressItem = {
  photoId: string;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
};

export function StyleForm({
  albumId,
  photos,
}: {
  albumId: string;
  photos: Photo[];
}) {
  const [style, setStyle] = useState<Style>("anime");
  const [customPrompt, setCustomPrompt] = useState("");
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const total = progress.length;
  const done = progress.filter((p) => p.status === "completed").length;
  const failed = progress.filter((p) => p.status === "failed").length;

  async function transformOne(photoId: string) {
    setProgress((prev) =>
      prev.map((p) => (p.photoId === photoId ? { ...p, status: "processing" } : p))
    );

    try {
      const res = await fetch("/api/transform-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, style, customPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);

      setProgress((prev) =>
        prev.map((p) =>
          p.photoId === photoId ? { ...p, status: "completed" } : p
        )
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      setProgress((prev) =>
        prev.map((p) =>
          p.photoId === photoId ? { ...p, status: "failed", error: msg } : p
        )
      );
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setProgress(photos.map((p) => ({ photoId: p.id, status: "pending" })));

    // 並列実行 (Geminiのレート制限と Vercel の接続数を考慮し最大3並列)
    const concurrency = 3;
    const queue = [...photos];
    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (next) await transformOne(next.id);
      }
    });
    await Promise.all(workers);

    setBusy(false);
    setTimeout(() => router.push(`/albums/${albumId}/result`), 800);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-base font-semibold">どのスタイルに加工しますか？</h2>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {STYLES.map(([key, label]) => (
          <li key={key}>
            <label className="block cursor-pointer">
              <input
                type="radio"
                name="style"
                checked={style === key}
                onChange={() => setStyle(key)}
                disabled={busy}
                className="peer sr-only"
              />
              <div className="rounded-xl border-2 border-stone-200 bg-white p-3 text-center peer-checked:border-orange-500 peer-checked:ring-2 peer-checked:ring-orange-200">
                <p className="text-sm font-medium">{label}</p>
              </div>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <label className="block text-sm font-medium">
          追加の要望（自由記述・任意）
        </label>
        <textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          disabled={busy}
          rows={3}
          placeholder="例) 表情をもっと明るく、肌をきれいに"
          className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {busy && (
        <div className="mt-6">
          <div className="h-2 w-full overflow-hidden rounded-full bg-stone-100">
            <div
              className="h-full rounded-full bg-orange-500 transition-all"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-stone-600">
            加工中… {done} / {total}（失敗 {failed}）
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-stone-500">
          対象: {photos.length}枚 × 1スタイル
        </p>
        <button
          type="submit"
          disabled={busy || photos.length === 0}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {busy ? "加工中…" : "加工を開始 →"}
        </button>
      </div>
    </form>
  );
}
