"use client";

import Link from "next/link";
import {
  LogOut,
  User as UserIcon,
  Video,
  BarChart3,
  Shield,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/features/auth/actions";
import type { Profile } from "@/types";

/**
 * Avatar dropdown built on a native <details> element — no portal/focus-trap
 * machinery needed, and it closes on outside click via the backdrop.
 */
export function UserMenu({ profile }: { profile: Profile }) {
  const name = profile.display_name || profile.username;
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center rounded-full outline-none">
        <Avatar src={profile.avatar_url} alt={name} size={36} />
      </summary>

      {/* backdrop to capture outside clicks */}
      <div
        className="fixed inset-0 z-40 hidden group-open:block"
        onClick={(e) =>
          (e.currentTarget.closest("details") as HTMLDetailsElement).removeAttribute(
            "open",
          )
        }
      />

      <div className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-xl">
        <div className="flex items-center gap-3 p-3">
          <Avatar src={profile.avatar_url} alt={name} size={40} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">
              @{profile.username}
            </p>
          </div>
        </div>
        <Separator />
        <nav className="py-1 text-sm">
          <MenuLink href={`/channel/${profile.username}`} icon={UserIcon}>
            Your channel
          </MenuLink>
          <MenuLink href="/studio" icon={Video}>
            Creator Studio
          </MenuLink>
          <MenuLink href="/studio/analytics" icon={BarChart3}>
            Analytics
          </MenuLink>
          {profile.is_admin && (
            <MenuLink href="/admin" icon={Shield}>
              Admin Dashboard
            </MenuLink>
          )}
        </nav>
        <Separator />
        <form action={signOut} className="py-1">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}

function MenuLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent"
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
}
