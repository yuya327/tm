"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isCurrentUserAdmin, updateProduct } from "@/lib/supabase/queries";

export async function updateProductAction(formData: FormData) {
  if (!(await isCurrentUserAdmin())) {
    throw new Error("管理者権限が必要です");
  }

  const id = formData.get("id") as string;
  const displayName = (formData.get("display_name") as string)?.trim();
  const sellPriceRaw = formData.get("sell_price_jpy") as string;
  const enabled = formData.get("enabled") === "on";
  const sortOrderRaw = formData.get("sort_order") as string;

  const sellPrice = Number.parseInt(sellPriceRaw, 10);
  const sortOrder = Number.parseInt(sortOrderRaw, 10);

  if (!id || !displayName) throw new Error("必須項目が未入力です");
  if (Number.isNaN(sellPrice) || sellPrice <= 0) {
    throw new Error("販売価格は正の整数で入力してください");
  }
  if (Number.isNaN(sortOrder)) throw new Error("並び順は整数で入力してください");

  await updateProduct(id, {
    display_name: displayName,
    sell_price_jpy: sellPrice,
    enabled,
    sort_order: sortOrder,
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
