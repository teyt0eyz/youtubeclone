// Create a profiles row for any auth user that is missing one.
// Fixes FK violations on subscriptions/video_likes for accounts that signed up
// before the handle_new_user trigger existed.
// Usage:  node --env-file=.env.local scripts/backfill-profiles.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env. Run: node --env-file=.env.local scripts/backfill-profiles.mjs");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

function baseUsername(user) {
  const meta = user.user_metadata ?? {};
  const raw =
    meta.user_name ||
    meta.preferred_username ||
    (user.email ? user.email.split("@")[0] : "") ||
    "user";
  let s = String(raw).toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (s.length < 3) s = `user_${user.id.slice(0, 8)}`;
  return s.slice(0, 24);
}

async function main() {
  // gather all auth users (paginate)
  const users = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    if (!data.users.length) break;
    users.push(...data.users);
    if (data.users.length < 1000) break;
  }

  const { data: existing } = await supabase.from("profiles").select("id, username");
  const haveId = new Set((existing ?? []).map((p) => p.id));
  const usedNames = new Set((existing ?? []).map((p) => p.username));

  let created = 0;
  for (const u of users) {
    if (haveId.has(u.id)) continue;

    let name = baseUsername(u);
    let candidate = name;
    let n = 0;
    while (usedNames.has(candidate)) {
      n += 1;
      candidate = `${name}${n}`;
    }
    usedNames.add(candidate);

    const meta = u.user_metadata ?? {};
    const { error } = await supabase.from("profiles").insert({
      id: u.id,
      username: candidate,
      display_name: meta.full_name || meta.name || candidate,
      avatar_url: meta.avatar_url ?? null,
    });
    if (error) {
      console.error(`✗ ${u.email}: ${error.message}`);
    } else {
      created++;
      console.log(`✓ ${u.email} → @${candidate}`);
    }
  }

  console.log(`\nDone. Backfilled ${created} missing profile(s). Total users: ${users.length}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
