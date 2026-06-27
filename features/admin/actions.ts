"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ok, fail } from "@/features/shared/action-utils";
import type { ActionResult } from "@/types";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, allowed: false } as const;
  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  return { supabase, allowed: Boolean(data?.is_admin) } as const;
}

/** Soft-remove a video (admin moderation). */
export async function adminRemoveVideo(
  videoId: string,
  removed = true,
): Promise<ActionResult> {
  const { supabase, allowed } = await assertAdmin();
  if (!allowed) return fail("Admin only.");
  const { error } = await supabase
    .from("videos")
    .update({ is_removed: removed })
    .eq("id", videoId);
  if (error) return fail(error.message);
  revalidatePath("/admin/videos");
  return ok();
}
