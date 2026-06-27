import { createClient } from "@/lib/supabase/server";
import type { CommentWithAuthor } from "@/types";

const AUTHOR = "author:profiles!comments_user_id_fkey(id,username,display_name,avatar_url)";
const REPLY_AUTHOR =
  "author:profiles!comment_replies_user_id_fkey(id,username,display_name,avatar_url)";

/** Comments for a video, newest first, with their replies inlined. */
export async function getComments(
  videoId: string,
): Promise<CommentWithAuthor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      `*, ${AUTHOR}, replies:comment_replies!comment_replies_comment_id_fkey(*, ${REPLY_AUTHOR})`,
    )
    .eq("video_id", videoId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as unknown as CommentWithAuthor[];
}

export async function getCommentCount(videoId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("video_id", videoId);
  return count ?? 0;
}
