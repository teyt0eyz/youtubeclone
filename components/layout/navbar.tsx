"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Upload, Bell, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";
import { SearchBar } from "./search-bar";
import { UserMenu } from "./user-menu";
import { useUIStore } from "@/stores/ui-store";
import type { Profile } from "@/types";

export function Navbar({ profile }: { profile: Profile | null }) {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleMobileNav = useUIStore((s) => s.toggleMobileNav);
  const [searchOpen, setSearchOpen] = useState(false);

  // One hamburger button drives the desktop sidebar collapse and the mobile
  // drawer, picking the right one for the current viewport at click time.
  function onMenu() {
    if (window.matchMedia("(min-width: 768px)").matches) toggleSidebar();
    else toggleMobileNav();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-2 backdrop-blur sm:px-4">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle menu"
          onClick={onMenu}
        >
          <Menu className="size-5" />
        </Button>
        <Logo />
      </div>

      {/* Desktop / tablet inline search */}
      <div className="mx-auto hidden w-full max-w-xl px-4 sm:block">
        <SearchBar />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        {/* Mobile-only search trigger */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
          className="sm:hidden"
        >
          <Search className="size-5" />
        </Button>

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

      {/* Mobile full-width search overlay */}
      {searchOpen && (
        <div className="absolute inset-0 z-40 flex items-center gap-2 bg-background px-2 sm:hidden">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <SearchBar
            className="flex-1"
            autoFocus
            onSubmitted={() => setSearchOpen(false)}
          />
        </div>
      )}
    </header>
  );
}
