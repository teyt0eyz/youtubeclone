"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { watchHistorySchema } from "@/lib/validations";
import { parseInput, ok, fail } from "@/features/shared/action-utils";
import type { ActionResult } from "@/types";

/** Upsert progress for a video into the user's watch history. */
export async function addWatchHistory(input: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return ok(); // silently no-op for guests

  const parsed = parseInput(watchHistorySchema, input);
  if (!parsed.success) return parsed.result;

  const { error } = await supabase.from("watch_history").upsert(
    {
      user_id: user.id,
      video_id: parsed.data.videoId,
      watched_seconds: parsed.data.watchedSeconds,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,video_id" },
  );
  if (error) return fail(error.message);
  return ok();
}

export async function clearWatchHistory(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not authenticated.");

  const { error } = await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", user.id);
  if (error) return fail(error.message);

  revalidatePath("/history");
  return ok();
}

export async function removeFromHistory(
  videoId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not authenticated.");
  const { error } = await supabase
    .from("watch_history")
    .delete()
    .eq("user_id", user.id)
    .eq("video_id", videoId);
  if (error) return fail(error.message);
  revalidatePath("/history");
  return ok();
}
