"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatCompact } from "@/lib/utils";
import { toggleLike } from "@/features/likes/actions";

export function LikeButton({
  videoId,
  initialLiked,
  initialCount,
}: {
  videoId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [state, setOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (prev, liked: boolean) => ({
      liked,
      count: prev.count + (liked ? 1 : -1),
    }),
  );

  function onClick() {
    start(async () => {
      setOptimistic(!state.liked);
      const res = await toggleLike(videoId);
      if (!res.ok) {
        toast.error(res.error ?? "Could not update like");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={pending}
      aria-pressed={state.liked}
    >
      <ThumbsUp
        className={cn("size-4", state.liked && "fill-current text-primary")}
      />
      {formatCompact(state.count)}
    </Button>
  );
}
