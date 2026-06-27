import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/page-container";
import { UploadForm } from "@/features/videos/components/upload-form";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Upload" };

export default async function UploadPage() {
  await requireUser();
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader
        title="Upload a video"
        description="Share your video with the world"
      />
      <UploadForm />
    </PageContainer>
  );
}
