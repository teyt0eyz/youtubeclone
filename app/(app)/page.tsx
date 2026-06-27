import Link from "next/link";
import { PageContainer } from "@/components/page-container";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { getVideos, getVideosByCategory } from "@/features/videos/queries";
import { cn } from "@/lib/utils";

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
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map((chip) => {
          const value = chip.toLowerCase();
          const isActive = value === active;
          return (
            <Link
              key={chip}
              href={value === "all" ? "/" : `/?category=${value}`}
              scroll={false}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-foreground text-background"
                  : "bg-secondary text-secondary-foreground hover:bg-accent",
              )}
            >
              {chip}
            </Link>
          );
        })}
      </div>

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
