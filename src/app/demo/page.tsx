"use client";

import { useState } from "react";
import { Container } from "@/components/Container";
import { STYLE_LABELS, type Style } from "@/lib/image-gen/interface";

const STYLES = Object.entries(STYLE_LABELS) as [Style, string][];

export default function DemoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [style, setStyle] = useState<Style>("anime");
  const [customPrompt, setCustomPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResultUrl(null);
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);

    const form = new FormData();
    form.append("image", file);
    form.append("style", style);
    form.append("customPrompt", customPrompt);

    try {
      const res = await fetch("/api/transform", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      setResultUrl(`data:image/png;base64,${data.imageBase64}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <h1 className="text-2xl font-bold">画像加工デモ</h1>
      <p className="mt-1 text-sm text-stone-600">
        1枚の写真をアップロード → スタイルを選んで加工。本番フローへの組み込み前の動作確認用。
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold">1. 画像を選択</h2>
          <label className="mt-3 flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 hover:border-orange-400">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" className="h-full w-full object-contain" />
            ) : (
              <div className="text-center text-sm text-stone-500">
                <p className="text-3xl">⬆</p>
                <p className="mt-2">クリックで画像を選択</p>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <h2 className="mt-6 text-base font-semibold">2. スタイル</h2>
          <ul className="mt-3 grid grid-cols-4 gap-2">
            {STYLES.map(([key, label]) => (
              <li key={key}>
                <label className="block cursor-pointer">
                  <input
                    type="radio"
                    name="style"
                    checked={style === key}
                    onChange={() => setStyle(key)}
                    className="peer sr-only"
                  />
                  <div className="rounded-lg border-2 border-stone-200 p-2 text-center text-xs peer-checked:border-orange-500 peer-checked:bg-orange-50">
                    {label}
                  </div>
                </label>
              </li>
            ))}
          </ul>

          <h2 className="mt-6 text-base font-semibold">3. 追加要望（任意）</h2>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={2}
            placeholder="例) 表情を明るく、肌をきれいに"
            className="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
          />

          <button
            type="submit"
            disabled={!file || loading}
            className="mt-6 w-full rounded-lg bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {loading ? "加工中…（最大60秒）" : "加工を開始"}
          </button>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-base font-semibold">結果</h2>
          <div className="mt-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
            {loading && (
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" />
                <p className="mt-3 text-sm text-stone-500">Gemini が加工中…</p>
              </div>
            )}
            {!loading && resultUrl && (
              <img src={resultUrl} alt="result" className="h-full w-full object-contain" />
            )}
            {!loading && !resultUrl && !error && (
              <p className="text-sm text-stone-400">ここに加工後の画像が表示されます</p>
            )}
            {error && (
              <div className="px-4 text-center text-sm text-red-600">
                <p className="font-medium">エラー</p>
                <p className="mt-1 break-all">{error}</p>
              </div>
            )}
          </div>

          {resultUrl && (
            <a
              href={resultUrl}
              download="transformed.png"
              className="mt-4 inline-block rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm hover:bg-stone-50"
            >
              ⬇ ダウンロード
            </a>
          )}
        </section>
      </form>
    </Container>
  );
}
