import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 1234567 -> "1.2M". Compact view/subscriber counts. */
export function formatCompact(value: number | null | undefined): string {
  const n = value ?? 0;
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

/** Seconds -> "1:02:05" or "4:09". */
export function formatDuration(totalSeconds: number | null | undefined): string {
  const s = Math.max(0, Math.floor(totalSeconds ?? 0));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "views" pluralization helper. */
export function pluralize(count: number, word: string): string {
  return `${formatCompact(count)} ${word}${count === 1 ? "" : "s"}`;
}
