import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/page-container";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { getLikedVideos } from "@/features/likes/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Liked videos" };

export default async function LikedPage() {
  const videos = await getLikedVideos();
  return (
    <PageContainer>
      <PageHeader title="Liked videos" description="Videos you've liked" />
      {videos.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          You haven&apos;t liked any videos yet.
        </p>
      ) : (
        <VideoGrid videos={videos} />
      )}
    </PageContainer>
  );
}
