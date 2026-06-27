"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { commentSchema, replySchema } from "@/lib/validations";
import { parseInput, ok, fail } from "@/features/shared/action-utils";
import type { ActionResult } from "@/types";

export async function createComment(input: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in to comment.");
  if (!rateLimit(`comment:${user.id}`, 15, 60_000).success)
    return fail("You're commenting too fast. Slow down a little.");

  const parsed = parseInput(commentSchema, input);
  if (!parsed.success) return parsed.result;

  const { error } = await supabase.from("comments").insert({
    video_id: parsed.data.videoId,
    user_id: user.id,
    content: parsed.data.content,
  });
  if (error) return fail(error.message);

  revalidatePath(`/watch/${parsed.data.videoId}`);
  return ok();
}

export async function createReply(input: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in to reply.");

  const parsed = parseInput(replySchema, input);
  if (!parsed.success) return parsed.result;

  const { error } = await supabase.from("comment_replies").insert({
    comment_id: parsed.data.commentId,
    user_id: user.id,
    content: parsed.data.content,
  });
  if (error) return fail(error.message);

  return ok();
}

export async function deleteComment(
  commentId: string,
  videoId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", commentId);
  if (error) return fail(error.message);
  revalidatePath(`/watch/${videoId}`);
  return ok();
}
