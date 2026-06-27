/**
 * Hand-maintained Supabase schema types. Keep in sync with
 * `supabase/migrations`. To regenerate from a live project instead, run:
 *   supabase gen types typescript --project-id <ref> > types/database.ts
 */
export type Visibility = "public" | "unlisted" | "private";
export type NotificationType =
  | "new_video"
  | "new_subscriber"
  | "new_comment"
  | "video_liked";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          avatar_url: string | null;
          banner_url: string | null;
          bio: string | null;
          is_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name?: string | null;
          avatar_url?: string | null;
          banner_url?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      videos: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          thumbnail_url: string | null;
          video_url: string;
          duration: number;
          visibility: Visibility;
          views_count: number;
          likes_count: number;
          is_removed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          thumbnail_url?: string | null;
          video_url: string;
          duration?: number;
          visibility?: Visibility;
          views_count?: number;
          likes_count?: number;
          is_removed?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
        Relationships: [];
      };
      video_views: {
        Row: {
          id: string;
          video_id: string;
          user_id: string | null;
          watched_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id?: string | null;
          watched_seconds?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["video_views"]["Insert"]>;
        Relationships: [];
      };
      video_likes: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["video_likes"]["Insert"]>;
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          subscriber_id: string;
          creator_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscriber_id: string;
          creator_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Insert"]>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["comments"]["Insert"]>;
        Relationships: [];
      };
      comment_replies: {
        Row: {
          id: string;
          comment_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          comment_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["comment_replies"]["Insert"]
        >;
        Relationships: [];
      };
      watch_history: {
        Row: {
          id: string;
          user_id: string;
          video_id: string;
          watched_seconds: number;
          last_watched_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          video_id: string;
          watched_seconds?: number;
          last_watched_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["watch_history"]["Insert"]
        >;
        Relationships: [];
      };
      playlists: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["playlists"]["Insert"]>;
        Relationships: [];
      };
      playlist_videos: {
        Row: {
          id: string;
          playlist_id: string;
          video_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          playlist_id: string;
          video_id: string;
          position?: number;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["playlist_videos"]["Insert"]
        >;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: NotificationType;
          payload: Json;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: NotificationType;
          payload?: Json;
          is_read?: boolean;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["notifications"]["Insert"]
        >;
        Relationships: [];
      };
      tags: {
        Row: { id: string; name: string };
        Insert: { id?: string; name: string };
        Update: Partial<{ id: string; name: string }>;
        Relationships: [];
      };
      video_tags: {
        Row: { id: string; video_id: string; tag_id: string };
        Insert: { id?: string; video_id: string; tag_id: string };
        Update: Partial<{ id: string; video_id: string; tag_id: string }>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_video_views: {
        Args: { p_video_id: string };
        Returns: undefined;
      };
      toggle_video_like: {
        Args: { p_video_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      visibility: Visibility;
      notification_type: NotificationType;
    };
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
