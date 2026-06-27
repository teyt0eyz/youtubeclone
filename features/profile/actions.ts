"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateProfileSchema } from "@/lib/validations";
import { parseInput, ok, fail } from "@/features/shared/action-utils";
import type { ActionResult } from "@/types";
import type { Database } from "@/types/database";

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Not authenticated.");

  const parsed = parseInput(updateProfileSchema, input);
  if (!parsed.success) return parsed.result;
  const d = parsed.data;

  const patch: ProfileUpdate = {};
  if (d.displayName !== undefined) patch.display_name = d.displayName || null;
  if (d.username !== undefined) patch.username = d.username;
  if (d.bio !== undefined) patch.bio = d.bio || null;
  if (d.avatarUrl !== undefined) patch.avatar_url = d.avatarUrl || null;
  if (d.bannerUrl !== undefined) patch.banner_url = d.bannerUrl || null;

  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);
  if (error) {
    if (error.code === "23505") return fail("That username is already taken.");
    return fail(error.message);
  }

  revalidatePath("/profile");
  return ok();
}
