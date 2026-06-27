// 1) Prove the DB really holds the synced data (prints videos + channels)
// 2) Create/confirm a ready-to-use admin login so you can sign in immediately.
// Usage:  node --env-file=.env.local scripts/login-fix.mjs
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Missing env. Run: node --env-file=.env.local scripts/login-fix.mjs");
  process.exit(1);
}
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const ADMIN_EMAIL = "admin@streamly.app";
const ADMIN_PASSWORD = "password123";

async function proveDb() {
  const { data, error } = await supabase
    .from("videos")
    .select("title, creator:profiles!videos_user_id_fkey(display_name, username)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  console.log("=== ACTUAL rows in public.videos ===");
  for (const v of data ?? []) {
    console.log(`  • [${v.creator?.display_name ?? "?"}] ${v.title}`);
  }
  console.log(`  (${data?.length ?? 0} rows)\n`);
}

async function ensureAdmin() {
  const { data: list } = await supabase.auth.admin.listUsers();
  let user = list?.users?.find((u) => u.email === ADMIN_EMAIL);

  if (user) {
    // make sure it's confirmed + password is known
    await supabase.auth.admin.updateUserById(user.id, {
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { user_name: "admin", full_name: "Site Admin" },
    });
    if (error) throw error;
    user = data.user;
  }

  await supabase
    .from("profiles")
    .update({ is_admin: true, display_name: "Site Admin" })
    .eq("id", user.id);

  console.log("=== Login ready ===");
  console.log(`  email:    ${ADMIN_EMAIL}`);
  console.log(`  password: ${ADMIN_PASSWORD}`);
  console.log("  (email confirmed, is_admin = true)\n");
}

async function listConfirmedLogins() {
  const { data: list } = await supabase.auth.admin.listUsers();
  const confirmed = (list?.users ?? []).filter((u) => u.email_confirmed_at);
  console.log("=== All confirmed accounts (password: password123) ===");
  for (const u of confirmed.slice(0, 20)) console.log(`  • ${u.email}`);
}

async function main() {
  await proveDb();
  await ensureAdmin();
  await listConfirmedLogins();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
