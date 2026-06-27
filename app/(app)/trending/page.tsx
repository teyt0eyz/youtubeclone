import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/page-container";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { getTrendingVideos } from "@/features/videos/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Trending",
  description: "The most-watched videos right now.",
};

export default async function TrendingPage() {
  const { items } = await getTrendingVideos();
  return (
    <PageContainer>
      <PageHeader
        title="Trending"
        description="Most-watched videos from the last 30 days"
      />
      <VideoGrid videos={items} />
    </PageContainer>
  );
}
