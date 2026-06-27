import { createClient } from "@/lib/supabase/server";
import type { VideoWithCreator } from "@/types";

const VIDEO_SELECT =
  "*, creator:profiles!videos_user_id_fkey(id,username,display_name,avatar_url)";

/** Videos the current user has liked, most recent first. */
export async function getLikedVideos(): Promise<VideoWithCreator[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("video_likes")
    .select(`created_at, video:videos!video_likes_video_id_fkey(${VIDEO_SELECT})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? [])
    .map((row) => (row as unknown as { video: VideoWithCreator }).video)
    .filter(Boolean);
}
