import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { PageContainer, PageHeader } from "@/components/page-container";
import { VideoGrid } from "@/features/videos/components/video-grid";
import {
  getMySubscriptions,
  getSubscriptionFeed,
} from "@/features/subscriptions/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage() {
  const [channels, feed] = await Promise.all([
    getMySubscriptions(),
    getSubscriptionFeed(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Subscriptions"
        description="Latest from channels you follow"
      />

      {channels.length > 0 && (
        <div className="mb-8 flex gap-4 overflow-x-auto pb-2">
          {channels.map((c) => (
            <Link
              key={c.id}
              href={`/channel/${c.username}`}
              className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center"
            >
              <Avatar src={c.avatar_url} alt={c.username} size={56} />
              <span className="w-full truncate text-xs">
                {c.display_name ?? c.username}
              </span>
            </Link>
          ))}
        </div>
      )}

      {feed.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p>You&apos;re not subscribed to anyone yet.</p>
          <Link
            href="/creators"
            className="mt-2 inline-block font-medium text-foreground hover:underline"
          >
            Browse creators →
          </Link>
        </div>
      ) : (
        <VideoGrid videos={feed} />
      )}
    </PageContainer>
  );
}
