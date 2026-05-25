"use server";

import { redirect } from "next/navigation";
import {
  createPrintOrder,
  markOrderCreated,
} from "@/lib/supabase/queries";
import { calcTotal, getSize, type SizeKey } from "./pricing";

const SUZURI_HANDOFF_URL = "https://suzuri.jp/";

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
  await markOrderCreated(orderId, SUZURI_HANDOFF_URL);
  redirect(SUZURI_HANDOFF_URL);
}
