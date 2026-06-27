"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, UploadCloud, ListVideo, History } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/trending", label: "Trending", icon: Flame },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/subscriptions", label: "Subs", icon: ListVideo },
  { href: "/history", label: "History", icon: History },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-border bg-background md:hidden">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 text-[10px]",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
