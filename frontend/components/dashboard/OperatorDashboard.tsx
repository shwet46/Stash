"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LuPackage as Package,
  LuShoppingCart as ShoppingCart,
  LuTruck as Truck,
  LuTriangleAlert as AlertTriangle,
  LuPlus as Plus,
  LuArrowUpRight as ArrowUpRight,
  LuCircleCheck as CircleCheck,
  LuClock as Clock,
  LuRefreshCw as RefreshCw,
  LuScanBarcode as ScanBarcode,
} from "react-icons/lu";
import Button from "@/components/ui/Button";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "white", border: "1px solid var(--color-divider)", borderRadius: "0.5rem", padding: "0.75rem 1rem", boxShadow: "var(--shadow-card)" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: "0.25rem" }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-brand-800)" }}>
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function OperatorDashboard() {
  const { data: session } = useSession();
  const { data, loading, error, isRealtime } = useDashboardData("operator");
  const [greeting, setGreeting] = useState("");
  const userName = (session?.user as any)?.name || "Operator";

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  if (loading && !data) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">Loading operational data...</p>
      </div>
    );
  }

  const stats = data?.stats;

  const quickStats = [
    { title: "Pending Orders", value: String(stats?.pending_orders || 0), icon: ShoppingCart, color: "var(--color-warning)", bg: "rgba(245,158,11,0.08)", badge: "Action needed", badgeType: "warning" as const },
    { title: "Low/Critical Stock", value: String((stats?.low_stock || 0) + (stats?.critical_stock || 0)), icon: AlertTriangle, color: "var(--color-error)", bg: "rgba(239,68,68,0.08)", badge: stats?.critical_stock ? `${stats.critical_stock} critical` : "Check inventory", badgeType: "error" as const },
    { title: "Active Deliveries", value: String(stats?.active_deliveries || 0), icon: Truck, color: "#3B82F6", bg: "rgba(59,130,246,0.08)", badge: "Real-time", badgeType: "info" as const },
    { title: "Total Products", value: String(stats?.total_products || 0), icon: Package, color: "var(--color-success)", bg: "rgba(16,185,129,0.08)", badge: "Catalog", badgeType: "success" as const },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <div className="owner-role-badge" style={{ backgroundColor: "rgba(59,130,246,0.08)", color: "#3B82F6" }}>
            <RefreshCw size={12} className={isRealtime ? "spin" : ""} />
            <span>Operator Dashboard {isRealtime && "• LIVE"}</span>
          </div>
          <h1 className="dashboard-title" style={{ marginTop: "0.5rem" }}>
            {greeting}, {userName} 👋
          </h1>
          <p className="dashboard-subtitle">Managing daily inventory and order flow</p>
        </div>
        <div className="dashboard-header-right">
          <Button size="sm" icon={<Plus size={16} />}>New Order</Button>
          <Button size="sm" variant="outline" icon={<ScanBarcode size={16} />}>Scan Stock</Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-4">
        {quickStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="dashboard-card operator-stat-card">
              <div className="d-flex align-center justify-between mb-4">
                <div style={{ width: "2.75rem", height: "2.75rem", backgroundColor: s.bg, borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={22} style={{ color: s.color }} />
                </div>
                <span className={`badge badge-${s.badgeType}`}>
                  {s.badge}
                </span>
              </div>
              <p className="dashboard-card-subtitle">{s.title}</p>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-brand-800)", marginTop: "0.25rem" }}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Pending Orders + Deliveries */}
      <div className="grid-3">
        <div style={{ gridColumn: "span 2" }}>
          <div className="dashboard-table-wrapper" style={{ marginTop: 0 }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-divider)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 className="dashboard-card-title">Active Orders</h3>
                <p className="dashboard-card-subtitle">Require immediate processing</p>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Qty</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Expected</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.pending_orders?.map((o, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "var(--color-brand-600)" }}>{o.order_ref}</td>
                      <td>{o.quantity} units</td>
                      <td style={{ fontWeight: 600 }}>₹{o.total_amount.toLocaleString("en-IN")}</td>
                      <td>
                        <span className={`badge ${o.status === "pending" ? "badge-warning" : "badge-info"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{o.estimated_delivery || "TBD"}</td>
                    </tr>
                  ))}
                  {(!data?.pending_orders || data.pending_orders.length === 0) && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
                        No pending orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="dashboard-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--color-divider)" }}>
              <h3 className="dashboard-card-title">Stock Alerts</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {data?.alert_stock?.map((s, i) => (
                <div key={i} style={{ padding: "1rem 1.25rem", borderBottom: i < data.alert_stock.length - 1 ? "1px solid var(--color-divider)" : "none" }}>
                  <div className="d-flex align-center justify-between">
                    <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{s.product_name}</span>
                    <span className={`badge ${s.status === "critical" ? "badge-error" : "badge-warning"}`} style={{ fontSize: '10px' }}>
                      {s.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
                    Current: {s.current_stock} / Threshold: {s.threshold} {s.unit}
                  </p>
                </div>
              ))}
              {(!data?.alert_stock || data.alert_stock.length === 0) && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-success)' }}>
                  <CircleCheck size={24} style={{ margin: '0 auto 0.5rem' }} />
                  <p style={{ fontSize: '0.8rem' }}>All stock levels healthy</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deliveries */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">
          <h3 className="dashboard-card-title">Active Deliveries (Live Tracking)</h3>
        </div>
        <div className="grid-3" style={{ gap: '1rem' }}>
          {data?.active_deliveries?.map((d, i) => (
            <div key={i} style={{ border: "1px solid var(--color-divider)", borderRadius: '0.5rem', padding: '1rem' }}>
              <div className="d-flex align-center justify-between mb-2">
                <span style={{ fontWeight: 700, color: 'var(--color-brand-600)' }}>{d.status.toUpperCase()}</span>
                <Clock size={14} style={{ color: 'var(--color-muted)' }} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-brand-800)', fontWeight: 500 }}>{d.note || "Shipment in transit"}</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--color-muted)', marginTop: '0.5rem' }}>
                Updated: {new Date(d.updated_at).toLocaleTimeString()}
              </p>
            </div>
          ))}
          {(!data?.active_deliveries || data.active_deliveries.length === 0) && (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
              No active deliveries tracked right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
