import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/page-container";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { timeAgo } from "@/lib/format";
import type { Notification } from "@/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notifications" };

const LABELS: Record<string, string> = {
  new_video: "New video from a channel you follow",
  new_subscriber: "You have a new subscriber",
  new_comment: "New comment on your video",
  video_liked: "Someone liked your video",
};

export default async function NotificationsPage() {
  await requireUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const notifications = (data ?? []) as Notification[];

  return (
    <PageContainer className="max-w-2xl">
      <PageHeader title="Notifications" />
      {notifications.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          You&apos;re all caught up.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-4">
              <span className="mt-0.5 flex size-9 items-center justify-center rounded-full bg-secondary">
                <Bell className="size-4" />
              </span>
              <div className="flex-1">
                <p className="text-sm">{LABELS[n.type] ?? n.type}</p>
                <p className="text-xs text-muted-foreground">
                  {timeAgo(n.created_at)}
                </p>
              </div>
              {!n.is_read && (
                <span className="mt-2 size-2 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
