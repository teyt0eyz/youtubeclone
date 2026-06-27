# Streamly — a YouTube-style video platform

A production-ready video streaming platform built with **Next.js 16 (App Router)**,
**React 19**, **TypeScript**, **Tailwind CSS v4**, and **Supabase** (Postgres, Auth,
Storage). Dark-mode-first, feature-based architecture, server actions throughout.

> Bootstrapped on Next.js 16. Note: Next 16 renamed *Middleware* → **Proxy**
> (`proxy.ts`) and `params`/`searchParams`/`cookies()` are async — this project
> already follows those conventions.

---

## Features

- 🎬 **Watch** — React Player with resume-from-last-position, view tracking
- ⬆️ **Upload** — direct-to-Storage upload, client-side duration detection, thumbnails
- ❤️ **Engage** — like/unlike (optimistic), comments + threaded replies
- 🔔 **Subscribe** — subscriptions feed, subscriber counts, creator notifications
- 🕑 **History** — automatic progress tracking, continue-watching, clear history
- 🔎 **Search** — full-text video search + creator search
- 👤 **Channels** — artist pages with banner/avatar, Videos / Playlists / About tabs
- 🛠️ **Creator Studio** — manage uploads, inline edit, delete, analytics
- 🛡️ **Admin** — dashboard, users, video moderation, reports
- 🔐 **Auth** — Supabase email/password + GitHub OAuth, protected routes via Proxy
- 🌐 **SEO** — Metadata API, OpenGraph, dynamic `sitemap.xml`, `robots.txt`

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn-style primitives, Lucide icons |
| Backend | Next.js Server Actions |
| Database | Supabase Postgres (RLS, triggers, RPCs) |
| Auth | Supabase Auth (Email + GitHub OAuth) |
| Storage | Supabase Storage (avatars, banners, thumbnails, videos) |
| Client state | Zustand |
| Server cache | TanStack Query (provider wired) |
| Validation | Zod |
| Forms | React Hook Form |
| Player | React Player v3 |

## Project structure

The PRD calls for a `src/`-style feature architecture; because the Next scaffold
uses the root `app/` directory with the `@/*` → `./*` path alias, features live at
the repo root and import cleanly as `@/features/...`.

```
app/
  (app)/            # main shell (navbar + sidebar): home, watch, channel, studio, admin…
  (auth)/           # centered auth layout: login, signup
  auth/callback/    # OAuth + email-confirm route handler
  sitemap.ts robots.ts layout.tsx
components/
  ui/               # button, input, avatar, tabs, badge… (shadcn-style, no Radix)
  layout/           # navbar, sidebar, mobile-nav, user-menu, search-bar
  providers.tsx     # theme + react-query + toaster
features/
  videos/  likes/  comments/  subscriptions/  history/
  search/  creators/  profile/  auth/  admin/  storage/  shared/
    ├── actions.ts   # "use server" mutations
    ├── queries.ts   # server-side data fetchers
    └── components/   # feature UI
lib/                # supabase clients, auth helpers, env, utils, validations, rate-limit
stores/  hooks/  types/
supabase/migrations # SQL: schema, functions/triggers, RLS, storage
scripts/seed.mjs    # demo creators + videos
```

## Quick start

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project

At [supabase.com](https://supabase.com) → New project. Then **Project Settings → API**
copy the URL, the `anon` key and the `service_role` key.

### 3. Environment

```bash
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run the migrations

In the Supabase **SQL Editor**, run each file in order:

```
supabase/migrations/0001_schema.sql
supabase/migrations/0002_functions.sql
supabase/migrations/0003_rls.sql
supabase/migrations/0004_storage.sql
supabase/seed.sql            # tags
```

Or with the Supabase CLI:

```bash
supabase link --project-ref <ref>
supabase db push             # applies supabase/migrations
psql "$DATABASE_URL" -f supabase/seed.sql
```

### 5. Seed demo content (optional)

```bash
npm run seed
# creates demo creators + videos. Login: <username>@demo.streamly.app / password123
```

### 6. GitHub OAuth (optional)

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md#github-oauth).

### 7. Dev

```bash
npm run dev      # http://localhost:3000
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |
| `npm run seed` | Seed demo data (needs `.env.local`) |

## Database

13 tables: `profiles`, `videos`, `video_views`, `video_likes`, `subscriptions`,
`comments`, `comment_replies`, `watch_history`, `playlists`, `playlist_videos`,
`notifications`, `tags`, `video_tags`. Highlights:

- **`handle_new_user`** trigger creates a `profiles` row on signup (unique username).
- **`toggle_video_like`** / **`increment_video_views`** RPCs for atomic counters.
- Triggers keep `likes_count` in sync and fan out notifications.
- **RLS on every table** — public read of public content, owner-only writes,
  private watch history/notifications, admin override via `is_admin()`.
- Storage policies scope uploads to `<uid>/...` folders.

## Security

- Row Level Security on all tables (`0003_rls.sql`)
- Zod validation on every server action input
- In-memory rate limiting on uploads/comments (swap for Upstash in prod)
- Protected routes enforced in `proxy.ts` **and** re-checked in each action
- Client + server upload validation (type/size) and per-user Storage folders

## Deploy

One-click on Vercel — see [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## License

MIT — sample/educational project.
