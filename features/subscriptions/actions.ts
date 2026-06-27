"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ok, fail } from "@/features/shared/action-utils";
import type { ActionResult } from "@/types";

export async function subscribe(
  creatorId: string,
): Promise<ActionResult<{ subscribed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in to subscribe.");
  if (user.id === creatorId) return fail("You can't subscribe to yourself.");

  const { error } = await supabase
    .from("subscriptions")
    .insert({ subscriber_id: user.id, creator_id: creatorId });
  if (error && error.code !== "23505") return fail(error.message); // ignore dup

  revalidatePath("/subscriptions");
  return ok({ subscribed: true });
}

export async function unsubscribe(
  creatorId: string,
): Promise<ActionResult<{ subscribed: boolean }>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("Sign in first.");

  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("subscriber_id", user.id)
    .eq("creator_id", creatorId);
  if (error) return fail(error.message);

  revalidatePath("/subscriptions");
  return ok({ subscribed: false });
}

/** Convenience toggle used by the SubscribeButton. */
export async function toggleSubscription(
  creatorId: string,
  currentlySubscribed: boolean,
): Promise<ActionResult<{ subscribed: boolean }>> {
  return currentlySubscribed ? unsubscribe(creatorId) : subscribe(creatorId);
}
