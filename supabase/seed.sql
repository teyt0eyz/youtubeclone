-- =====================================================================
-- seed.sql — static reference data (safe to run repeatedly)
-- Demo creators & videos are seeded via `npm run seed` (scripts/seed.mjs),
-- which needs the auth admin API to create real users.
-- =====================================================================

insert into public.tags (name) values
  ('music'), ('gaming'), ('coding'), ('education'), ('travel'),
  ('cooking'), ('fitness'), ('comedy'), ('news'), ('technology'),
  ('design'), ('science'), ('sports'), ('podcast'), ('vlog')
on conflict (name) do nothing;
