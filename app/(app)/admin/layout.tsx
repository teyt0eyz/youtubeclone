import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/videos", label: "Videos" },
  { href: "/admin/reports", label: "Reports" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side admin gate — redirects non-admins.
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin</h1>
        <nav className="mt-3 flex gap-4 border-b border-border">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="border-b-2 border-transparent pb-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
