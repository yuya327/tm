"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STYLE_LABELS, type Style } from "@/lib/image-gen/interface";

const STYLES = Object.entries(STYLE_LABELS) as [Style, string][];

type Photo = { id: string; url: string };

type PhotoConfig = {
  photoId: string;
  url: string;
  style: Style;
  customPrompt: string;
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
  const [configs, setConfigs] = useState<PhotoConfig[]>(
    photos.map((p) => ({
      photoId: p.id,
      url: p.url,
      style: "anime",
      customPrompt: "",
      status: "pending",
    }))
  );
  const [bulkStyle, setBulkStyle] = useState<Style>("anime");
  const [bulkPrompt, setBulkPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const total = configs.length;
  const done = configs.filter((c) => c.status === "completed").length;
  const failed = configs.filter((c) => c.status === "failed").length;

  function updateConfig(photoId: string, patch: Partial<PhotoConfig>) {
    setConfigs((prev) =>
      prev.map((c) => (c.photoId === photoId ? { ...c, ...patch } : c))
    );
  }

  function applyToAll() {
    setConfigs((prev) =>
      prev.map((c) => ({ ...c, style: bulkStyle, customPrompt: bulkPrompt }))
    );
  }

  async function transformOne(config: PhotoConfig) {
    updateConfig(config.photoId, { status: "processing", error: undefined });

    try {
      const res = await fetch("/api/transform-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: config.photoId,
          style: config.style,
          customPrompt: config.customPrompt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      updateConfig(config.photoId, { status: "completed" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      updateConfig(config.photoId, { status: "failed", error: msg });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);

    // 並列実行（最大3並列）
    const concurrency = 3;
    const queue = [...configs];
    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (next) await transformOne(next);
      }
    });
    await Promise.all(workers);

    setBusy(false);
    setTimeout(() => router.push(`/albums/${albumId}/result`), 800);
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* 一括適用パネル */}
      <section className="rounded-xl border border-stone-200 bg-stone-50 p-4">
        <p className="text-sm font-medium">一括適用（同じ設定をすべてに）</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex gap-1">
            {STYLES.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setBulkStyle(key)}
                disabled={busy}
                className={`rounded-full px-3 py-1 text-xs ${
                  bulkStyle === key
                    ? "bg-stone-900 text-white"
                    : "border border-stone-300 bg-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={bulkPrompt}
            onChange={(e) => setBulkPrompt(e.target.value)}
            disabled={busy}
            placeholder="一括の追加要望（任意）"
            className="flex-1 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-orange-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={applyToAll}
            disabled={busy}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs hover:bg-stone-100"
          >
            全部に適用
          </button>
        </div>
      </section>

      {/* 個別設定リスト */}
      <ul className="mt-6 space-y-3">
        {configs.map((c) => (
          <li
            key={c.photoId}
            className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:flex-row sm:items-center"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              <img
                src={c.url}
                alt=""
                className="h-full w-full object-cover"
              />
              {c.status === "completed" && (
                <span className="absolute right-1 top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  ✓
                </span>
              )}
              {c.status === "processing" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
              {c.status === "failed" && (
                <span className="absolute inset-0 flex items-center justify-center bg-red-500/80 text-xs text-white">
                  ✗
                </span>
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap gap-1">
                {STYLES.map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateConfig(c.photoId, { style: key })}
                    disabled={busy}
                    className={`rounded-full px-3 py-1 text-xs ${
                      c.style === key
                        ? "bg-orange-500 text-white"
                        : "border border-stone-300 bg-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={c.customPrompt}
                onChange={(e) =>
                  updateConfig(c.photoId, { customPrompt: e.target.value })
                }
                disabled={busy}
                placeholder="個別の追加要望（任意・例: 表情を明るく）"
                className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs focus:border-orange-500 focus:outline-none"
              />
              {c.error && (
                <p className="mt-1 text-xs text-red-600">エラー: {c.error}</p>
              )}
            </div>
          </li>
        ))}
      </ul>

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
        <p className="text-xs text-stone-500">対象: {photos.length}枚（個別設定可）</p>
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
