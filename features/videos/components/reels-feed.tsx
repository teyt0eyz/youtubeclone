"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  MessageCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatCompact } from "@/lib/utils";
import { getYouTubeId } from "./video-player";
import { VideoThumbnail } from "./video-thumbnail";
import { recordView } from "@/features/videos/actions";
import { toggleLike } from "@/features/likes/actions";
import type { VideoWithCreator } from "@/types";

/**
 * Vertical, full-screen, snap-scrolling short-video feed (YouTube Shorts style).
 * The reel currently in view autoplays; the rest are paused. Mute is global and
 * persists as you swipe, like the real thing.
 */
export function ReelsFeed({ reels }: { reels: VideoWithCreator[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(reels[0]?.id ?? null);
  const [muted, setMuted] = useState(true);
  const viewed = useRef<Set<string>>(new Set());

  // The most-visible reel becomes the active (playing) one.
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && e.intersectionRatio >= 0.6) {
            setActiveId((e.target as HTMLElement).dataset.reelId ?? null);
          }
        }
      },
      { root, threshold: [0.6] },
    );
    root
      .querySelectorAll<HTMLElement>("[data-reel-id]")
      .forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reels]);

  // Count a view the first time each reel becomes active.
  useEffect(() => {
    if (activeId && !viewed.current.has(activeId)) {
      viewed.current.add(activeId);
      void recordView(activeId);
    }
  }, [activeId]);

  if (reels.length === 0) {
    return (
      <p className="py-20 text-center text-muted-foreground">
        No reels yet — short videos (60s or less) show up here.
      </p>
    );
  }

  return (
    <div className="-mb-20 flex justify-center md:mb-0">
      <div
        ref={containerRef}
        className="h-[calc(100dvh-3.5rem-3.5rem)] w-full snap-y snap-mandatory overflow-y-scroll md:h-[calc(100dvh-3.5rem)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reels.map((video) => (
          <Reel
            key={video.id}
            video={video}
            active={video.id === activeId}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
          />
        ))}
      </div>
    </div>
  );
}

function Reel({
  video,
  active,
  muted,
  onToggleMute,
}: {
  video: VideoWithCreator;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const youTubeId = getYouTubeId(video.video_url);

  return (
    <section
      data-reel-id={video.id}
      className="flex h-full w-full snap-start snap-always items-center justify-center"
    >
      <div className="relative h-full w-full max-w-[480px] overflow-hidden bg-black md:my-2 md:h-[calc(100%-1rem)] md:rounded-2xl">
        {youTubeId ? (
          <YouTubeReel
            id={youTubeId}
            active={active}
            muted={muted}
            poster={video.thumbnail_url}
            title={video.title}
          />
        ) : (
          <NativeReel
            src={video.video_url}
            active={active}
            muted={muted}
            poster={video.thumbnail_url}
          />
        )}

        {/* Readability gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />

        <button
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
        >
          {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
        </button>

        <ReelActions video={video} />
        <ReelMeta video={video} />
      </div>
    </section>
  );
}

function NativeReel({
  src,
  active,
  muted,
  poster,
}: {
  src: string;
  active: boolean;
  muted: boolean;
  poster?: string | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) void v.play().catch(() => {});
    else v.pause();
  }, [active]);

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster ?? undefined}
      muted={muted}
      loop
      playsInline
      preload="metadata"
      onClick={(e) => {
        const v = e.currentTarget;
        if (v.paused) void v.play().catch(() => {});
        else v.pause();
      }}
      className="size-full object-cover"
    />
  );
}

function YouTubeReel({
  id,
  active,
  muted,
  poster,
  title,
}: {
  id: string;
  active: boolean;
  muted: boolean;
  poster?: string | null;
  title: string;
}) {
  // Only mount the iframe for the active reel; others show the thumbnail so we
  // never have a dozen YouTube players running at once.
  if (!active) {
    return <VideoThumbnail src={poster} alt={title} className="object-cover" />;
  }

  const params = new URLSearchParams({
    autoplay: "1",
    mute: muted ? "1" : "0",
    playsinline: "1",
    loop: "1",
    playlist: id,
    controls: "0",
    modestbranding: "1",
    rel: "0",
  });

  return (
    <iframe
      // Remount when mute changes so the new `mute` param actually applies.
      key={muted ? "muted" : "unmuted"}
      src={`https://www.youtube.com/embed/${id}?${params.toString()}`}
      title={title}
      allow="autoplay; encrypted-media; picture-in-picture"
      allowFullScreen
      className="size-full"
    />
  );
}

function ReelActions({ video }: { video: VideoWithCreator }) {
  return (
    <div className="absolute bottom-28 right-2 flex flex-col items-center gap-5 text-white">
      <ReelLike videoId={video.id} initialCount={video.likes_count} />
      <Link
        href={`/watch/${video.id}`}
        className="flex flex-col items-center gap-1"
        aria-label="Comments"
      >
        <span className="rounded-full bg-white/15 p-3 backdrop-blur transition-colors hover:bg-white/25">
          <MessageCircle className="size-6" />
        </span>
        <span className="text-xs font-medium">Comments</span>
      </Link>
    </div>
  );
}

function ReelLike({
  videoId,
  initialCount,
}: {
  videoId: string;
  initialCount: number;
}) {
  const [pending, start] = useTransition();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  function onClick() {
    start(async () => {
      const next = !liked;
      setLiked(next);
      setCount((c) => c + (next ? 1 : -1));
      const res = await toggleLike(videoId);
      if (!res.ok) {
        setLiked(!next);
        setCount((c) => c + (next ? -1 : 1));
        toast.error(res.error ?? "Could not update like");
        return;
      }
      setLiked(res.data?.liked ?? next);
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="flex flex-col items-center gap-1"
      aria-pressed={liked}
      aria-label="Like"
    >
      <span className="rounded-full bg-white/15 p-3 backdrop-blur transition-colors hover:bg-white/25">
        <ThumbsUp className={cn("size-6", liked && "fill-current text-primary")} />
      </span>
      <span className="text-xs font-medium">{formatCompact(count)}</span>
    </button>
  );
}

function ReelMeta({ video }: { video: VideoWithCreator }) {
  const creator = video.creator;
  const channelHref = creator ? `/channel/${creator.username}` : "#";

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 pb-6 pr-16 text-white">
      <Link href={channelHref} className="flex items-center gap-2">
        <Avatar
          src={creator?.avatar_url}
          alt={creator?.display_name ?? creator?.username ?? ""}
          size={36}
        />
        <span className="text-sm font-semibold">
          {creator?.display_name ?? creator?.username ?? "Unknown"}
        </span>
      </Link>
      <Link href={`/watch/${video.id}`}>
        <p className="mt-2 line-clamp-2 text-sm">{video.title}</p>
      </Link>
      <p className="mt-1 text-xs text-white/70">
        {formatCompact(video.views_count)} views
      </p>
    </div>
  );
}
