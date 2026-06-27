-- =====================================================================
-- 0002_functions.sql — Triggers, counters and RPCs
-- =====================================================================

-- New auth user -> profile row -----------------------------------------
-- Derives a unique username from email/metadata; falls back to a random one.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(
    coalesce(
      new.raw_user_meta_data->>'user_name',
      new.raw_user_meta_data->>'preferred_username',
      split_part(new.email, '@', 1),
      'user'
    ),
    '[^a-z0-9_]', '', 'g'
  ));
  if char_length(base_username) < 3 then
    base_username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  final_username := base_username;
  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', final_username),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Likes counter ---------------------------------------------------------
create or replace function public.sync_likes_count()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    update public.videos set likes_count = likes_count + 1 where id = new.video_id;
  elsif tg_op = 'DELETE' then
    update public.videos set likes_count = greatest(0, likes_count - 1) where id = old.video_id;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_sync_likes on public.video_likes;
create trigger trg_sync_likes
  after insert or delete on public.video_likes
  for each row execute function public.sync_likes_count();

-- Increment views (called once per playback start) ----------------------
create or replace function public.increment_video_views(p_video_id uuid)
returns void language sql security definer set search_path = public as $$
  update public.videos set views_count = views_count + 1 where id = p_video_id;
$$;

-- Toggle like atomically; returns the new liked state -------------------
create or replace function public.toggle_video_like(p_video_id uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_exists boolean;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select exists(
    select 1 from public.video_likes
    where video_id = p_video_id and user_id = v_user
  ) into v_exists;

  if v_exists then
    delete from public.video_likes where video_id = p_video_id and user_id = v_user;
    return false;
  else
    insert into public.video_likes (video_id, user_id) values (p_video_id, v_user);
    -- notify the creator
    insert into public.notifications (user_id, type, payload)
    select v.user_id, 'video_liked',
           jsonb_build_object('video_id', v.id, 'actor_id', v_user)
    from public.videos v where v.id = p_video_id and v.user_id <> v_user;
    return true;
  end if;
end;
$$;

-- Notify subscribers on new public video --------------------------------
create or replace function public.notify_on_new_video()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.visibility = 'public' and not new.is_removed then
    insert into public.notifications (user_id, type, payload)
    select s.subscriber_id, 'new_video',
           jsonb_build_object('video_id', new.id, 'creator_id', new.user_id)
    from public.subscriptions s where s.creator_id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_video on public.videos;
create trigger trg_notify_new_video
  after insert on public.videos
  for each row execute function public.notify_on_new_video();

-- Notify creator on new subscriber --------------------------------------
create or replace function public.notify_on_new_subscriber()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.notifications (user_id, type, payload)
  values (new.creator_id, 'new_subscriber',
          jsonb_build_object('subscriber_id', new.subscriber_id));
  return new;
end;
$$;

drop trigger if exists trg_notify_subscriber on public.subscriptions;
create trigger trg_notify_subscriber
  after insert on public.subscriptions
  for each row execute function public.notify_on_new_subscriber();
