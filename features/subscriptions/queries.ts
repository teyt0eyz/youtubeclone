import { createClient } from "@/lib/supabase/server";
import type { Profile, VideoWithCreator } from "@/types";

const VIDEO_SELECT =
  "*, creator:profiles!videos_user_id_fkey(id,username,display_name,avatar_url)";

/** Is the current user subscribed to `creatorId`? */
export async function isSubscribed(creatorId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("subscriber_id", user.id)
    .eq("creator_id", creatorId)
    .maybeSingle();
  return Boolean(data);
}

export async function getSubscriberCount(creatorId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("creator_id", creatorId);
  return count ?? 0;
}

/** Channels the current user is subscribed to. */
export async function getMySubscriptions(): Promise<Profile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("subscriptions")
    .select(
      "creator:profiles!subscriptions_creator_id_fkey(id,username,display_name,avatar_url,banner_url,bio,is_admin,created_at)",
    )
    .eq("subscriber_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? [])
    .map((r) => (r as unknown as { creator: Profile }).creator)
    .filter(Boolean);
}

/** Latest videos from channels the current user subscribes to. */
export async function getSubscriptionFeed(): Promise<VideoWithCreator[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: subs } = await supabase
    .from("subscriptions")
    .select("creator_id")
    .eq("subscriber_id", user.id);
  const creatorIds = (subs ?? []).map((s) => s.creator_id);
  if (creatorIds.length === 0) return [];

  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .in("user_id", creatorIds)
    .eq("visibility", "public")
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .limit(48);
  if (error) throw error;
  return (data ?? []) as unknown as VideoWithCreator[];
}
