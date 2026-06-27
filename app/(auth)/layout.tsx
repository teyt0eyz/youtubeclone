import Link from "next/link";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <Logo />
      </div>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
      <Link
        href="/"
        className="mt-6 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back to browsing
      </Link>
    </div>
  );
}
