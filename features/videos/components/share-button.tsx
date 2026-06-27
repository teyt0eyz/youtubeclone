"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ShareButton({ videoId }: { videoId: string }) {
  async function onClick() {
    const url = `${window.location.origin}/watch/${videoId}`;
    try {
      if (navigator.share) {
        await navigator.share({ url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  }
  return (
    <Button variant="secondary" onClick={onClick}>
      <Share2 className="size-4" />
      Share
    </Button>
  );
}
