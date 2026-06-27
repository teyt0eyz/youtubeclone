import type { Metadata } from "next";
import { ShieldAlert } from "lucide-react";

export const metadata: Metadata = { title: "Admin · Reports" };

export default function AdminReportsPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-24 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <p className="font-medium">No open reports</p>
      <p className="max-w-sm text-sm text-muted-foreground">
        Content reports submitted by viewers will appear here for moderation.
        Wire a <code className="text-xs">reports</code> table to enable the
        full flow.
      </p>
    </div>
  );
}
