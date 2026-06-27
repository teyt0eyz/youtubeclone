import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { PageContainer } from "@/components/page-container";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { searchCreators, searchVideos } from "@/features/search/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `“${q}” — Search` : "Search" };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [videos, creators] = await Promise.all([
    searchVideos(q),
    searchCreators(q),
  ]);

  return (
    <PageContainer>
      <h1 className="mb-6 text-lg text-muted-foreground">
        Results for <span className="font-semibold text-foreground">{q}</span>
      </h1>

      {creators.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Creators
          </h2>
          <div className="flex flex-col divide-y divide-border">
            {creators.map((c) => (
              <Link
                key={c.id}
                href={`/channel/${c.username}`}
                className="flex items-center gap-4 py-3 hover:bg-accent/40"
              >
                <Avatar src={c.avatar_url} alt={c.username} size={56} />
                <div>
                  <p className="font-medium">
                    {c.display_name ?? c.username}
                  </p>
                  <p className="text-xs text-muted-foreground">@{c.username}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        {creators.length > 0 && (
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Videos
          </h2>
        )}
        {videos.length === 0 && creators.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">
            No results for “{q}”. Try different keywords.
          </p>
        ) : (
          <VideoGrid videos={videos} />
        )}
      </section>
    </PageContainer>
  );
}
