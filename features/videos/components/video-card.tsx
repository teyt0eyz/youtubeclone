import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { formatCompact, formatDuration } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { VideoThumbnail } from "./video-thumbnail";
import type { VideoWithCreator } from "@/types";

export function VideoCard({ video }: { video: VideoWithCreator }) {
  const creator = video.creator;
  const channelHref = creator ? `/channel/${creator.username}` : "#";

  return (
    <div className="group flex flex-col gap-3">
      <Link
        href={`/watch/${video.id}`}
        className="relative block aspect-video overflow-hidden rounded-xl bg-muted"
      >
        <VideoThumbnail
          src={video.thumbnail_url}
          alt={video.title}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        {video.duration > 0 && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {formatDuration(video.duration)}
          </span>
        )}
      </Link>

      <div className="flex gap-3">
        <Link href={channelHref} className="mt-0.5 shrink-0">
          <Avatar
            src={creator?.avatar_url}
            alt={creator?.display_name ?? creator?.username ?? ""}
            size={36}
          />
        </Link>
        <div className="min-w-0">
          <Link href={`/watch/${video.id}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
              {video.title}
            </h3>
          </Link>
          <Link
            href={channelHref}
            className="mt-1 block truncate text-sm text-muted-foreground hover:text-foreground"
          >
            {creator?.display_name ?? creator?.username ?? "Unknown"}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            {formatCompact(video.views_count)} views · {timeAgo(video.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
