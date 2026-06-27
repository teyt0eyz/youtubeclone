import type { Metadata } from "next";
import Link from "next/link";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageContainer, PageHeader } from "@/components/page-container";
import { getMyVideos } from "@/features/videos/queries";
import { requireUser } from "@/lib/auth";
import { StudioVideoRow } from "@/features/videos/components/studio-video-row";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Creator Studio" };

export default async function StudioPage() {
  await requireUser();
  const videos = await getMyVideos();

  return (
    <PageContainer className="max-w-5xl">
      <PageHeader
        title="Creator Studio"
        description="Manage your uploads"
        action={
          <Button asChild>
            <Link href="/upload">
              <UploadCloud className="size-4" />
              Upload
            </Link>
          </Button>
        }
      />

      {videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
          You haven&apos;t uploaded anything yet.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border px-4">
          {videos.map((v) => (
            <StudioVideoRow key={v.id} video={v} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
