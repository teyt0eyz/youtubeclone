import "server-only";
import { z } from "zod";
import type { ActionResult } from "@/types";

/** Validate `FormData` or a plain object against a Zod schema for an action. */
export function parseInput<S extends z.ZodTypeAny>(
  schema: S,
  input: unknown,
):
  | { success: true; data: z.infer<S> }
  | { success: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input);
  if (parsed.success) return { success: true, data: parsed.data };
  return {
    success: false,
    result: {
      ok: false,
      error: "Validation failed",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    },
  };
}

export function ok<T>(data?: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string): ActionResult<never> {
  return { ok: false, error };
}
