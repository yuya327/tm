import { createClient } from "./server";

export type Album = {
  id: string;
  name: string;
  created_at: string;
};

export type AlbumWithCounts = Album & {
  photo_count: number;
  edit_count: number;
};

export async function listAlbums(): Promise<AlbumWithCounts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("albums")
    .select("id, name, created_at, photos(count), edits:photos(edits(count))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((a) => ({
    id: a.id,
    name: a.name,
    created_at: a.created_at,
    photo_count: a.photos?.[0]?.count ?? 0,
    edit_count: 0,
  }));
}

export async function getAlbum(id: string): Promise<Album | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("albums")
    .select("id, name, created_at")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type Photo = {
  id: string;
  storage_path: string;
  mime_type: string;
  is_recommended: boolean;
  user_decision: "include" | "exclude" | null;
  created_at: string;
};

export type PhotoWithUrl = Photo & { url: string };

export async function listPhotos(albumId: string): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, storage_path, mime_type, is_recommended, user_decision, created_at")
    .eq("album_id", albumId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const paths = data.map((p) => p.storage_path);
  const { data: signed, error: signErr } = await supabase.storage
    .from("originals")
    .createSignedUrls(paths, 60 * 60);
  if (signErr) throw signErr;

  const urlMap = new Map<string, string>();
  signed?.forEach((s, i) => {
    if (s.signedUrl) urlMap.set(paths[i], s.signedUrl);
  });

  return data.map((p) => ({
    ...p,
    url: urlMap.get(p.storage_path) ?? "",
  }));
}

export async function listSelectedPhotos(
  albumId: string
): Promise<PhotoWithUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("photos")
    .select("id, storage_path, mime_type, is_recommended, user_decision, created_at")
    .eq("album_id", albumId)
    .or("user_decision.is.null,user_decision.eq.include")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const paths = data.map((p) => p.storage_path);
  const { data: signed } = await supabase.storage
    .from("originals")
    .createSignedUrls(paths, 60 * 60);

  const urlMap = new Map<string, string>();
  signed?.forEach((s, i) => {
    if (s.signedUrl) urlMap.set(paths[i], s.signedUrl);
  });

  return data.map((p) => ({ ...p, url: urlMap.get(p.storage_path) ?? "" }));
}

export type EditWithUrls = {
  id: string;
  photo_id: string;
  style: string;
  status: string;
  before_url: string;
  after_url: string;
  created_at: string;
};

export async function listEdits(albumId: string): Promise<EditWithUrls[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("edits")
    .select(
      "id, photo_id, style, status, result_storage_path, created_at, photos!inner(album_id, storage_path)"
    )
    .eq("photos.album_id", albumId)
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!data || data.length === 0) return [];

  const editRows = data as unknown as Array<{
    id: string;
    photo_id: string;
    style: string;
    status: string;
    result_storage_path: string;
    created_at: string;
    photos: { storage_path: string };
  }>;

  const originalPaths = editRows.map((e) => e.photos.storage_path);
  const editPaths = editRows.map((e) => e.result_storage_path);

  const [{ data: originalSigned }, { data: editSigned }] = await Promise.all([
    supabase.storage.from("originals").createSignedUrls(originalPaths, 60 * 60),
    supabase.storage.from("edits").createSignedUrls(editPaths, 60 * 60),
  ]);

  return editRows.map((e, i) => ({
    id: e.id,
    photo_id: e.photo_id,
    style: e.style,
    status: e.status,
    before_url: originalSigned?.[i]?.signedUrl ?? "",
    after_url: editSigned?.[i]?.signedUrl ?? "",
    created_at: e.created_at,
  }));
}

// ============================================================================
// Admin
// ============================================================================

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return false;
  return data !== null;
}

// ============================================================================
// Product Catalog
// ============================================================================

export type ProductCatalogRow = {
  id: string;
  suzuri_item_id: number;
  suzuri_variant_id: number;
  name: string;
  display_name: string;
  base_price_jpy: number;
  sell_price_jpy: number;
  enabled: boolean;
  sort_order: number;
};

export async function listEnabledProducts(): Promise<ProductCatalogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_catalog")
    .select("id, suzuri_item_id, suzuri_variant_id, name, display_name, base_price_jpy, sell_price_jpy, enabled, sort_order")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function listAllProducts(): Promise<ProductCatalogRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_catalog")
    .select("id, suzuri_item_id, suzuri_variant_id, name, display_name, base_price_jpy, sell_price_jpy, enabled, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getProduct(id: string): Promise<ProductCatalogRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_catalog")
    .select("id, suzuri_item_id, suzuri_variant_id, name, display_name, base_price_jpy, sell_price_jpy, enabled, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type ProductCatalogUpdate = {
  display_name?: string;
  sell_price_jpy?: number;
  enabled?: boolean;
  sort_order?: number;
};

export async function updateProduct(
  id: string,
  patch: ProductCatalogUpdate
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("product_catalog")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

// 販売価格(税込) から SUZURI に渡すマージン(税抜) を逆算する。
// SUZURI 側の挙動: (base_price + margin) * 1.10 = 税込売価 (推定。要実測)
export function calcSuzuriMargin(
  sellPriceJpyTaxIn: number,
  basePriceJpyTaxOut: number
): number {
  const totalTaxOut = Math.round(sellPriceJpyTaxIn / 1.1);
  return Math.max(0, totalTaxOut - basePriceJpyTaxOut);
}

export async function createAlbum(name: string): Promise<Album> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");

  const { data, error } = await supabase
    .from("albums")
    .insert({ name, user_id: user.id })
    .select("id, name, created_at")
    .single();

  if (error) throw error;
  return data;
}

// ============================================================================
// Print orders
// ============================================================================

export type PrintOrder = {
  id: string;
  size_cm_width: number;
  size_cm_height: number;
  total_quantity: number;
  total_jpy: number;
  status: string;
  provider: string;
  provider_checkout_url: string | null;
  created_at: string;
};

export type PrintOrderItem = {
  edit_id: string;
  quantity: number;
  product_catalog_id: string;
};

export type PrintOrderInput = {
  items: PrintOrderItem[];
  totalJpy: number;
};

export async function createPrintOrder(
  input: PrintOrderInput
): Promise<PrintOrder> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("認証が必要です");

  const totalQuantity = input.items.reduce((sum, i) => sum + i.quantity, 0);

  // size_cm_width/height は SUZURI 連携前のレガシー列。商品カタログ移行後は形式上 0 を入れる。
  const { data: order, error: orderErr } = await supabase
    .from("print_orders")
    .insert({
      user_id: user.id,
      size_cm_width: 0,
      size_cm_height: 0,
      total_quantity: totalQuantity,
      total_jpy: input.totalJpy,
      provider: "suzuri",
      status: "pending",
    })
    .select("id, size_cm_width, size_cm_height, total_quantity, total_jpy, status, provider, provider_checkout_url, created_at")
    .single();

  if (orderErr) throw orderErr;

  const itemRows = input.items.map((i) => ({
    order_id: order.id,
    edit_id: i.edit_id,
    quantity: i.quantity,
    product_catalog_id: i.product_catalog_id,
  }));
  const { error: itemsErr } = await supabase
    .from("print_order_items")
    .insert(itemRows);
  if (itemsErr) throw itemsErr;

  return order;
}

export async function getOrder(id: string): Promise<PrintOrder | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("print_orders")
    .select("id, size_cm_width, size_cm_height, total_quantity, total_jpy, status, provider, provider_checkout_url, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function markOrderCreated(
  id: string,
  providerUrl: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("print_orders")
    .update({ status: "created", provider_checkout_url: providerUrl })
    .eq("id", id);
  if (error) throw error;
}

export type OrderItemForFulfillment = {
  id: string;
  edit_id: string;
  quantity: number;
  result_storage_path: string;
  mime_type: string;
  catalog: {
    suzuri_item_id: number;
    suzuri_variant_id: number;
    display_name: string;
    base_price_jpy: number;
    sell_price_jpy: number;
  } | null;
};

export async function listOrderItemsForFulfillment(
  orderId: string
): Promise<OrderItemForFulfillment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("print_order_items")
    .select(
      "id, edit_id, quantity, edits!inner(result_storage_path, photos!inner(mime_type)), product_catalog(suzuri_item_id, suzuri_variant_id, display_name, base_price_jpy, sell_price_jpy)"
    )
    .eq("order_id", orderId);

  if (error) throw error;
  if (!data) return [];

  return (data as unknown as Array<{
    id: string;
    edit_id: string;
    quantity: number;
    edits: {
      result_storage_path: string;
      photos: { mime_type: string };
    };
    product_catalog: {
      suzuri_item_id: number;
      suzuri_variant_id: number;
      display_name: string;
      base_price_jpy: number;
      sell_price_jpy: number;
    } | null;
  }>).map((r) => ({
    id: r.id,
    edit_id: r.edit_id,
    quantity: r.quantity,
    result_storage_path: r.edits.result_storage_path,
    mime_type: r.edits.photos.mime_type,
    catalog: r.product_catalog,
  }));
}

export async function downloadEditAsDataUri(
  storagePath: string
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("edits")
    .download(storagePath);
  if (error) throw error;

  const buf = Buffer.from(await data.arrayBuffer());
  // edits バケットには PNG / JPEG が入っている前提（変換後の画像）
  const mime = data.type || "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function saveOrderItemProductUrl(
  itemId: string,
  providerItemId: string,
  productUrl: string
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("print_order_items")
    .update({ provider_item_id: providerItemId, product_url: productUrl })
    .eq("id", itemId);
  if (error) throw error;
}

export type OrderItemWithProductUrl = {
  id: string;
  edit_id: string;
  quantity: number;
  provider_item_id: string | null;
  product_url: string | null;
  after_url: string;
};

export async function listOrderItemsWithProductUrl(
  orderId: string
): Promise<OrderItemWithProductUrl[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("print_order_items")
    .select("id, edit_id, quantity, provider_item_id, product_url, edits!inner(result_storage_path)")
    .eq("order_id", orderId);

  if (error) throw error;
  if (!data) return [];

  const rows = data as unknown as Array<{
    id: string;
    edit_id: string;
    quantity: number;
    provider_item_id: string | null;
    product_url: string | null;
    edits: { result_storage_path: string };
  }>;

  const paths = rows.map((r) => r.edits.result_storage_path);
  const { data: signed } = await supabase.storage
    .from("edits")
    .createSignedUrls(paths, 60 * 60);

  return rows.map((r, i) => ({
    id: r.id,
    edit_id: r.edit_id,
    quantity: r.quantity,
    provider_item_id: r.provider_item_id,
    product_url: r.product_url,
    after_url: signed?.[i]?.signedUrl ?? "",
  }));
}

export type OrderWithAlbum = PrintOrder & {
  album_name: string | null;
};

export async function listOrders(): Promise<OrderWithAlbum[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("print_orders")
    .select("id, size_cm_width, size_cm_height, total_quantity, total_jpy, status, provider, provider_checkout_url, created_at, print_order_items(edit_id, quantity, edits(photos(albums(name))))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((o) => {
    const items = (o as { print_order_items?: Array<{ edits?: { photos?: { albums?: { name: string } | null } | null } | null }> })
      .print_order_items ?? [];
    const firstAlbumName =
      items[0]?.edits?.photos?.albums?.name ?? null;
    return {
      id: o.id,
      size_cm_width: o.size_cm_width,
      size_cm_height: o.size_cm_height,
      total_quantity: o.total_quantity,
      total_jpy: o.total_jpy,
      status: o.status,
      provider: o.provider,
      provider_checkout_url: o.provider_checkout_url,
      created_at: o.created_at,
      album_name: firstAlbumName,
    };
  });
}
