"use client";

import Link, { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Renders inside a <Link>; `useLinkStatus` flips `pending` while that link's
 * navigation is in flight, giving the tapped chip an immediate loading cue.
 */
function ChipLabel({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <span className="inline-flex items-center gap-1.5" aria-busy={pending}>
      {pending && <Loader2 className="size-3.5 animate-spin" />}
      {label}
    </span>
  );
}

export function CategoryChips({
  chips,
  active,
}: {
  chips: string[];
  active: string;
}) {
  return (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {chips.map((chip) => {
        const value = chip.toLowerCase();
        const isActive = value === active;
        return (
          <Link
            key={chip}
            href={value === "all" ? "/" : `/?category=${value}`}
            scroll={false}
            className={cn(
              "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-foreground text-background"
                : "bg-secondary text-secondary-foreground hover:bg-accent",
            )}
          >
            <ChipLabel label={chip} />
          </Link>
        );
      })}
    </div>
  );
}
