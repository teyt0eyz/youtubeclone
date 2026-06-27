-- =====================================================================
-- 0001_schema.sql — Core schema for the video platform
-- =====================================================================

create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------
do $$ begin
  create type visibility as enum ('public', 'unlisted', 'private');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'new_video', 'new_subscriber', 'new_comment', 'video_liked'
  );
exception when duplicate_object then null; end $$;

-- profiles --------------------------------------------------------------
-- 1:1 with auth.users. Created automatically by a trigger on signup.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text not null unique
                 check (char_length(username) between 3 and 30
                        and username ~ '^[a-z0-9_]+$'),
  display_name text,
  avatar_url   text,
  banner_url   text,
  bio          text check (char_length(bio) <= 1000),
  is_admin     boolean not null default false,
  created_at   timestamptz not null default now()
);

-- videos ----------------------------------------------------------------
create table if not exists public.videos (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  title         text not null check (char_length(title) between 1 and 200),
  description   text check (char_length(description) <= 5000),
  thumbnail_url text,
  video_url     text not null,
  duration      integer not null default 0 check (duration >= 0),
  visibility    visibility not null default 'public',
  views_count   bigint not null default 0,
  likes_count   bigint not null default 0,
  is_removed    boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists videos_user_id_idx on public.videos(user_id);
create index if not exists videos_created_at_idx on public.videos(created_at desc);
create index if not exists videos_visibility_idx on public.videos(visibility);
-- Full-text search over title + description.
create index if not exists videos_search_idx on public.videos
  using gin (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,'')));

-- video_views -----------------------------------------------------------
create table if not exists public.video_views (
  id              uuid primary key default gen_random_uuid(),
  video_id        uuid not null references public.videos(id) on delete cascade,
  user_id         uuid references public.profiles(id) on delete set null,
  watched_seconds integer not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists video_views_video_id_idx on public.video_views(video_id);

-- video_likes -----------------------------------------------------------
create table if not exists public.video_likes (
  id         uuid primary key default gen_random_uuid(),
  video_id   uuid not null references public.videos(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (video_id, user_id)
);
create index if not exists video_likes_user_id_idx on public.video_likes(user_id);

-- subscriptions ---------------------------------------------------------
create table if not exists public.subscriptions (
  id            uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.profiles(id) on delete cascade,
  creator_id    uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (subscriber_id, creator_id),
  check (subscriber_id <> creator_id)
);
create index if not exists subscriptions_creator_idx on public.subscriptions(creator_id);
create index if not exists subscriptions_subscriber_idx on public.subscriptions(subscriber_id);

-- comments --------------------------------------------------------------
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  video_id   uuid not null references public.videos(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comments_video_id_idx on public.comments(video_id, created_at desc);

-- comment_replies -------------------------------------------------------
create table if not exists public.comment_replies (
  id         uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index if not exists comment_replies_comment_id_idx on public.comment_replies(comment_id, created_at);

-- watch_history ---------------------------------------------------------
create table if not exists public.watch_history (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  video_id        uuid not null references public.videos(id) on delete cascade,
  watched_seconds integer not null default 0,
  last_watched_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists watch_history_user_idx on public.watch_history(user_id, last_watched_at desc);

-- playlists -------------------------------------------------------------
create table if not exists public.playlists (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 150),
  description text,
  created_at  timestamptz not null default now()
);

create table if not exists public.playlist_videos (
  id          uuid primary key default gen_random_uuid(),
  playlist_id uuid not null references public.playlists(id) on delete cascade,
  video_id    uuid not null references public.videos(id) on delete cascade,
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  unique (playlist_id, video_id)
);

-- notifications ---------------------------------------------------------
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       notification_type not null,
  payload    jsonb not null default '{}'::jsonb,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, created_at desc);

-- tags ------------------------------------------------------------------
create table if not exists public.tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 40)
);

create table if not exists public.video_tags (
  id       uuid primary key default gen_random_uuid(),
  video_id uuid not null references public.videos(id) on delete cascade,
  tag_id   uuid not null references public.tags(id) on delete cascade,
  unique (video_id, tag_id)
);
create index if not exists video_tags_tag_idx on public.video_tags(tag_id);
