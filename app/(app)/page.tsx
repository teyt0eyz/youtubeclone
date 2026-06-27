import { PageContainer } from "@/components/page-container";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { CategoryChips } from "@/features/videos/components/category-chips";
import { getVideos, getVideosByCategory } from "@/features/videos/queries";

// Always reflect the latest uploads.
export const dynamic = "force-dynamic";

const CHIPS = [
  "All",
  "Music",
  "Gaming",
  "Coding",
  "Live",
  "Education",
  "Podcasts",
  "Travel",
  "News",
  "Comedy",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const active = category?.toLowerCase() ?? "all";

  const { items } =
    active === "all"
      ? await getVideos()
      : await getVideosByCategory(active);

  return (
    <PageContainer>
      <CategoryChips chips={CHIPS} active={active} />

      {items.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">
          No videos in “{category}” yet.
        </p>
      ) : (
        <VideoGrid videos={items} />
      )}
    </PageContainer>
  );
}
