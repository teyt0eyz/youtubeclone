import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { MainContent } from "@/components/layout/app-shell";
import { getCurrentProfile } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="min-h-dvh">
      <Navbar profile={profile} />
      <Sidebar />
      <MainContent>{children}</MainContent>
      <MobileNav />
    </div>
  );
}
