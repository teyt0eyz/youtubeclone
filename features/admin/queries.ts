import { createClient } from "@/lib/supabase/server";
import type { Profile, VideoWithCreator } from "@/types";

const VIDEO_SELECT =
  "*, creator:profiles!videos_user_id_fkey(id,username,display_name,avatar_url)";

export interface AdminStats {
  users: number;
  videos: number;
  views: number;
  comments: number;
}

/** Aggregate counts for the admin dashboard. Relies on admin RLS bypass. */
export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const [u, v, c] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }),
    supabase.from("comments").select("id", { count: "exact", head: true }),
  ]);
  const { data: viewsAgg } = await supabase
    .from("videos")
    .select("views_count");
  const views = (viewsAgg ?? []).reduce(
    (sum, row) => sum + (row.views_count ?? 0),
    0,
  );
  return {
    users: u.count ?? 0,
    videos: v.count ?? 0,
    comments: c.count ?? 0,
    views,
  };
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as Profile[];
}

export async function getAllVideos(): Promise<VideoWithCreator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as unknown as VideoWithCreator[];
}
