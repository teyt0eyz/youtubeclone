export const APP_NAME = "Streamly";
export const APP_DESCRIPTION =
  "A modern video streaming platform — upload, watch, and subscribe.";

export const PAGE_SIZE = 24;
export const COMMENTS_PAGE_SIZE = 20;

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  banners: "banners",
  thumbnails: "thumbnails",
  videos: "videos",
} as const;

export const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
