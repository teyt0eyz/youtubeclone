import { z } from "zod";

export const visibilityEnum = z.enum(["public", "unlisted", "private"]);

export const signUpSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const createVideoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  description: z.string().trim().max(5000).optional().default(""),
  videoUrl: z.string().url("A video URL is required"),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  duration: z.coerce.number().int().min(0).default(0),
  visibility: visibilityEnum.default("public"),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional().default([]),
});
export type CreateVideoInput = z.infer<typeof createVideoSchema>;

export const updateVideoSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal("")),
  visibility: visibilityEnum.optional(),
});
export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

export const commentSchema = z.object({
  videoId: z.string().uuid(),
  content: z.string().trim().min(1, "Comment cannot be empty").max(2000),
});

export const replySchema = z.object({
  commentId: z.string().uuid(),
  content: z.string().trim().min(1).max(2000),
});

export const watchHistorySchema = z.object({
  videoId: z.string().uuid(),
  watchedSeconds: z.coerce.number().int().min(0),
});

export const searchSchema = z.object({
  q: z.string().trim().max(100).default(""),
});

export const updateProfileSchema = z.object({
  displayName: z.string().trim().max(60).optional(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers and _ only")
    .optional(),
  bio: z.string().trim().max(1000).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  bannerUrl: z.string().url().optional().or(z.literal("")),
});
