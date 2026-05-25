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
