import { notFound } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/page-container";
import { getCreatorByUsername } from "@/features/creators/queries";
import { getCreatorVideos } from "@/features/videos/queries";
import { VideoGrid } from "@/features/videos/components/video-grid";

export default async function ChannelVideosPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) notFound();
  const { items } = await getCreatorVideos(creator.id);

  return (
    <PageContainer>
      <PageHeader
        title={`${creator.display_name ?? creator.username} — Videos`}
        description={`${creator.video_count} videos`}
      />
      <VideoGrid videos={items} />
    </PageContainer>
  );
}
