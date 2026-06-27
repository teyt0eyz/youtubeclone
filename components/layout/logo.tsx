import Link from "next/link";
import { Play } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5 font-semibold">
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary">
        <Play className="size-4 fill-primary-foreground text-primary-foreground" />
      </span>
      <span className="text-lg tracking-tight">{APP_NAME}</span>
    </Link>
  );
}
