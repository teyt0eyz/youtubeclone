import type { Metadata } from "next";
import { ReelsFeed } from "@/features/videos/components/reels-feed";
import { getReels } from "@/features/videos/queries";

export const metadata: Metadata = { title: "Reels" };

// Always reflect the latest short uploads.
export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  const { items } = await getReels();
  return <ReelsFeed reels={items} />;
}
