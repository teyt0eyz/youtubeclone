"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/features/videos/actions";
import { addWatchHistory } from "@/features/history/actions";

/** Extract a YouTube video id from any common YouTube URL shape. */
export function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] ?? null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] ?? null;
    }
  } catch {
    /* not a URL */
  }
  return null;
}

// ---- Minimal typings for the YouTube IFrame API -------------------------
interface YTPlayer {
  getCurrentTime?: () => number;
  destroy?: () => void;
}
interface YTNamespace {
  Player: new (el: Element, opts: Record<string, unknown>) => YTPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Load the YouTube IFrame API once and resolve when YT.Player is ready. */
async function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") throw new Error("server");
  if (!document.getElementById("youtube-iframe-api")) {
    const s = document.createElement("script");
    s.id = "youtube-iframe-api";
    s.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(s);
  }
  while (!(window.YT && window.YT.Player)) await sleep(50);
  return window.YT;
}

/** YouTube embed that tracks real progress via the IFrame API. */
function YouTubePlayer({
  youTubeId,
  videoId,
  resumeAt,
}: {
  youTubeId: string;
  videoId: string;
  resumeAt: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let player: YTPlayer | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;
    let viewed = false;
    let lastSaved = 0;
    let destroyed = false;

    // YT.Player replaces its target node with an <iframe>. Give it a div we
    // create imperatively (not one React reconciles) so unmounting never hits
    // a "removeChild" crash. React only ever owns the wrapper below.
    const wrapper = wrapperRef.current;
    const host = document.createElement("div");
    host.className = "size-full";
    wrapper?.appendChild(host);

    const currentTime = () =>
      Math.floor(player?.getCurrentTime?.() ?? 0);

    const save = () => {
      const t = currentTime();
      if (t > 0) void addWatchHistory({ videoId, watchedSeconds: t });
    };

    loadYouTubeApi()
      .then((YT) => {
        if (destroyed) return;
        player = new YT.Player(host, {
          width: "100%",
          height: "100%",
          videoId: youTubeId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            start: Math.max(0, Math.floor(resumeAt)),
          },
          events: {
            onStateChange: (e: { data: number }) => {
              if (e.data === YT.PlayerState.PLAYING) {
                if (!viewed) {
                  viewed = true;
                  void recordView(videoId, currentTime());
                }
                if (interval) clearInterval(interval);
                interval = setInterval(() => {
                  const t = currentTime();
                  if (t - lastSaved >= 10) {
                    lastSaved = t;
                    void addWatchHistory({ videoId, watchedSeconds: t });
                  }
                }, 5000);
              } else if (
                e.data === YT.PlayerState.PAUSED ||
                e.data === YT.PlayerState.ENDED
              ) {
                if (interval) clearInterval(interval);
                save();
              }
            },
          },
        });
      })
      .catch(() => {
        /* API failed to load — embed simply won't track progress */
      });

    return () => {
      destroyed = true;
      if (interval) clearInterval(interval);
      save();
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
      // Drop any imperative DOM YT left behind; React keeps owning the wrapper.
      if (wrapper) wrapper.innerHTML = "";
    };
  }, [youTubeId, videoId, resumeAt]);

  return (
    <div
      ref={wrapperRef}
      className="aspect-video w-full overflow-hidden rounded-xl bg-black"
    />
  );
}

/**
 * Plays a video and records views + watch history.
 * YouTube links use the IFrame API; direct files use a native <video>.
 */
export function VideoPlayer({
  src,
  poster,
  videoId,
  resumeAt = 0,
}: {
  src: string;
  poster?: string | null;
  videoId: string;
  resumeAt?: number;
}) {
  const youTubeId = getYouTubeId(src);
  const viewed = useRef(false);
  const lastSaved = useRef(0);

  useEffect(() => {
    viewed.current = false;
    lastSaved.current = 0;
  }, [videoId]);

  if (youTubeId) {
    return (
      <YouTubePlayer
        youTubeId={youTubeId}
        videoId={videoId}
        resumeAt={resumeAt}
      />
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <video
        key={videoId}
        src={src}
        poster={poster ?? undefined}
        controls
        playsInline
        preload="metadata"
        className="size-full"
        onLoadedMetadata={(e) => {
          const el = e.currentTarget;
          if (resumeAt > 0 && resumeAt < el.duration) {
            el.currentTime = resumeAt;
          }
        }}
        onPlay={(e) => {
          if (!viewed.current) {
            viewed.current = true;
            void recordView(videoId, e.currentTarget.currentTime);
          }
        }}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (t - lastSaved.current >= 10) {
            lastSaved.current = t;
            void addWatchHistory({ videoId, watchedSeconds: Math.floor(t) });
          }
        }}
        onEnded={(e) => {
          void addWatchHistory({
            videoId,
            watchedSeconds: Math.floor(e.currentTarget.currentTime),
          });
        }}
      />
    </div>
  );
}
