import { createClient } from "@/lib/supabase/server";
import type { VideoWithCreator } from "@/types";

const VIDEO_SELECT =
  "*, creator:profiles!videos_user_id_fkey(id,username,display_name,avatar_url)";

export interface HistoryEntry {
  video: VideoWithCreator;
  watched_seconds: number;
  last_watched_at: string;
}

/** The current user's watch history, most recently watched first. */
export async function getWatchHistory(): Promise<HistoryEntry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("watch_history")
    .select(
      `watched_seconds, last_watched_at, video:videos!watch_history_video_id_fkey(${VIDEO_SELECT})`,
    )
    .eq("user_id", user.id)
    .order("last_watched_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  return (data ?? [])
    .filter((r) => (r as unknown as { video: unknown }).video)
    .map((r) => r as unknown as HistoryEntry);
}

/** Saved progress for a single video (for "continue watching"). */
export async function getResumePosition(videoId: string): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase
    .from("watch_history")
    .select("watched_seconds")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();
  return data?.watched_seconds ?? 0;
}
