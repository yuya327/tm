"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAlbum } from "@/lib/supabase/queries";

export async function createAlbumAction(formData: FormData) {
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) {
    throw new Error("アルバム名を入力してください");
  }
  const album = await createAlbum(name);
  revalidatePath("/albums");
  redirect(`/albums/${album.id}/upload`);
}
