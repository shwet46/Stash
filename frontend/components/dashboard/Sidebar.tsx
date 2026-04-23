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
  LuWarehouse as Warehouse,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuSettings as Settings,
  LuLogOut as LogOut,
  LuMic as Mic,
  LuRefreshCw as RefreshCw,
  LuSparkles as Sparkles,
} from "react-icons/lu";

type UserRole = "owner" | "admin" | "operator" | "worker";

const menuItems: { icon: any; label: string; href: string; roles: UserRole[] }[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard", roles: ["owner", "admin", "operator", "worker"] },
  { icon: Package, label: "Inventory", href: "/dashboard/inventory", roles: ["owner", "admin", "operator", "worker"] },
  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders", roles: ["owner", "admin", "operator"] },
  { icon: Users, label: "Suppliers", href: "/dashboard/suppliers", roles: ["owner", "admin"] },
  { icon: Truck, label: "Deliveries", href: "/dashboard/deliveries", roles: ["owner", "admin", "operator", "worker"] },
  { icon: Receipt, label: "Billing", href: "/dashboard/billing", roles: ["owner", "admin"] },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", roles: ["owner", "admin"] },
];

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  owner: { label: "Owner", color: "#6B4226", bg: "#f5f1ee" },
  admin: { label: "Admin", color: "#6B4226", bg: "#f5f1ee" },
  operator: { label: "Operator", color: "#4285f4", bg: "rgba(66, 133, 244, 0.08)" },
  worker: { label: "Worker", color: "#34a853", bg: "rgba(52, 168, 83, 0.08)" },
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const rawRole = ((session?.user as any)?.role || "worker").toLowerCase() as UserRole;
  const role = (["owner", "admin", "operator", "worker"].includes(rawRole) ? rawRole : "worker") as UserRole;
  const roleCfg = roleConfig[role];
  const userName = (session?.user as any)?.name || "User";

  const { data: dashData, isRealtime } = useDashboardData(role);
  const filtered = menuItems.filter(item => item.roles.includes(role));

  const getSummaryInfo = () => {
    if (!dashData) return null;
    const d = dashData as any;
    if (role === "owner" || role === "admin") {
      return { label: "Active Orders", value: d.stats?.active_orders || 0, icon: ShoppingCart };
    }
    if (role === "operator") {
      return { label: "Pending Orders", value: d.stats?.pending_orders || 0, icon: RefreshCw };
    }
    if (role === "worker") {
      return { label: "Tasks Left", value: d.stats?.pending_tasks || 0, icon: Sparkles };
    }
    return null;
  };

  const summary = getSummaryInfo();

  // Optimized styles
  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    top: 0,
    height: "100%",
    backgroundColor: "#ffffff",
    borderRight: "1px solid #e8eaed",
    zIndex: 100,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)",
    display: "flex",
    flexDirection: "column",
    width: collapsed ? "5rem" : "16.5rem",
    boxShadow: "4px 0 24px rgba(0,0,0,0.02)",
  };

  const logoContainerStyle: React.CSSProperties = {
    height: "5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    padding: collapsed ? "0" : "0 1.5rem",
    marginBottom: "0.5rem",
  };

  const menuContainerStyle: React.CSSProperties = {
    flex: 1,
    padding: "0 0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem",
    overflowY: "auto",
    overflowX: "hidden",
  };

  return (
    <aside style={sidebarStyle}>
      {/* Logo Section */}
      <div style={logoContainerStyle}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.875rem", textDecoration: "none" }}>
          <div style={{
            width: "2.5rem", height: "2.5rem",
            background: "linear-gradient(135deg, #8B5E3C 0%, #6B4226 100%)",
            borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(107, 66, 38, 0.2)",
            flexShrink: 0
          }}>
            <Warehouse size={20} style={{ color: "white" }} />
          </div>
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "#3d2616", letterSpacing: "-0.02em", lineHeight: 1 }}>Stash</span>
              <span style={{ fontSize: "0.625rem", fontWeight: 600, color: "#8B5E3C", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "0.25rem" }}>Voice-Native SC</span>
            </div>
          )}
        </Link>
      </div>

      {/* User Profile Section */}
      <div style={{
        padding: collapsed ? "0.5rem" : "1rem 1.25rem",
        marginBottom: "1rem",
        display: "flex",
        flexDirection: collapsed ? "column" : "row",
        alignItems: "center",
        gap: "1rem",
        borderBottom: "1px solid rgba(232, 234, 237, 0.5)"
      }}>
        <div style={{
          width: collapsed ? "2.5rem" : "2.75rem",
          height: collapsed ? "2.5rem" : "2.75rem",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #fdfcfb 0%, #f5f1ee 100%)",
          border: "1px solid #eaddd3",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "0.875rem", color: "#6b4226",
          flexShrink: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.03)"
        }}>
          {userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: "0.9375rem", fontWeight: 700, color: "#3d2616",
              margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
            }}>{userName}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.125rem" }}>
              <span style={{
                fontSize: "0.625rem", fontWeight: 700, padding: "0.125rem 0.5rem",
                borderRadius: "9999px", backgroundColor: roleCfg.bg, color: roleCfg.color,
                textTransform: "uppercase", letterSpacing: "0.02em"
              }}>
                {roleCfg.label}
              </span>
              {isRealtime && (
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  backgroundColor: '#34a853', boxShadow: '0 0 8px rgba(52, 168, 83, 0.4)'
                }} title="Real-time connected" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div style={menuContainerStyle}>
        {!collapsed && (
          <p style={{
            fontSize: "0.6875rem", fontWeight: 700, color: "#9aa0a6",
            textTransform: "uppercase", letterSpacing: "0.1em",
            padding: "0.5rem 0.75rem"
          }}>Main Menu</p>
        )}
        {filtered.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: "0.875rem",
                padding: "0.75rem 1rem",
                borderRadius: "1rem",
                fontSize: "0.9375rem",
                fontWeight: isActive ? 700 : 500,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                textDecoration: "none",
                backgroundColor: isActive ? "#6b4226" : "transparent",
                color: isActive ? "#ffffff" : "#54341e",
                boxShadow: isActive ? "0 4px 12px rgba(107, 66, 38, 0.15)" : "none",
                marginBottom: "0.125rem"
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#fdfcfb";
                  e.currentTarget.style.color = "#3d2616";
                  e.currentTarget.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#54341e";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              <Icon size={20} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.7 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer / Summary Section */}
      <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid #e8eaed" }}>
        {!collapsed && summary && (
          <div style={{
            background: "linear-gradient(135deg, #fdfcfb 0%, #f5f1ee 100%)",
            padding: "1rem", borderRadius: "1rem", border: "1px solid #eaddd3",
            marginBottom: "0.75rem"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#8b5e3c" }}>{summary.label}</span>
              <summary.icon size={14} style={{ color: "#8b5e3c" }} />
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.375rem" }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#3d2616" }}>{summary.value}</span>
              <span style={{ fontSize: "0.625rem", color: "#34a853", fontWeight: 700 }}>+ Live</span>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {/* Voice Indicator */}
          {!collapsed && (
             <div style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 1rem", borderRadius: "0.75rem",
                backgroundColor: "rgba(52, 168, 83, 0.05)",
                marginBottom: "0.5rem"
             }}>
                <div style={{
                   width: "1.5rem", height: "1.5rem", borderRadius: "50%",
                   backgroundColor: "rgba(52, 168, 83, 0.1)",
                   display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                   <Mic size={12} style={{ color: "#34a853" }} />
                </div>
                <div style={{ flex: 1 }}>
                   <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#3d2616", margin: 0 }}>Voice Assistant</p>
                   <p style={{ fontSize: "0.625rem", color: "#34a853", margin: 0, fontWeight: 500 }}>Active & Ready</p>
                </div>
             </div>
          )}

          {/* Settings & Logout */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.125rem" }}>
             <button
               onClick={() => signOut({ callbackUrl: "/" })}
               style={{
                 display: "flex", alignItems: "center",
                 justifyContent: collapsed ? "center" : "flex-start",
                 gap: "0.875rem", padding: "0.75rem 1rem", borderRadius: "0.75rem",
                 fontSize: "0.875rem", fontWeight: 600, color: "#d93025",
                 backgroundColor: "transparent", border: "none", cursor: "pointer",
                 transition: "all 0.2s"
               }}
               onMouseEnter={e => e.currentTarget.style.backgroundColor = "rgba(217, 48, 37, 0.05)"}
               onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
             >
               <LogOut size={20} style={{ flexShrink: 0 }} />
               {!collapsed && <span>Sign Out</span>}
             </button>

             <button
               onClick={() => setCollapsed(!collapsed)}
               style={{
                 display: "flex", alignItems: "center",
                 justifyContent: "center", gap: "0.5rem",
                 padding: "0.5rem", marginTop: "0.5rem",
                 color: "#9aa0a6", background: "none", border: "none", cursor: "pointer",
                 transition: "color 0.2s"
               }}
               onMouseEnter={e => e.currentTarget.style.color = "#6b4226"}
               onMouseLeave={e => e.currentTarget.style.color = "#9aa0a6"}
             >
               {collapsed ? <ChevronRight size={20} /> : <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ChevronLeft size={20} /><span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Collapse</span></div>}
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
