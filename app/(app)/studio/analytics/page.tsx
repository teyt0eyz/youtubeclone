import type { Metadata } from "next";
import { Eye, ThumbsUp, Video as VideoIcon, TrendingUp } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/page-container";
import { getMyVideos } from "@/features/videos/queries";
import { requireUser } from "@/lib/auth";
import { formatCompact } from "@/lib/utils";
import { StatCard } from "@/features/admin/components/stat-card";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage() {
  await requireUser();
  const videos = await getMyVideos();

  const totalViews = videos.reduce((s, v) => s + v.views_count, 0);
  const totalLikes = videos.reduce((s, v) => s + v.likes_count, 0);
  const top = [...videos]
    .sort((a, b) => b.views_count - a.views_count)
    .slice(0, 5);

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="Channel analytics"
        description="How your content is performing"
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Eye} label="Total views" value={formatCompact(totalViews)} />
        <StatCard
          icon={ThumbsUp}
          label="Total likes"
          value={formatCompact(totalLikes)}
        />
        <StatCard
          icon={VideoIcon}
          label="Videos"
          value={String(videos.length)}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg. views"
          value={formatCompact(
            videos.length ? Math.round(totalViews / videos.length) : 0,
          )}
        />
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Top videos</h2>
      <div className="divide-y divide-border rounded-xl border border-border">
        {top.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No data yet.</p>
        )}
        {top.map((v, i) => (
          <div key={v.id} className="flex items-center gap-4 p-4">
            <span className="w-6 text-center text-lg font-bold text-muted-foreground">
              {i + 1}
            </span>
            <p className="min-w-0 flex-1 truncate font-medium">{v.title}</p>
            <span className="text-sm text-muted-foreground">
              {formatCompact(v.views_count)} views
            </span>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
