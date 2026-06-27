import { createClient } from "@/lib/supabase/server";
import type { Profile, VideoWithCreator } from "@/types";

const VIDEO_SELECT =
  "*, creator:profiles!videos_user_id_fkey(id,username,display_name,avatar_url)";

/**
 * Search public videos by title/description (and tag name). Uses websearch
 * full-text matching with an `ilike` fallback so partial words still match.
 */
export async function searchVideos(
  query: string,
): Promise<VideoWithCreator[]> {
  const q = query.trim();
  if (!q) return [];
  const supabase = await createClient();

  // 1) Full-text search over title + description.
  const fts = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("visibility", "public")
    .eq("is_removed", false)
    .textSearch("title", q, { type: "websearch", config: "english" })
    .limit(40);

  let items = (fts.data ?? []) as unknown as VideoWithCreator[];

  // 2) Fallback to ILIKE if FTS found nothing (e.g. partial tokens).
  if (items.length === 0) {
    const like = await supabase
      .from("videos")
      .select(VIDEO_SELECT)
      .eq("visibility", "public")
      .eq("is_removed", false)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order("views_count", { ascending: false })
      .limit(40);
    items = (like.data ?? []) as unknown as VideoWithCreator[];
  }

  return items;
}

/** Search creators by username or display name. */
export async function searchCreators(query: string): Promise<Profile[]> {
  const q = query.trim();
  if (!q) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
    .limit(12);
  return (data ?? []) as Profile[];
}
