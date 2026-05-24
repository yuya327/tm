-- ============================================================================
-- Travel Album Art: Storage バケットとアクセスポリシー
--
-- バケット2つ:
--   originals: アップロードされた元画像 (非公開, 10MB上限)
--   edits    : AI加工後の画像 (非公開, 10MB上限)
--
-- 各ファイルは「ユーザーUUID/...」というパスで保存し、RLSで他人を弾く。
-- ============================================================================

-- バケット作成
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('originals', 'originals', false, 10485760,
    array['image/jpeg','image/png','image/webp','image/heic','image/heif']),
  ('edits', 'edits', false, 10485760,
    array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- ============================================================================
-- RLS ポリシー
-- パス先頭が auth.uid() と一致するファイルのみ読み書き可能
-- 例: "abc123-uuid/album-xxx/photo-yyy.jpg"
-- ============================================================================

-- originals: 自分のファイルのみ
create policy "originals_select_own" on storage.objects for select using (
  bucket_id = 'originals' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "originals_insert_own" on storage.objects for insert with check (
  bucket_id = 'originals' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "originals_delete_own" on storage.objects for delete using (
  bucket_id = 'originals' and (storage.foldername(name))[1] = auth.uid()::text
);

-- edits: 自分のファイルのみ
create policy "edits_select_own" on storage.objects for select using (
  bucket_id = 'edits' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "edits_insert_own" on storage.objects for insert with check (
  bucket_id = 'edits' and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "edits_delete_own" on storage.objects for delete using (
  bucket_id = 'edits' and (storage.foldername(name))[1] = auth.uid()::text
);
