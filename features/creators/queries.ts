import { createClient } from "@/lib/supabase/server";
import type { CreatorWithStats, Profile } from "@/types";

/** Look up a creator by username and decorate with stats + viewer state. */
export async function getCreatorByUsername(
  username: string,
): Promise<CreatorWithStats | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return null;

  return decorate(supabase, profile);
}

export async function getCreatorById(
  id: string,
): Promise<CreatorWithStats | null> {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!profile) return null;
  return decorate(supabase, profile);
}

async function decorate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  profile: Profile,
): Promise<CreatorWithStats> {
  const [{ count: subs }, { count: vids }, { data: auth }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("creator_id", profile.id),
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .eq("visibility", "public")
      .eq("is_removed", false),
    supabase.auth.getUser(),
  ]);

  let is_subscribed = false;
  if (auth.user) {
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("subscriber_id", auth.user.id)
      .eq("creator_id", profile.id)
      .maybeSingle();
    is_subscribed = Boolean(data);
  }

  return {
    ...profile,
    subscriber_count: subs ?? 0,
    video_count: vids ?? 0,
    is_subscribed,
  };
}

/** A grid of creators for the "Browse creators" experience. */
export async function getCreators(limit = 24): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Profile[];
}
