"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail, signUpWithEmail } from "@/features/auth/actions";

export function AuthForm({
  mode,
  next = "/",
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isLogin = mode === "login";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const action = isLogin ? signInWithEmail : signUpWithEmail;
      const res = await action({ email, password });
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong");
        return;
      }
      if (isLogin) {
        toast.success("Welcome back!");
        router.push(next);
        router.refresh();
      } else {
        toast.success("Check your email to confirm your account.");
        router.push("/login");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link
          href={isLogin ? "/signup" : "/login"}
          className="font-medium text-foreground hover:underline"
        >
          {isLogin ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
