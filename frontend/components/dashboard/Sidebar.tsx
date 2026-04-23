"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LuLayoutDashboard as LayoutDashboard, LuPackage as Package, LuShoppingCart as ShoppingCart, LuUsers as Users, LuTruck as Truck, LuReceipt as Receipt, LuChartBar as BarChart3, LuWarehouse as Warehouse, LuChevronLeft as ChevronLeft, LuChevronRight as ChevronRight, LuPhone as Phone, LuSettings as Settings, LuLogOut as LogOut } from 'react-icons/lu';

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", roles: ["ADMIN", "OPERATOR"] },
  { icon: Package, label: "Inventory", href: "/dashboard/inventory", roles: ["ADMIN", "OPERATOR"] },
  { icon: ShoppingCart, label: "Orders", href: "/dashboard/orders", roles: ["ADMIN", "OPERATOR"] },
  { icon: Users, label: "Suppliers", href: "/dashboard/suppliers", roles: ["ADMIN"] },
  { icon: Truck, label: "Deliveries", href: "/dashboard/deliveries", roles: ["ADMIN", "OPERATOR"] },
  { icon: Receipt, label: "Billing", href: "/dashboard/billing", roles: ["ADMIN"] },
  { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics", roles: ["ADMIN"] },
];

const bottomItems = [
  { icon: Settings, label: "Settings", href: "#", action: null },
  { icon: LogOut, label: "Logout", href: "#", action: "logout" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role || "OPERATOR";

  return (
    <aside
      style={{ position: 'fixed', left: 0, top: 0, height: '100%', backgroundColor: 'white', borderRight: '1px solid var(--color-divider)', zIndex: 30, transition: 'all 0.3s', display: 'flex', flexDirection: 'column', width: collapsed ? '4rem' : '15rem' }}
    >
      {/* Logo */}
      <div style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '0 1rem', borderBottom: '1px solid var(--color-divider)' }}>
        {!collapsed && (
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <div style={{ width: '2rem', height: '2rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Warehouse size={18} style={{ color: 'white' }} />
            </div>
            <span className="notranslate" translate="no" style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-brand-600)' }}>Stash</span>
          </Link>
        )}
        {collapsed && (
          <div style={{ width: '2rem', height: '2rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Warehouse size={18} style={{ color: 'white' }} />
          </div>
        )}
      </div>

      {/* Menu items */}
      <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {menuItems.filter(item => item.roles.includes(role)).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s', textDecoration: 'none', backgroundColor: isActive ? 'var(--color-brand-600)' : 'transparent', color: isActive ? 'white' : 'var(--color-brand-700)', boxShadow: isActive ? 'var(--shadow-card)' : 'none' }}
              title={collapsed ? item.label : undefined}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'var(--color-brand-50)'; } }}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <Icon
                size={20}
                style={{ flexShrink: 0, color: isActive ? 'white' : 'var(--color-muted)' }}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div style={{ padding: '0.5rem', borderTop: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {/* Call logs shortcut */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <div style={{ width: '2rem', height: '2rem', backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={16} style={{ color: 'var(--color-success)' }} />
          </div>
          {!collapsed && (
            <div>
              <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-brand-800)', margin: 0 }}>Voice Active</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-success)', margin: 0 }}>3 calls today</p>
            </div>
          )}
        </div>

        {bottomItems.map((item) => {
          const Icon = item.icon;
          if (item.action === "logout") {
            return (
              <button
                key={item.label}
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--color-error)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'colors 0.2s' }}
                title={collapsed ? item.label : undefined}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', color: 'var(--color-muted)', textDecoration: 'none', transition: 'colors 0.2s' }}
              title={collapsed ? item.label : undefined}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-brand-50)'; e.currentTarget.style.color = 'var(--color-brand-700)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-muted)'; }}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0', color: 'var(--color-muted)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', transition: 'colors 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-brand-600)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-muted)'; }}
        >
          {collapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>
    </aside>
  );
}
