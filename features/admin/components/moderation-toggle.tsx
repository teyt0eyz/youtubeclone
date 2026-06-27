"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminRemoveVideo } from "@/features/admin/actions";

export function ModerationToggle({
  videoId,
  removed,
}: {
  videoId: string;
  removed: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant={removed ? "secondary" : "destructive"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await adminRemoveVideo(videoId, !removed);
          if (res.ok) {
            toast.success(removed ? "Restored" : "Removed");
            router.refresh();
          } else {
            toast.error(res.error ?? "Failed");
          }
        })
      }
    >
      {removed ? "Restore" : "Remove"}
    </Button>
  );
}
