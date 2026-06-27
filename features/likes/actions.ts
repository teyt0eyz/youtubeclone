"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ok, fail } from "@/features/shared/action-utils";
import type { ActionResult } from "@/types";

/** Toggle the current user's like on a video. Returns the new liked state. */
export async function toggleLike(
  videoId: string,
): Promise<ActionResult<{ liked: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in to like videos.");

  const { data, error } = await supabase.rpc("toggle_video_like", {
    p_video_id: videoId,
  });
  if (error) return fail(error.message);

  revalidatePath(`/watch/${videoId}`);
  revalidatePath("/liked");
  return ok({ liked: Boolean(data) });
}
