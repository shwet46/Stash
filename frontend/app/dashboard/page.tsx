"use client";
import dynamic from "next/dynamic";

const RoleDashboard = dynamic(() => import("@/components/dashboard/RoleDashboard"), { ssr: false });

export default function DashboardPage() {
  return <RoleDashboard />;
}
