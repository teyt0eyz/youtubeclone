"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { createVideoSchema, updateVideoSchema } from "@/lib/validations";
import { parseInput, ok, fail } from "@/features/shared/action-utils";
import type { ActionResult } from "@/types";
import type { Database } from "@/types/database";

type VideoUpdate = Database["public"]["Tables"]["videos"]["Update"];

/** Attach tags by name, creating any that don't exist yet. */
async function attachTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  videoId: string,
  tags: string[],
) {
  const clean = [...new Set(tags.map((t) => t.toLowerCase().trim()))].filter(
    Boolean,
  );
  if (clean.length === 0) return;

  await supabase.from("tags").upsert(
    clean.map((name) => ({ name })),
    { onConflict: "name", ignoreDuplicates: true },
  );
  const { data: tagRows } = await supabase
    .from("tags")
    .select("id,name")
    .in("name", clean);
  if (!tagRows?.length) return;

  await supabase.from("video_tags").upsert(
    tagRows.map((t) => ({ video_id: videoId, tag_id: t.id })),
    { onConflict: "video_id,tag_id", ignoreDuplicates: true },
  );
}

export async function createVideo(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("You must be signed in to upload.");

  if (!rateLimit(`upload:${user.id}`, 5, 60_000).success) {
    return fail("Too many uploads. Please wait a minute and try again.");
  }

  const parsed = parseInput(createVideoSchema, input);
  if (!parsed.success) return parsed.result;
  const v = parsed.data;

  const { data, error } = await supabase
    .from("videos")
    .insert({
      user_id: user.id,
      title: v.title,
      description: v.description || null,
      video_url: v.videoUrl,
      thumbnail_url: v.thumbnailUrl || null,
      duration: v.duration,
      visibility: v.visibility,
    })
    .select("id")
    .single();

  if (error) return fail(error.message);
  await attachTags(supabase, data.id, v.tags);

  revalidatePath("/");
  revalidatePath("/studio");
  return ok({ id: data.id });
}

export async function updateVideo(input: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not authenticated.");

  const parsed = parseInput(updateVideoSchema, input);
  if (!parsed.success) return parsed.result;
  const { id, ...rest } = parsed.data;

  const patch: VideoUpdate = {};
  if (rest.title !== undefined) patch.title = rest.title;
  if (rest.description !== undefined) patch.description = rest.description || null;
  if (rest.thumbnailUrl !== undefined)
    patch.thumbnail_url = rest.thumbnailUrl || null;
  if (rest.visibility !== undefined) patch.visibility = rest.visibility;

  // RLS guarantees only the owner (or admin) can update.
  const { error } = await supabase.from("videos").update(patch).eq("id", id);
  if (error) return fail(error.message);

  revalidatePath(`/watch/${id}`);
  revalidatePath("/studio");
  return ok();
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not authenticated.");

  const { error } = await supabase.from("videos").delete().eq("id", id);
  if (error) return fail(error.message);

  revalidatePath("/studio");
  revalidatePath("/");
  return ok();
}

/** Record one view (fire-and-forget from the player). */
export async function recordView(
  videoId: string,
  watchedSeconds = 0,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  await supabase.rpc("increment_video_views", { p_video_id: videoId });
  await supabase
    .from("video_views")
    .insert({
      video_id: videoId,
      user_id: user?.id ?? null,
      watched_seconds: Math.floor(watchedSeconds),
    });
}

/** Used by a few flows that want to bounce to the watch page after create. */
export async function createVideoAndRedirect(input: unknown): Promise<void> {
  const res = await createVideo(input);
  if (res.ok && res.data) redirect(`/watch/${res.data.id}`);
}
