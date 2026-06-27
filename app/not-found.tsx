import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-6xl font-black text-primary">404</p>
      <h1 className="text-xl font-semibold">This page doesn&apos;t exist</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The video or channel you&apos;re looking for may have been removed or
        made private.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
