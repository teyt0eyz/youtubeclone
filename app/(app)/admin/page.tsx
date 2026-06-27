import type { Metadata } from "next";
import { Users, Video, Eye, MessageSquare } from "lucide-react";
import { getAdminStats } from "@/features/admin/queries";
import { StatCard } from "@/features/admin/components/stat-card";
import { formatCompact } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon={Users} label="Users" value={formatCompact(stats.users)} />
      <StatCard icon={Video} label="Videos" value={formatCompact(stats.videos)} />
      <StatCard icon={Eye} label="Total views" value={formatCompact(stats.views)} />
      <StatCard
        icon={MessageSquare}
        label="Comments"
        value={formatCompact(stats.comments)}
      />
    </div>
  );
}
