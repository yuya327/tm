"use server";

import { redirect } from "next/navigation";
import {
  createPrintOrder,
  downloadEditAsDataUri,
  listOrderItemsForFulfillment,
  markOrderCreated,
  saveOrderItemProductUrl,
} from "@/lib/supabase/queries";
import { getPrintProvider } from "@/lib/print-providers";
import { calcTotal, getSize, type SizeKey } from "./pricing";

export async function createOrderAction(formData: FormData) {
  const albumId = formData.get("albumId") as string;
  const sizeKey = formData.get("size") as SizeKey;
  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson) as { edit_id: string; quantity: number }[];

  const filtered = items.filter((i) => i.quantity > 0);
  if (filtered.length === 0) {
    throw new Error("注文数量を1枚以上にしてください");
  }

  const { total } = calcTotal(
    sizeKey,
    filtered.map((i) => i.quantity)
  );
  const size = getSize(sizeKey);

  const order = await createPrintOrder({
    sizeCmWidth: size.widthCm,
    sizeCmHeight: size.heightCm,
    items: filtered,
    totalJpy: total,
  });

  redirect(`/albums/${albumId}/order/confirm?orderId=${order.id}`);
}

export async function handoffToSuzuriAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const albumId = formData.get("albumId") as string;
  if (!orderId) throw new Error("orderId が必要です");

  const orderItems = await listOrderItemsForFulfillment(orderId);
  if (orderItems.length === 0) {
    throw new Error("注文アイテムがありません");
  }

  const provider = getPrintProvider();

  const printItems = await Promise.all(
    orderItems.map(async (it) => {
      const imageDataUri = await downloadEditAsDataUri(it.result_storage_path);
      return {
        itemId: it.id,
        imageDataUri,
        title: `Travel Sticker (${it.edit_id.slice(0, 8)})`,
        size: { widthCm: 5, heightCm: 5 }, // SUZURI は M 1種類のため記録用
        quantity: it.quantity,
      };
    })
  );

  const result = await provider.createOrder({
    userId: "", // SUZURI 単一アカウント運用なので未使用
    items: printItems,
  });

  await Promise.all(
    result.items.map((r) =>
      saveOrderItemProductUrl(r.itemId, r.providerItemId, r.productUrl)
    )
  );

  await markOrderCreated(orderId, result.checkoutUrl);

  redirect(`/albums/${albumId}/order/done?orderId=${orderId}`);
}
