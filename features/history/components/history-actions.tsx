"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { clearWatchHistory } from "@/features/history/actions";

export function ClearHistoryButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await clearWatchHistory();
          if (res.ok) {
            toast.success("Watch history cleared");
            router.refresh();
          } else {
            toast.error(res.error ?? "Failed");
          }
        })
      }
    >
      <Trash2 className="size-4" />
      Clear all
    </Button>
  );
}
