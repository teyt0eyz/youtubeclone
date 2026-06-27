import { formatDistanceToNowStrict } from "date-fns";

/** "3 days ago" relative date for upload timestamps. */
export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  return `${formatDistanceToNowStrict(d)} ago`;
}
