"use client";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

/** Shifts the main content to the right of the sidebar on desktop. */
export function MainContent({ children }: { children: React.ReactNode }) {
  const open = useUIStore((s) => s.sidebarOpen);
  return (
    <main
      className={cn(
        "min-h-[calc(100dvh-3.5rem)] pb-20 transition-[margin] md:pb-0",
        open ? "md:ml-60" : "md:ml-0",
      )}
    >
      {children}
    </main>
  );
}
