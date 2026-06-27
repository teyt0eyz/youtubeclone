import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  /** size in px */
  size?: number;
  className?: string;
}

/** Lightweight avatar with initials fallback (no Radix). */
export function Avatar({ src, alt = "", size = 40, className }: AvatarProps) {
  const initials = (alt || "?")
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-muted-foreground",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
}
