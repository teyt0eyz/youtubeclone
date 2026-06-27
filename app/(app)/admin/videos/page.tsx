import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getAllVideos } from "@/features/admin/queries";
import { ModerationToggle } from "@/features/admin/components/moderation-toggle";
import { formatCompact } from "@/lib/utils";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Videos" };

export default async function AdminVideosPage() {
  const videos = await getAllVideos();
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="divide-y divide-border">
        {videos.map((v) => (
          <div key={v.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <Link
                href={`/watch/${v.id}`}
                className="truncate font-medium hover:underline"
              >
                {v.title}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                {v.creator?.display_name ?? v.creator?.username} ·{" "}
                {formatCompact(v.views_count)} views · {timeAgo(v.created_at)}
              </p>
            </div>
            {v.is_removed && <Badge variant="outline">removed</Badge>}
            <ModerationToggle videoId={v.id} removed={v.is_removed} />
          </div>
        ))}
      </div>
    </div>
  );
}
