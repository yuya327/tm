"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UploadStatus = "pending" | "uploading" | "done" | "error";
type FileItem = {
  file: File;
  status: UploadStatus;
  error?: string;
};

export function UploadForm({ albumId }: { albumId: string }) {
  const [items, setItems] = useState<FileItem[]>([]);
  const [consent, setConsent] = useState({ subject: false, ai: false });
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const router = useRouter();

  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const canSubmit = total > 0 && consent.subject && consent.ai && !busy;

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setItems((prev) => [
      ...prev,
      ...files.slice(0, 100 - prev.length).map((file) => ({
        file,
        status: "pending" as UploadStatus,
      })),
    ]);
  }

  function removeItem(index: number) {
    if (busy) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    setBusy(true);
    setGlobalError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setGlobalError("認証セッションが切れました。再ログインしてください。");
      setBusy(false);
      return;
    }

    let hasError = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "done") continue;

      setItems((prev) =>
        prev.map((it, idx) =>
          idx === i ? { ...it, status: "uploading", error: undefined } : it
        )
      );

      try {
        const ext = item.file.name.split(".").pop()?.toLowerCase() ?? "jpg";
        const photoId = crypto.randomUUID();
        const storagePath = `${user.id}/${albumId}/${photoId}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("originals")
          .upload(storagePath, item.file, {
            contentType: item.file.type || "image/jpeg",
            upsert: false,
          });
        if (upErr) throw upErr;

        const { error: dbErr } = await supabase.from("photos").insert({
          id: photoId,
          album_id: albumId,
          storage_path: storagePath,
          mime_type: item.file.type || "image/jpeg",
          size_bytes: item.file.size,
        });
        if (dbErr) throw dbErr;

        setItems((prev) =>
          prev.map((it, idx) => (idx === i ? { ...it, status: "done" } : it))
        );
      } catch (err) {
        hasError = true;
        const msg = err instanceof Error ? err.message : "unknown";
        setItems((prev) =>
          prev.map((it, idx) =>
            idx === i ? { ...it, status: "error", error: msg } : it
          )
        );
      }
    }

    setBusy(false);
    if (!hasError) {
      router.push(`/albums/${albumId}/recommend`);
    }
  }

  return (
    <>
      <label className="mt-6 flex aspect-[3/1] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 text-stone-500 hover:border-orange-400 hover:bg-orange-50">
        <span className="text-3xl">⬆</span>
        <p className="mt-2 text-sm font-medium">
          ここにドラッグ&ドロップ または クリックで選択
        </p>
        <p className="text-xs">最大100枚 / JPEG/PNG/WEBP/HEIC</p>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={handleFiles}
          className="hidden"
          disabled={busy}
        />
      </label>

      {items.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-stone-600">選択中: {items.length}枚</p>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {items.map((item, i) => (
              <li
                key={i}
                className="relative aspect-square overflow-hidden rounded border border-stone-200 bg-stone-100"
              >
                <img
                  src={URL.createObjectURL(item.file)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {item.status === "uploading" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  </div>
                )}
                {item.status === "done" && (
                  <span className="absolute right-1 top-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
                {item.status === "error" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-red-500/80 text-xs text-white">
                    ✗
                  </span>
                )}
                {!busy && item.status !== "done" && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white hover:bg-black/80"
                  >
                    ×
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 space-y-2 text-sm">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={consent.subject}
            onChange={(e) => setConsent({ ...consent, subject: e.target.checked })}
            disabled={busy}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-orange-600"
          />
          <span>被写体本人または保護者の同意を得ています</span>
        </label>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={consent.ai}
            onChange={(e) => setConsent({ ...consent, ai: e.target.checked })}
            disabled={busy}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-orange-600"
          />
          <span>顔画像を AI 解析に使うことに同意します</span>
        </label>
      </div>

      {globalError && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {globalError}
        </p>
      )}

      {busy && (
        <p className="mt-4 text-sm text-stone-600">
          アップロード中… {done}/{total}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleUpload}
          disabled={!canSubmit}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          {busy ? "アップロード中…" : "アップロード開始 →"}
        </button>
      </div>
    </>
  );
}
