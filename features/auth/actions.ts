"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { signInSchema, signUpSchema } from "@/lib/validations";
import { parseInput, ok, fail } from "@/features/shared/action-utils";
import { getSiteUrl } from "@/lib/env";
import type { ActionResult } from "@/types";

export async function signInWithEmail(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(signInSchema, input);
  if (!parsed.success) return parsed.result;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return fail(error.message);

  revalidatePath("/", "layout");
  return ok();
}

export async function signUpWithEmail(input: unknown): Promise<ActionResult> {
  const parsed = parseInput(signUpSchema, input);
  if (!parsed.success) return parsed.result;

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/callback` },
  });
  if (error) return fail(error.message);

  revalidatePath("/", "layout");
  return ok();
}

/** Start the GitHub OAuth flow and redirect the browser to the provider. */
export async function signInWithGitHub(next = "/"): Promise<void> {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? getSiteUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) throw error;
  if (data.url) redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
