-- =====================================================================
-- 0004_storage.sql — Storage buckets + policies
-- =====================================================================
-- Buckets: avatars, banners, thumbnails (public read); videos (public read,
-- but you can flip `public` to false and serve via signed URLs instead).
-- Convention: objects are stored under `<auth.uid()>/<filename>` so a user
-- can only write within their own folder.

insert into storage.buckets (id, name, public)
values
  ('avatars',    'avatars',    true),
  ('banners',    'banners',    true),
  ('thumbnails', 'thumbnails', true),
  ('videos',     'videos',     true)
on conflict (id) do nothing;

-- Public read for all four media buckets.
create policy "public read media"
  on storage.objects for select
  using (bucket_id in ('avatars','banners','thumbnails','videos'));

-- Authenticated users may write/update/delete only inside their own folder.
create policy "users upload to own folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars','banners','thumbnails','videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update own objects"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars','banners','thumbnails','videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete own objects"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars','banners','thumbnails','videos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
