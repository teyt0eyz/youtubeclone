import { VideoCard } from "./video-card";
import type { VideoWithCreator } from "@/types";

export function VideoGrid({ videos }: { videos: VideoWithCreator[] }) {
  if (videos.length === 0) {
    return (
      <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
        No videos here yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} />
      ))}
    </div>
  );
}
