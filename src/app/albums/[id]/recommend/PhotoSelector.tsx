"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { PhotoWithUrl } from "@/lib/supabase/queries";

export function PhotoSelector({
  albumId,
  initialPhotos,
}: {
  albumId: string;
  initialPhotos: PhotoWithUrl[];
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const includedCount = photos.filter(
    (p) => p.user_decision !== "exclude"
  ).length;

  async function toggle(photoId: string) {
    const current = photos.find((p) => p.id === photoId);
    if (!current) return;
    const next = current.user_decision === "exclude" ? "include" : "exclude";

    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, user_decision: next } : p))
    );

    const supabase = createClient();
    const { error } = await supabase
      .from("photos")
      .update({ user_decision: next })
      .eq("id", photoId);
    if (error) {
      console.error(error);
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId ? { ...p, user_decision: current.user_decision } : p
        )
      );
    }
  }

  function proceed() {
    startTransition(() => {
      router.push(`/albums/${albumId}/style`);
    });
  }

  return (
    <>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-sm text-stone-600">
          全 {photos.length}枚 / 採用 {includedCount}枚
        </p>
        <p className="text-xs text-stone-500">クリックで採用/除外を切替</p>
      </div>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {photos.map((p) => {
          const excluded = p.user_decision === "exclude";
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="relative block aspect-square w-full overflow-hidden rounded-lg border-2 transition"
                style={{
                  borderColor: excluded ? "#d6d3d1" : "#f97316",
                  opacity: excluded ? 0.4 : 1,
                }}
              >
                <img
                  src={p.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                {!excluded && (
                  <span className="absolute right-1 top-1 rounded-full bg-orange-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    ✓
                  </span>
                )}
                {excluded && (
                  <span className="absolute right-1 top-1 rounded-full bg-stone-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    ─
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex justify-end">
        <button
          onClick={proceed}
          disabled={includedCount === 0 || pending}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
        >
          この {includedCount}枚で進む →
        </button>
      </div>
    </>
  );
}
