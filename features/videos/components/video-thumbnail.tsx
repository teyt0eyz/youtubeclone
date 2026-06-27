"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Thumbnail that degrades to a placeholder when the image 404s (common for
 * YouTube live streams or removed videos). Uses a plain <img> on purpose so a
 * broken remote URL never throws in the Next.js image optimizer.
 */
export function VideoThumbnail({
  src,
  alt,
  className,
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
        className={cn("size-full object-cover", className)}
      />
    );
  }

  return (
    <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
      <Play className="size-10" />
    </div>
  );
}
