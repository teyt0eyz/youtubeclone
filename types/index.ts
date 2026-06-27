import type { Tables } from "./database";

export type Profile = Tables<"profiles">;
export type Video = Tables<"videos">;
export type Comment = Tables<"comments">;
export type CommentReply = Tables<"comment_replies">;
export type Subscription = Tables<"subscriptions">;
export type WatchHistory = Tables<"watch_history">;
export type Notification = Tables<"notifications">;
export type Playlist = Tables<"playlists">;

/** A video joined with its creator profile + the viewer's interaction flags. */
export interface VideoWithCreator extends Video {
  creator: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url"
  > | null;
}

/** Creator profile decorated with aggregate counts for artist pages. */
export interface CreatorWithStats extends Profile {
  subscriber_count: number;
  video_count: number;
  is_subscribed: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url"
  > | null;
  replies: ReplyWithAuthor[];
}

export interface ReplyWithAuthor extends CommentReply {
  author: Pick<
    Profile,
    "id" | "username" | "display_name" | "avatar_url"
  > | null;
}

export interface Paginated<T> {
  items: T[];
  nextCursor: number | null;
  hasMore: boolean;
}

export interface ActionResult<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string[]>;
}
