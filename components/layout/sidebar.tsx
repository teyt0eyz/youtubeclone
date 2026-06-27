"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flame,
  ListVideo,
  History,
  ThumbsUp,
  Users,
  Video,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

const PRIMARY = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/subscriptions", label: "Subscriptions", icon: ListVideo },
];

const YOU = [
  { href: "/history", label: "History", icon: History },
  { href: "/liked", label: "Liked Videos", icon: ThumbsUp },
  { href: "/studio", label: "Your Videos", icon: Video },
  { href: "/creators", label: "Creators", icon: Users },
  { href: "/upload", label: "Upload", icon: UploadCloud },
];

export function Sidebar() {
  const pathname = usePathname();
  const open = useUIStore((s) => s.sidebarOpen);
  const setSidebar = useUIStore((s) => s.setSidebar);

  return (
    <>
      {/* Mobile drawer backdrop */}
      {open && (
        <div
          className="fixed inset-0 top-14 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebar(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-20 h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border bg-background p-3 transition-transform",
          open ? "translate-x-0" : "-translate-x-full md:hidden",
        )}
      >
        <Section items={PRIMARY} pathname={pathname} />
        <div className="my-3 border-t border-border" />
        <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground">
          You
        </p>
        <Section items={YOU} pathname={pathname} />
      </aside>
    </>
  );
}

function Section({
  items,
  pathname,
}: {
  items: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-4 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-foreground hover:bg-accent/60",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
