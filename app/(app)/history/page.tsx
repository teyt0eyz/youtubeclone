import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/page-container";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { getWatchHistory } from "@/features/history/queries";
import { ClearHistoryButton } from "@/features/history/components/history-actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Watch history" };

export default async function HistoryPage() {
  const history = await getWatchHistory();
  const videos = history.map((h) => h.video);

  return (
    <PageContainer>
      <PageHeader
        title="Watch history"
        description="Pick up where you left off"
        action={history.length > 0 ? <ClearHistoryButton /> : undefined}
      />
      {videos.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          Nothing watched yet. Videos you watch will show up here.
        </p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </PageContainer>
  );
}
