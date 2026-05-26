"use server";

import { redirect } from "next/navigation";
import {
  calcSuzuriMargin,
  createPrintOrder,
  downloadEditAsDataUri,
  getProduct,
  listOrderItemsForFulfillment,
  markOrderCreated,
  saveOrderItemProductUrl,
} from "@/lib/supabase/queries";
import { getPrintProvider } from "@/lib/print-providers";

export async function createOrderAction(formData: FormData) {
  const albumId = formData.get("albumId") as string;
  const productCatalogId = formData.get("productCatalogId") as string;
  const itemsJson = formData.get("items") as string;
  const items = JSON.parse(itemsJson) as { edit_id: string; quantity: number }[];

  if (!productCatalogId) throw new Error("商品が選択されていません");
  const product = await getProduct(productCatalogId);
  if (!product || !product.enabled) {
    throw new Error("選択した商品が無効です");
  }

  const filtered = items.filter((i) => i.quantity > 0);
  if (filtered.length === 0) {
    throw new Error("注文数量を1枚以上にしてください");
  }

  const totalQty = filtered.reduce((s, i) => s + i.quantity, 0);
  const totalJpy = totalQty * product.sell_price_jpy;

  const order = await createPrintOrder({
    items: filtered.map((i) => ({
      edit_id: i.edit_id,
      quantity: i.quantity,
      product_catalog_id: product.id,
    })),
    totalJpy,
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
      if (!it.catalog) {
        throw new Error(`order item ${it.id} に商品カタログが紐付いていません`);
      }
      const imageDataUri = await downloadEditAsDataUri(it.result_storage_path);
      const marginJpy = calcSuzuriMargin(
        it.catalog.sell_price_jpy,
        it.catalog.base_price_jpy
      );
      return {
        itemId: it.id,
        imageDataUri,
        title: `${it.catalog.display_name} (${it.edit_id.slice(0, 8)})`,
        suzuriItemId: it.catalog.suzuri_item_id,
        suzuriVariantId: it.catalog.suzuri_variant_id,
        marginJpy,
        quantity: it.quantity,
      };
    })
  );

  const result = await provider.createOrder({
    userId: "",
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
