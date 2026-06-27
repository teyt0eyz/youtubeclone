import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { formatCompact } from "@/lib/utils";
import {
  getVideo,
  getRecommendedVideos,
  getViewerLikeState,
} from "@/features/videos/queries";
import { getResumePosition } from "@/features/history/queries";
import { getSubscriberCount, isSubscribed } from "@/features/subscriptions/queries";
import { getCurrentUser } from "@/lib/auth";
import { VideoPlayer } from "@/features/videos/components/video-player";
import { VideoDescription } from "@/features/videos/components/video-description";
import { RecommendedList } from "@/features/videos/components/recommended-list";
import { LikeButton } from "@/features/likes/components/like-button";
import { ShareButton } from "@/features/videos/components/share-button";
import { SubscribeButton } from "@/features/subscriptions/components/subscribe-button";
import { CommentsSection } from "@/features/comments/components/comments-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video) return { title: "Video not found" };
  return {
    title: video.title,
    description: video.description ?? undefined,
    openGraph: {
      title: video.title,
      description: video.description ?? undefined,
      images: video.thumbnail_url ? [video.thumbnail_url] : undefined,
      type: "video.other",
    },
  };
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideo(id);
  if (!video || video.is_removed) notFound();

  const creator = video.creator;
  const [recommended, liked, resumeAt, user] = await Promise.all([
    getRecommendedVideos(id),
    getViewerLikeState(id),
    getResumePosition(id),
    getCurrentUser(),
  ]);

  const [subCount, subscribed] = creator
    ? await Promise.all([
        getSubscriberCount(creator.id),
        isSubscribed(creator.id),
      ])
    : [0, false];

  const isOwner = user?.id === creator?.id;

  return (
    <div className="mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      {/* Left: player + meta + comments */}
      <div className="min-w-0 space-y-4">
        <VideoPlayer
          src={video.video_url}
          poster={video.thumbnail_url}
          videoId={video.id}
          resumeAt={resumeAt}
        />

        <h1 className="text-xl font-bold leading-tight">{video.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href={creator ? `/channel/${creator.username}` : "#"}>
              <Avatar
                src={creator?.avatar_url}
                alt={creator?.display_name ?? ""}
                size={44}
              />
            </Link>
            <div>
              <Link
                href={creator ? `/channel/${creator.username}` : "#"}
                className="font-medium"
              >
                {creator?.display_name ?? creator?.username ?? "Unknown"}
              </Link>
              <p className="text-xs text-muted-foreground">
                {formatCompact(subCount)} subscribers
              </p>
            </div>
            {creator && !isOwner && (
              <SubscribeButton
                creatorId={creator.id}
                initialSubscribed={subscribed}
                canSubscribe={Boolean(user)}
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <LikeButton
              videoId={video.id}
              initialLiked={liked}
              initialCount={video.likes_count}
            />
            <ShareButton videoId={video.id} />
          </div>
        </div>

        <VideoDescription
          description={video.description}
          views={video.views_count}
          createdAt={video.created_at}
        />

        <CommentsSection videoId={video.id} />
      </div>

      {/* Right: recommendations */}
      <aside className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Up next
        </h2>
        <RecommendedList videos={recommended} />
      </aside>
    </div>
  );
}
