import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { formatCompact } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getCreatorByUsername } from "@/features/creators/queries";
import { getCreatorVideos } from "@/features/videos/queries";
import { getCurrentUser } from "@/lib/auth";
import { VideoGrid } from "@/features/videos/components/video-grid";
import { SubscribeButton } from "@/features/subscriptions/components/subscribe-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) return { title: "Channel not found" };
  const name = creator.display_name ?? creator.username;
  return {
    title: name,
    description: creator.bio ?? `${name}'s channel`,
    openGraph: {
      title: name,
      images: creator.banner_url ? [creator.banner_url] : undefined,
    },
  };
}

export default async function ChannelPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const creator = await getCreatorByUsername(username);
  if (!creator) notFound();

  const [{ items: videos }, user] = await Promise.all([
    getCreatorVideos(creator.id),
    getCurrentUser(),
  ]);
  const isOwner = user?.id === creator.id;
  const name = creator.display_name ?? creator.username;

  return (
    <div className="mx-auto w-full max-w-[1600px]">
      {/* Banner */}
      <div className="relative h-32 w-full bg-muted sm:h-44 lg:h-56">
        {creator.banner_url && (
          <Image
            src={creator.banner_url}
            alt=""
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      <div className="px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-end">
          <Avatar
            src={creator.avatar_url}
            alt={name}
            size={112}
            className="-mt-12 border-4 border-background sm:-mt-16"
          />
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-sm text-muted-foreground">
              @{creator.username} · {formatCompact(creator.subscriber_count)}{" "}
              subscribers · {creator.video_count} videos
            </p>
            {creator.bio && (
              <p className="mt-1 line-clamp-1 max-w-2xl text-sm text-muted-foreground">
                {creator.bio}
              </p>
            )}
          </div>
          {!isOwner && (
            <SubscribeButton
              creatorId={creator.id}
              initialSubscribed={creator.is_subscribed}
              canSubscribe={Boolean(user)}
            />
          )}
        </div>

        <Tabs defaultValue="videos">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="playlists">Playlists</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <VideoGrid videos={videos} />
          </TabsContent>

          <TabsContent value="playlists">
            <p className="py-10 text-center text-sm text-muted-foreground">
              No public playlists yet.
            </p>
          </TabsContent>

          <TabsContent value="about">
            <div className="max-w-2xl space-y-3 text-sm">
              <p className="whitespace-pre-wrap">
                {creator.bio || "This creator hasn't written a bio yet."}
              </p>
              <p className="text-muted-foreground">
                {formatCompact(creator.subscriber_count)} subscribers ·{" "}
                {creator.video_count} videos
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
