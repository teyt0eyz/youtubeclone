"use client";

import Link from "next/link";
import { Menu, Upload, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { useUIStore } from "@/stores/ui-store";
import type { Profile } from "@/types";

export function Navbar({ profile }: { profile: Profile | null }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-2 backdrop-blur sm:px-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle menu"
          onClick={toggleSidebar}
          className="hidden md:inline-flex"
        >
          <Menu className="size-5" />
        </Button>
        <Logo />
      </div>

      <div className="mx-auto hidden w-full max-w-xl px-4 sm:block">
        <SearchBar />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {profile ? (
          <>
            <Button asChild variant="secondary" className="hidden sm:inline-flex">
              <Link href="/upload">
                <Upload className="size-4" />
                <span>Upload</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              aria-label="Notifications"
            >
              <Link href="/notifications">
                <Bell className="size-5" />
              </Link>
            </Button>
            <UserMenu profile={profile} />
          </>
        ) : (
          <>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
