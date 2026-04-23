import type { Metadata } from "next";
import Sidebar from "@/components/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard — Stash",
  description: "Manage your godown operations from a single dashboard.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface)' }}>
      <Sidebar />
      <main style={{ padding: '1.5rem', transition: 'all 0.3s', marginLeft: '15rem' }}>
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
