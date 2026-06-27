import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Avatar } from "@/components/ui/avatar";
import { PageContainer, PageHeader } from "@/components/page-container";
import { getCreators } from "@/features/creators/queries";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Browse creators" };

export default async function CreatorsPage() {
  const creators = await getCreators();
  return (
    <PageContainer>
      <PageHeader title="Creators" description="Discover channels to follow" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {creators.map((c) => (
          <Link
            key={c.id}
            href={`/channel/${c.username}`}
            className="group overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="relative h-20 bg-muted">
              {c.banner_url && (
                <Image src={c.banner_url} alt="" fill className="object-cover" />
              )}
            </div>
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <Avatar
                src={c.avatar_url}
                alt={c.username}
                size={64}
                className="-mt-10 border-4 border-card"
              />
              <p className="font-medium">{c.display_name ?? c.username}</p>
              <p className="text-xs text-muted-foreground">@{c.username}</p>
            </div>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
