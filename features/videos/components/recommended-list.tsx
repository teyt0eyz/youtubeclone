import Link from "next/link";
import { formatCompact, formatDuration } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { VideoThumbnail } from "./video-thumbnail";
import type { VideoWithCreator } from "@/types";

export function RecommendedList({ videos }: { videos: VideoWithCreator[] }) {
  return (
    <div className="flex flex-col gap-2">
      {videos.map((v) => (
        <Link
          key={v.id}
          href={`/watch/${v.id}`}
          className="group flex gap-2 rounded-lg p-1 hover:bg-accent/50"
        >
          <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-muted">
            <VideoThumbnail src={v.thumbnail_url} alt={v.title} />
            {v.duration > 0 && (
              <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[10px] font-medium text-white">
                {formatDuration(v.duration)}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug">
              {v.title}
            </h3>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {v.creator?.display_name ?? v.creator?.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatCompact(v.views_count)} views · {timeAgo(v.created_at)}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
