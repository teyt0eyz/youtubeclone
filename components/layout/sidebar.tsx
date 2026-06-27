"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Flame,
  Clapperboard,
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
  { href: "/reels", label: "Reels", icon: Clapperboard },
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
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNav = useUIStore((s) => s.setMobileNav);

  const closeMobile = () => setMobileNav(false);

  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 top-14 z-20 bg-black/50 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-14 z-20 h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border bg-background p-3 transition-transform",
          // Mobile: controlled by the drawer state.
          mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop: controlled by the persistent sidebar collapse state.
          sidebarOpen ? "md:translate-x-0" : "md:-translate-x-full",
        )}
      >
        <Section items={PRIMARY} pathname={pathname} onNavigate={closeMobile} />
        <div className="my-3 border-t border-border" />
        <p className="px-3 pb-1 pt-2 text-xs font-semibold text-muted-foreground">
          You
        </p>
        <Section items={YOU} pathname={pathname} onNavigate={closeMobile} />
      </aside>
    </>
  );
}

function Section({
  items,
  pathname,
  onNavigate,
}: {
  items: { href: string; label: string; icon: React.ElementType }[];
  pathname: string;
  onNavigate: () => void;
}) {
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
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
