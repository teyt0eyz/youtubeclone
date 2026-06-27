"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGitHub } from "@/features/auth/actions";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5C5.37.5 0 5.78 0 12.29c0 5.21 3.44 9.63 8.21 11.19.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.33-1.74-1.33-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.8 2.81 1.28 3.5.98.11-.76.42-1.28.76-1.57-2.67-.3-5.47-1.31-5.47-5.82 0-1.29.47-2.34 1.24-3.16-.13-.3-.54-1.52.11-3.17 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.65 1.65.24 2.87.12 3.17.77.82 1.23 1.87 1.23 3.16 0 4.52-2.81 5.51-5.49 5.81.43.36.81 1.08.81 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.21.68.83.56A12.02 12.02 0 0 0 24 12.29C24 5.78 18.63.5 12 .5z" />
    </svg>
  );
}

export function GitHubButton({ next = "/" }: { next?: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() => start(() => signInWithGitHub(next))}
    >
      <GithubIcon className="size-4" />
      Continue with GitHub
    </Button>
  );
}
