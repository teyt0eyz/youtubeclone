import { PageContainer } from "@/components/page-container";
import { VideoGridSkeleton } from "@/features/videos/components/video-card-skeleton";

export default function Loading() {
  return (
    <PageContainer>
      <VideoGridSkeleton count={12} />
    </PageContainer>
  );
}
