"use client";

import { createClient } from "@/lib/supabase/client";
import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  STORAGE_BUCKETS,
} from "@/lib/constants";

type Bucket = keyof typeof STORAGE_BUCKETS;

/**
 * Upload a file to a Storage bucket under `<uid>/<random>.<ext>` and return
 * its public URL. Validates type + size client-side; RLS enforces the folder.
 */
export async function uploadFile(
  bucket: Bucket,
  file: File,
): Promise<{ url: string; path: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in to upload.");

  const isVideo = bucket === "videos";
  const accepted = isVideo ? ACCEPTED_VIDEO_TYPES : ACCEPTED_IMAGE_TYPES;
  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;

  if (!accepted.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type || "unknown"}`);
  }
  if (file.size > maxBytes) {
    throw new Error(
      `File is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB).`,
    );
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: publicUrl, path };
}
