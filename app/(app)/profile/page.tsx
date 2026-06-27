import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageContainer, PageHeader } from "@/components/page-container";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { ProfileForm } from "@/features/profile/components/profile-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/profile");

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader
        title="Your profile"
        description="Manage how others see you"
        action={
          <Button asChild variant="outline">
            <Link href={`/channel/${profile.username}`}>View channel</Link>
          </Button>
        }
      />
      <ProfileForm profile={profile} />
    </PageContainer>
  );
}
