-- =====================================================================
-- 0003_rls.sql — Row Level Security policies
-- =====================================================================

alter table public.profiles        enable row level security;
alter table public.videos          enable row level security;
alter table public.video_views     enable row level security;
alter table public.video_likes     enable row level security;
alter table public.subscriptions   enable row level security;
alter table public.comments        enable row level security;
alter table public.comment_replies enable row level security;
alter table public.watch_history   enable row level security;
alter table public.playlists       enable row level security;
alter table public.playlist_videos enable row level security;
alter table public.notifications   enable row level security;
alter table public.tags            enable row level security;
alter table public.video_tags      enable row level security;

-- Helper: is the current user an admin? --------------------------------
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- profiles --------------------------------------------------------------
create policy "profiles are public" on public.profiles
  for select using (true);
create policy "users update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- videos ----------------------------------------------------------------
create policy "public videos are viewable" on public.videos
  for select using (
    (visibility in ('public','unlisted') and not is_removed)
    or user_id = auth.uid()
    or public.is_admin()
  );
create policy "owners insert videos" on public.videos
  for insert with check (auth.uid() = user_id);
create policy "owners update videos" on public.videos
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
create policy "owners delete videos" on public.videos
  for delete using (auth.uid() = user_id or public.is_admin());

-- video_views -----------------------------------------------------------
create policy "anyone can record a view" on public.video_views
  for insert with check (user_id is null or auth.uid() = user_id);
create policy "creators read their video views" on public.video_views
  for select using (
    exists (select 1 from public.videos v
            where v.id = video_id and (v.user_id = auth.uid() or public.is_admin()))
    or user_id = auth.uid()
  );

-- video_likes -----------------------------------------------------------
create policy "likes are public" on public.video_likes
  for select using (true);
create policy "users like as themselves" on public.video_likes
  for insert with check (auth.uid() = user_id);
create policy "users remove own likes" on public.video_likes
  for delete using (auth.uid() = user_id);

-- subscriptions ---------------------------------------------------------
create policy "subscriptions are public" on public.subscriptions
  for select using (true);
create policy "users subscribe as themselves" on public.subscriptions
  for insert with check (auth.uid() = subscriber_id);
create policy "users unsubscribe themselves" on public.subscriptions
  for delete using (auth.uid() = subscriber_id);

-- comments --------------------------------------------------------------
create policy "comments are public" on public.comments
  for select using (true);
create policy "users comment as themselves" on public.comments
  for insert with check (auth.uid() = user_id);
create policy "users edit own comments" on public.comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users or admin delete comments" on public.comments
  for delete using (auth.uid() = user_id or public.is_admin());

-- comment_replies -------------------------------------------------------
create policy "replies are public" on public.comment_replies
  for select using (true);
create policy "users reply as themselves" on public.comment_replies
  for insert with check (auth.uid() = user_id);
create policy "users or admin delete replies" on public.comment_replies
  for delete using (auth.uid() = user_id or public.is_admin());

-- watch_history (private to the owner) ----------------------------------
create policy "users read own history" on public.watch_history
  for select using (auth.uid() = user_id);
create policy "users write own history" on public.watch_history
  for insert with check (auth.uid() = user_id);
create policy "users update own history" on public.watch_history
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own history" on public.watch_history
  for delete using (auth.uid() = user_id);

-- playlists -------------------------------------------------------------
create policy "playlists are public" on public.playlists
  for select using (true);
create policy "owners manage playlists" on public.playlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "playlist videos viewable" on public.playlist_videos
  for select using (true);
create policy "owners manage playlist videos" on public.playlist_videos
  for all using (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.playlists p
            where p.id = playlist_id and p.user_id = auth.uid())
  );

-- notifications (private) -----------------------------------------------
create policy "users read own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

-- tags ------------------------------------------------------------------
create policy "tags are public" on public.tags
  for select using (true);
create policy "authenticated create tags" on public.tags
  for insert with check (auth.uid() is not null);

create policy "video tags are public" on public.video_tags
  for select using (true);
create policy "video owners manage tags" on public.video_tags
  for all using (
    exists (select 1 from public.videos v
            where v.id = video_id and v.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.videos v
            where v.id = video_id and v.user_id = auth.uid())
  );
