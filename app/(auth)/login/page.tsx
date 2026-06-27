import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { AuthForm } from "@/features/auth/components/auth-form";
import { GitHubButton } from "@/features/auth/components/oauth-buttons";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next = "/" } = await searchParams;
  if (await getCurrentUser()) redirect(next);

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue watching
        </p>
      </div>
      <GitHubButton next={next} />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">OR</span>
        <Separator className="flex-1" />
      </div>
      <AuthForm mode="login" next={next} />
    </div>
  );
}
