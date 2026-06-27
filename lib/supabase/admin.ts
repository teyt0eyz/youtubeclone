import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { publicEnv } from "@/lib/env";

/**
 * Service-role client that bypasses RLS. Server-only. Use sparingly — for
 * seed scripts and trusted admin operations after an explicit `is_admin`
 * check. Never import this from a Client Component.
 */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    serviceKey,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
