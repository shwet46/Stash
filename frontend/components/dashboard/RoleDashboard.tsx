"use client";
import { useSession } from "next-auth/react";
import AdminDashboard from "./AdminDashboard";
import WorkerDashboardView from "./WorkerDashboardView";

export default function RoleDashboard() {
  const { data: session, status } = useSession();
  const role = ((session?.user as any)?.role || "").toLowerCase();

  if (status === "loading") {
    return (
      <div className="dashboard-wrapper">
        <div className="role-loading">
          <div className="role-loading-spinner" />
          <p className="role-loading-text">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (role === "owner" || role === "admin") return <AdminDashboard />;
  return <WorkerDashboardView />;
}
