"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCompact, formatDuration } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { deleteVideo, updateVideo } from "@/features/videos/actions";
import { VideoThumbnail } from "./video-thumbnail";
import type { VideoWithCreator } from "@/types";

export function StudioVideoRow({ video }: { video: VideoWithCreator }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(video.title);

  function save() {
    start(async () => {
      const res = await updateVideo({ id: video.id, title });
      if (res.ok) {
        toast.success("Saved");
        setEditing(false);
        router.refresh();
      } else {
        toast.error(res.error ?? "Failed");
      }
    });
  }

  function remove() {
    if (!confirm("Delete this video permanently?")) return;
    start(async () => {
      const res = await deleteVideo(video.id);
      if (res.ok) {
        toast.success("Video deleted");
        router.refresh();
      } else {
        toast.error(res.error ?? "Failed");
      }
    });
  }

  return (
    <div className="flex items-center gap-4 py-3">
      <Link
        href={`/watch/${video.id}`}
        className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-muted"
      >
        <VideoThumbnail src={video.thumbnail_url} alt={video.title} />
        {video.duration > 0 && (
          <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] text-white">
            {formatDuration(video.duration)}
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
            />
            <Button size="icon" variant="ghost" onClick={save} disabled={pending}>
              <Check className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setTitle(video.title);
              }}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <p className="truncate font-medium">{video.title}</p>
        )}
        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={video.visibility === "public" ? "primary" : "default"}>
            {video.visibility}
          </Badge>
          <span>{formatCompact(video.views_count)} views</span>
          <span>·</span>
          <span>{formatCompact(video.likes_count)} likes</span>
          <span>·</span>
          <span>{timeAgo(video.created_at)}</span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!editing && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label="Edit"
          >
            <Pencil className="size-4" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          onClick={remove}
          disabled={pending}
          aria-label="Delete"
          className="text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
