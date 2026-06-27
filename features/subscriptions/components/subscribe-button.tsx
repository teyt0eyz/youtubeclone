"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleSubscription } from "@/features/subscriptions/actions";

export function SubscribeButton({
  creatorId,
  initialSubscribed,
  canSubscribe = true,
}: {
  creatorId: string;
  initialSubscribed: boolean;
  /** False when viewing your own channel or signed out. */
  canSubscribe?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [subscribed, setSubscribed] = useOptimistic(initialSubscribed);

  function onClick() {
    if (!canSubscribe) {
      router.push("/login");
      return;
    }
    start(async () => {
      setSubscribed(!subscribed);
      const res = await toggleSubscription(creatorId, subscribed);
      if (!res.ok) {
        toast.error(res.error ?? "Could not update subscription");
        return;
      }
      router.refresh();
    });
  }

  return (
    <Button
      onClick={onClick}
      disabled={pending}
      variant={subscribed ? "secondary" : "default"}
      className={cn(subscribed && "text-foreground")}
    >
      {subscribed ? "Subscribed" : "Subscribe"}
    </Button>
  );
}
