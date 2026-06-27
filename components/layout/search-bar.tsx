"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
      }}
    >
      <div className="flex items-center">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search videos and creators"
          aria-label="Search"
          className="h-10 rounded-l-full rounded-r-none border-r-0 pl-4"
        />
        <Button
          type="submit"
          variant="secondary"
          size="icon"
          aria-label="Search"
          className="h-10 rounded-l-none rounded-r-full px-5"
        >
          <Search className="size-4" />
        </Button>
      </div>
    </form>
  );
}
