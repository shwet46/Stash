"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  LuLayoutDashboard as LayoutDashboard,
  LuPackage as Package,
  LuShoppingCart as ShoppingCart,
  LuUsers as Users,
  LuTruck as Truck,
  LuReceipt as Receipt,
  LuChartBar as BarChart3,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuSettings as Settings,
  LuLogOut as LogOut,
  LuMic as Mic,
  LuRefreshCw as RefreshCw,
  LuSparkles as Sparkles,
} from "react-icons/lu";
import StashIcon from "../shared/StashIcon";


type UserRole = "admin" | "worker";

const menuItems: { icon: any; label: string; href: string; roles: string[] }[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", roles: ["admin", "worker"] },
  { icon: Package, label: "Inventory", href: "/dashboard/inventory", roles: ["admin", "worker"] },
  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders", roles: ["admin"] },
  { icon: Users, label: "Suppliers", href: "/dashboard/suppliers", roles: ["admin"] },
  { icon: Truck, label: "Deliveries", href: "/dashboard/deliveries", roles: ["admin", "worker"] },
  { icon: Receipt, label: "Billing", href: "/dashboard/billing", roles: ["admin"] },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", roles: ["admin"] },
];

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#6B4226", bg: "#f5f1ee" },
  owner: { label: "Owner", color: "#6B4226", bg: "#f5f1ee" },
  worker: { label: "Worker", color: "#34a853", bg: "rgba(52, 168, 83, 0.08)" },
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const rawRole = ((session?.user as any)?.role || "worker").toLowerCase();
  // Map owner to admin, fallback to worker
  const role = (rawRole === "admin" || rawRole === "owner" ? "admin" : "worker") as UserRole;
  const roleCfg = roleConfig[role] || roleConfig.worker;
  const userName = (session?.user as any)?.name || "User";

  const { data: dashData, isRealtime } = useDashboardData(role);
  const filtered = menuItems.filter(item => item.roles.includes(role));

  const getSummaryInfo = () => {
    if (!dashData) return null;
    const d = dashData as any;
    if (role === "admin") {
      return { label: "Active Orders", value: d.stats?.active_orders || 0, icon: ShoppingCart };
    }
    if (role === "worker") {
      return { label: "Tasks Left", value: d.stats?.pending_tasks || 0, icon: Sparkles };
    }
    return null;
  };

  const summary = getSummaryInfo();

  return (
    <aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
      {/* Logo Section */}
      <div className={`sidebar__logo ${collapsed ? "sidebar__logo--collapsed" : ""}`}>
        <Link href="/dashboard" className="sidebar__brand">
          <div className="sidebar__brand-icon">
            <StashIcon size={20} />
          </div>
          {!collapsed && (
            <div className="sidebar__brand-text">
              <span className="sidebar__brand-title notranslate" translate="no">Stash</span>
              <span className="sidebar__brand-subtitle">Voice-Native SC</span>
            </div>
          )}
        </Link>
      </div>

      {/* User Profile Section */}
      <div className={`sidebar__profile ${collapsed ? "sidebar__profile--collapsed" : ""}`}>
        <div className="sidebar__avatar">
          {userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="sidebar__profile-meta">
            <p className="sidebar__name">{userName}</p>
            <div className="sidebar__meta-row">
              <span className="sidebar__role" style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}>
                {roleCfg.label}
              </span>
              {isRealtime && (
                <span className="sidebar__realtime" title="Real-time connected" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="sidebar__menu">
        {!collapsed && (
          <p className="sidebar__section">Main Menu</p>
        )}
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar__link ${collapsed ? "sidebar__link--collapsed" : ""} ${isActive ? "sidebar__link--active" : ""}`}
            >
              <Icon size={20} className="sidebar__icon" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer / Summary Section */}
      <div className="sidebar__footer">
        {!collapsed && summary && (
          <div className="sidebar__summary">
            <div className="sidebar__summary-head">
              <span className="sidebar__summary-title">{summary.label}</span>
              <summary.icon size={14} className="sidebar__summary-icon" />
            </div>
            <div className="sidebar__summary-value">
              <span className="sidebar__summary-amount">{summary.value}</span>
              <span className="sidebar__summary-tag">+ Live</span>
            </div>
          </div>
        )}

        <div className="sidebar__actions">
          {/* Voice Indicator */}
          {!collapsed && (
            <div className="sidebar__voice">
              <div className="sidebar__voice-icon">
                <Mic size={12} />
              </div>
              <div className="sidebar__voice-meta">
                <p className="sidebar__voice-title">Voice Assistant</p>
                <p className="sidebar__voice-status">Active & Ready</p>
              </div>
            </div>
          )}

          {/* Settings & Logout */}
          <div className="sidebar__actions">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`sidebar__signout ${collapsed ? "sidebar__signout--collapsed" : ""}`}
            >
              <LogOut size={20} />
              {!collapsed && <span>Sign Out</span>}
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="sidebar__collapse"
            >
              {collapsed ? (
                <ChevronRight size={20} />
              ) : (
                <span className="sidebar__collapse-inner">
                  <ChevronLeft size={20} />
                  <span className="sidebar__collapse-label">Collapse</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
