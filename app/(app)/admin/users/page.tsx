import type { Metadata } from "next";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAllUsers } from "@/features/admin/queries";
import { timeAgo } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Users" };

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="divide-y divide-border">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-3">
            <Avatar src={u.avatar_url} alt={u.username} size={40} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/channel/${u.username}`}
                className="truncate font-medium hover:underline"
              >
                {u.display_name ?? u.username}
              </Link>
              <p className="truncate text-xs text-muted-foreground">
                @{u.username}
              </p>
            </div>
            {u.is_admin && <Badge variant="primary">admin</Badge>}
            <span className="text-xs text-muted-foreground">
              joined {timeAgo(u.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
