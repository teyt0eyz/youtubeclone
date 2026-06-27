# Deployment guide

Deploy **Streamly** to Vercel with Supabase as the backend.

---

## 1. Provision Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. **Project Settings → API** — note:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only — keep secret)

## 2. Apply the schema

Run the SQL files in order in the **SQL Editor** (or `supabase db push` with the CLI):

```
supabase/migrations/0001_schema.sql      -- tables, indexes, enums
supabase/migrations/0002_functions.sql   -- triggers, counters, RPCs
supabase/migrations/0003_rls.sql         -- row level security
supabase/migrations/0004_storage.sql     -- buckets + storage policies
supabase/seed.sql                        -- default tags
```

> `0004_storage.sql` creates the `avatars`, `banners`, `thumbnails` and `videos`
> buckets (public read, per-user write). To serve videos privately, set the
> `videos` bucket `public = false` and switch to signed URLs in
> `features/storage/upload.ts`.

## 3. GitHub OAuth

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
   - **Homepage URL**: `https://your-domain.com`
   - **Authorization callback URL**:
     `https://<ref>.supabase.co/auth/v1/callback`
2. Copy the **Client ID** and **Client Secret**.
3. Supabase → **Authentication → Providers → GitHub** → paste them, enable.
4. Supabase → **Authentication → URL Configuration**:
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: add `https://your-domain.com/auth/callback`
     and `http://localhost:3000/auth/callback` for local dev.

The app starts the flow in `features/auth/actions.ts → signInWithGitHub` and
finishes it in `app/auth/callback/route.ts`.

## 4. Deploy to Vercel

1. Push the repo to GitHub and **Import** it in Vercel.
2. Framework preset: **Next.js** (auto-detected). No build overrides needed.
3. **Environment Variables** (Production + Preview):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | service role key |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |

4. Deploy. After the first deploy, set the real domain in `NEXT_PUBLIC_SITE_URL`
   and in the Supabase URL configuration, then redeploy.

## 5. Make yourself an admin

The admin area (`/admin`) is gated by the `profiles.is_admin` flag. After signing
up once, run in the SQL editor:

```sql
update public.profiles set is_admin = true where username = 'your_username';
```

## 6. Seed demo data (optional)

Locally, with `.env.local` populated (including the service role key):

```bash
npm run seed
```

## Production checklist

- [ ] All four migrations + seed applied
- [ ] Storage buckets exist with policies
- [ ] GitHub OAuth configured, redirect URLs whitelisted
- [ ] Env vars set in Vercel (incl. `NEXT_PUBLIC_SITE_URL` = real domain)
- [ ] At least one admin user promoted
- [ ] Replace the in-memory rate limiter (`lib/rate-limit.ts`) with Upstash Redis
      if running multiple instances
- [ ] Consider a CDN / transcoding pipeline for large video files

## Notes on this Next.js version

- **Proxy, not Middleware** — session refresh + route protection live in
  `proxy.ts` (Next 16 renamed the convention).
- **Async dynamic APIs** — `params`, `searchParams` and `cookies()` are awaited.
- **Cache Components** are intentionally left off, so no `unstable_instant` /
  `use cache` wiring is required for routes to render correctly.
