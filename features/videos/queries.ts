import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "@/lib/constants";
import type { Paginated, VideoWithCreator } from "@/types";

const CREATOR_SELECT =
  "creator:profiles!videos_user_id_fkey(id,username,display_name,avatar_url)";
const VIDEO_SELECT = `*, ${CREATOR_SELECT}`;

type ListOptions = {
  page?: number;
  pageSize?: number;
};

/** Most recent public videos (home feed). Cursor = page index. */
export async function getVideos({
  page = 0,
  pageSize = PAGE_SIZE,
}: ListOptions = {}): Promise<Paginated<VideoWithCreator>> {
  const supabase = await createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("visibility", "public")
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  const items = (data ?? []) as unknown as VideoWithCreator[];
  const hasMore = items.length === pageSize;
  return { items, hasMore, nextCursor: hasMore ? page + 1 : null };
}

/** Trending = most viewed in the last 30 days, then all-time as a tiebreak. */
export async function getTrendingVideos({
  page = 0,
  pageSize = PAGE_SIZE,
}: ListOptions = {}): Promise<Paginated<VideoWithCreator>> {
  const supabase = await createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const since = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("visibility", "public")
    .eq("is_removed", false)
    .gte("created_at", since)
    .order("views_count", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  const items = (data ?? []) as unknown as VideoWithCreator[];
  const hasMore = items.length === pageSize;
  return { items, hasMore, nextCursor: hasMore ? page + 1 : null };
}

/**
 * Short-form videos for the Reels feed: anything <= 60s, plus YouTube Shorts
 * links (whose duration is often unknown / 0). Newest first.
 */
export async function getReels({
  page = 0,
  pageSize = PAGE_SIZE,
}: ListOptions = {}): Promise<Paginated<VideoWithCreator>> {
  const supabase = await createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;

  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("visibility", "public")
    .eq("is_removed", false)
    .or("and(duration.gt.0,duration.lte.60),video_url.ilike.*shorts*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw error;
  const items = (data ?? []) as unknown as VideoWithCreator[];
  const hasMore = items.length === pageSize;
  return { items, hasMore, nextCursor: hasMore ? page + 1 : null };
}

/** Public videos that carry a given category tag (home-page chip filter). */
export async function getVideosByCategory(
  category: string,
  { page = 0, pageSize = PAGE_SIZE }: ListOptions = {},
): Promise<Paginated<VideoWithCreator>> {
  const supabase = await createClient();
  const empty = { items: [], hasMore: false, nextCursor: null };

  const { data: tag } = await supabase
    .from("tags")
    .select("id")
    .eq("name", category.toLowerCase())
    .maybeSingle();
  if (!tag) return empty;

  const { data: vt } = await supabase
    .from("video_tags")
    .select("video_id")
    .eq("tag_id", tag.id);
  const ids = [...new Set((vt ?? []).map((r) => r.video_id))];
  if (ids.length === 0) return empty;

  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .in("id", ids)
    .eq("visibility", "public")
    .eq("is_removed", false)
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;

  const items = (data ?? []) as unknown as VideoWithCreator[];
  const hasMore = items.length === pageSize;
  return { items, hasMore, nextCursor: hasMore ? page + 1 : null };
}

/** Single video by id. Respects RLS (private videos only visible to owner). */
export async function getVideo(id: string): Promise<VideoWithCreator | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as VideoWithCreator) ?? null;
}

/** Recommended videos for the watch sidebar (exclude the current one). */
export async function getRecommendedVideos(
  excludeId: string,
  limit = 12,
): Promise<VideoWithCreator[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("visibility", "public")
    .eq("is_removed", false)
    .neq("id", excludeId)
    .order("views_count", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as VideoWithCreator[];
}

/** Public videos for a creator's channel page. */
export async function getCreatorVideos(
  creatorId: string,
  { page = 0, pageSize = PAGE_SIZE }: ListOptions = {},
): Promise<Paginated<VideoWithCreator>> {
  const supabase = await createClient();
  const from = page * pageSize;
  const to = from + pageSize - 1;
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("user_id", creatorId)
    .eq("is_removed", false)
    .in("visibility", ["public", "unlisted"])
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  const items = (data ?? []) as unknown as VideoWithCreator[];
  const hasMore = items.length === pageSize;
  return { items, hasMore, nextCursor: hasMore ? page + 1 : null };
}

/** All of the signed-in creator's videos (any visibility) for the Studio. */
export async function getMyVideos(): Promise<VideoWithCreator[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("videos")
    .select(VIDEO_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as VideoWithCreator[];
}

/** Whether the current user has liked a given video. */
export async function getViewerLikeState(videoId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("video_likes")
    .select("id")
    .eq("video_id", videoId)
    .eq("user_id", user.id)
    .maybeSingle();
  return Boolean(data);
}
