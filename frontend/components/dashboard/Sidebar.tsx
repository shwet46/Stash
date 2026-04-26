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
  LuHistory as History,
  LuChevronLeft as ChevronLeft,
  LuChevronRight as ChevronRight,
  LuSettings as Settings,
  LuLogOut as LogOut,
  LuMic as Mic,
  LuRefreshCw as RefreshCw,
  LuSparkles as Sparkles,
  LuCircleUser as UserCircle,
  LuArrowLeftRight as Barter,
  LuTrendingUp as Forecast,
} from "react-icons/lu";
import StashIcon from "../shared/StashIcon";
import Modal from "../ui/Modal";
import { useLanguage } from "@/contexts/LanguageContext";


type UserRole = "admin" | "worker";

const menuSections: { title: string; items: { icon: any; label: string; href: string; roles: string[] }[] }[] = [
  {
    title: "Main",
    items: [
      { icon: LayoutDashboard, label: "Overview", href: "/dashboard", roles: ["admin", "worker"] },
      { icon: Package, label: "Inventory", href: "/dashboard/inventory", roles: ["admin", "worker"] },
      { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders", roles: ["admin"] },
      { icon: Users, label: "Suppliers", href: "/dashboard/suppliers", roles: ["admin"] },
      { icon: Truck, label: "Deliveries", href: "/dashboard/deliveries", roles: ["admin", "worker"] },
    ]
  },
  {
    title: "Business",
    items: [
      { icon: Receipt, label: "Billing", href: "/dashboard/billing", roles: ["admin"] },
      { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", roles: ["admin"] },
      { icon: UserCircle, label: "Customers", href: "/dashboard/customers", roles: ["admin"] },
    ]
  },
  {
    title: "AI Intelligence",
    items: [
      { icon: Barter, label: "Bartering", href: "/dashboard/bartering", roles: ["admin"] },
      { icon: Forecast, label: "Forecasting", href: "/dashboard/forecasting", roles: ["admin"] },
      { icon: History, label: "Recent Activities", href: "/dashboard/activities", roles: ["admin", "worker"] },
    ]
  }
];

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Admin", color: "#6B4226", bg: "#f5f1ee" },
  owner: { label: "Owner", color: "#6B4226", bg: "#f5f1ee" },
  worker: { label: "Worker", color: "#34a853", bg: "rgba(52, 168, 83, 0.08)" },
};

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const { data: session } = useSession();
  const rawRole = ((session?.user as any)?.role || "worker").toLowerCase();
  // Map owner to admin, fallback to worker
  const role = (rawRole === "admin" || rawRole === "owner" ? "admin" : "worker") as UserRole;
  const roleCfg = roleConfig[role] || roleConfig.worker;
  const userName = (session?.user as any)?.name || "User";
  const userEmail = session?.user?.email || "No email available";
  const userPhone = (session?.user as any)?.phone || "+91 XXXXXXXXXX";

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { data: dashData, isRealtime } = useDashboardData(role);

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
            </div>
          )}
        </Link>

        {!collapsed && (
          <div className="sidebar__lang-wrapper">
            <span className={`sidebar__lang-label ${lang === "en" ? "sidebar__lang-label--active" : ""}`}>EN</span>
            <button 
              className="sidebar__lang-switch"
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              aria-label="Toggle language"
            >
              <div className={`sidebar__lang-dot ${lang === "hi" ? "sidebar__lang-dot--right" : ""}`} />
            </button>
            <span className={`sidebar__lang-label ${lang === "hi" ? "sidebar__lang-label--active" : ""}`}>हि</span>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div 
        className={`sidebar__profile ${collapsed ? "sidebar__profile--collapsed" : ""}`}
        onClick={() => setIsProfileModalOpen(true)}
        style={{ cursor: "pointer" }}
        title="View Profile Details"
      >
        <div className="sidebar__avatar">
          {userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
        </div>
        {!collapsed && (
          <div className="sidebar__profile-meta">
            <p className="sidebar__name">{userName}</p>
            <div className="sidebar__meta-row">
              {isRealtime && (
                <span className="sidebar__realtime" title="Real-time connected" />
              )}
              <span className="sidebar__role" style={{ backgroundColor: roleCfg.bg, color: roleCfg.color }}>
                {t(roleCfg.label)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="sidebar__menu">
        {menuSections.map((section) => {
          const filteredItems = section.items.filter(item => item.roles.includes(role));
          if (filteredItems.length === 0) return null;

          return (
            <div key={section.title} className="sidebar__menu-section">
              {!collapsed && (
                <p className="sidebar__section">{t(section.title)}</p>
              )}
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar__link ${collapsed ? "sidebar__link--collapsed" : ""} ${isActive ? "sidebar__link--active" : ""}`}
                  >
                    <Icon size={20} className="sidebar__icon" />
                    {!collapsed && <span>{t(item.label)}</span>}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / Summary Section */}
      <div className="sidebar__footer">


        <div className="sidebar__actions">
          {/* Settings & Logout */}
          <div className="sidebar__actions">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`sidebar__signout ${collapsed ? "sidebar__signout--collapsed" : ""}`}
            >
              <LogOut size={20} />
              {!collapsed && <span>{t("Sign Out")}</span>}
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
                  <span className="sidebar__collapse-label">{t("Collapse")}</span>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title={t("Profile Details")}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '4rem', 
              height: '4rem', 
              backgroundColor: 'var(--color-brand-100)', 
              color: 'var(--color-brand-700)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.5rem', 
              fontWeight: 'bold' 
            }}>
              {userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-brand-800)', margin: 0 }}>
                {userName}
              </h3>
              <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem', margin: 0 }}>
                {t(userEmail)}
              </p>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '1rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{t("System Role")}</span>
              <span style={{ 
                backgroundColor: roleCfg.bg, 
                color: roleCfg.color, 
                padding: '0.25rem 0.625rem', 
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 700 
              }}>
                {t(roleCfg.label)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem' }}>
              <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{t("Phone")}</span>
              <span style={{ color: 'var(--color-brand-700)', fontSize: '0.875rem', fontWeight: 600 }}>{userPhone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{t("Account Status")}</span>
              <span style={{ color: 'var(--color-success)', fontSize: '0.875rem', fontWeight: 600 }}>{t("Active")}</span>
            </div>
          </div>
        </div>
      </Modal>
    </aside>
  );
}
