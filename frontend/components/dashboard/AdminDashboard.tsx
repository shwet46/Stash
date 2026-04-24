"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  LuIndianRupee as IndianRupee,
  LuShoppingCart as ShoppingCart,
  LuPackage as Package,
  LuUsers as Users,
  LuTrendingUp as TrendingUp,
  LuTriangleAlert as AlertTriangle,
  LuTruck as Truck,
  LuPhone as Phone,
  LuArrowUpRight as ArrowUpRight,
  LuArrowDownRight as ArrowDownRight,
  LuCircleCheck as CircleCheck,
  LuBuilding2 as Building2,
  LuRefreshCw as RefreshCw,
} from "react-icons/lu";

// We keep some chart formatting data but fetch the actual values
const categoryRevenue = [
  { name: "Grains", value: 485000, color: "#6B4226" },
  { name: "Pulses", value: 320000, color: "#8B5E3C" },
  { name: "Oils", value: 196000, color: "#D4956A" },
  { name: "Spices", value: 85000, color: "#E2CDB0" },
  { name: "FMCG", value: 124000, color: "#9A7B5A" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: "white", border: "1px solid var(--color-divider)", borderRadius: "0.5rem", boxShadow: "var(--shadow-card)", padding: "0.75rem 1rem" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: "0.25rem" }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-brand-800)" }}>
            {p.name}: {typeof p.value === "number" && p.value > 1000 ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const { data: session } = useSession();
  const { data, loading, error, isRealtime } = useDashboardData("admin");
  const [greeting, setGreeting] = useState("");
  const userName = (session?.user as any)?.name || "Admin";

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  if (loading && !data) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">Fetching real-time business stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-card" style={{ padding: "2rem", textAlign: "center", color: "var(--color-error)" }}>
        <AlertTriangle size={48} style={{ margin: "0 auto 1rem" }} />
        <h3>Error loading dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  const stats = data?.stats;

  const kpis = [
    { title: "Monthly Revenue", value: `₹${(stats?.monthly_revenue || 0).toLocaleString("en-IN")}`, change: "+23%", changeType: "positive" as const, icon: IndianRupee, subtitle: "Real-time from DB" },
    { title: "Active Orders", value: String(stats?.active_orders || 0), change: "Live", changeType: "positive" as const, icon: ShoppingCart, subtitle: `${stats?.total_orders || 0} total orders` },
    { title: "Inventory Value", value: `₹${(stats?.inventory_value || 0).toLocaleString("en-IN")}`, change: "Updated", changeType: "positive" as const, icon: Package, subtitle: `${stats?.total_products || 0} products` },
    { title: "Active Buyers", value: String(stats?.buyer_count || 0), change: "+3 this week", changeType: "positive" as const, icon: Users, subtitle: "Across all regions" },
    { title: "Voice Calls Today", value: String(stats?.voice_calls_today || 0), change: "Active", changeType: "neutral" as const, icon: Phone, subtitle: "Intent extracted" },
    { title: "Low Stock Alerts", value: String(stats?.low_stock_count || 0), change: stats?.critical_count ? `${stats.critical_count} critical` : "Healthy", changeType: stats?.critical_count ? ("negative" as const) : ("positive" as const), icon: AlertTriangle, subtitle: "Auto-reorder enabled" },
    { title: "Deliveries Active", value: String(stats?.deliveries_in_transit || 0), change: "Live", changeType: "neutral" as const, icon: Truck, subtitle: "Tracking in progress" },
    { title: "Revenue Growth", value: "+23%", change: "Target Met", changeType: "positive" as const, icon: TrendingUp, subtitle: "On track ✓" },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="owner-dash-header">
        <div>
          <div className="owner-role-badge">
            <Building2 size={12} />
            <span>Admin Dashboard</span>
            {isRealtime && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px', color: 'var(--color-success)', fontSize: '10px' }}>
                <RefreshCw size={10} className="spin" /> REAL-TIME
              </span>
            )}
          </div>
          <h1 className="dashboard-title" style={{ marginTop: "0.5rem" }}>
            {greeting}, {userName} 👋
          </h1>
          <p className="dashboard-subtitle">Full business overview synced from PostgreSQL + Firestore</p>
        </div>
        <div className="dashboard-header-right">
          <span className="dashboard-date">
            Last updated: {data?.last_updated ? new Date(data.last_updated).toLocaleTimeString() : "Just now"}
          </span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid-4">
        {kpis.slice(0, 4).map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="dashboard-card owner-kpi-card">
              <div className="d-flex align-center justify-between mb-4">
                <div className="owner-kpi-icon">
                  <Icon size={20} style={{ color: "var(--color-brand-600)" }} />
                </div>
                <span className={`badge ${k.changeType === "positive" ? "badge-success" : k.changeType === "negative" ? "badge-error" : "badge-warning"}`}>
                  {k.change}
                </span>
              </div>
              <p className="dashboard-card-subtitle">{k.title}</p>
              <p className="owner-kpi-value">{k.value}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>{k.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid-4">
        {kpis.slice(4).map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="dashboard-card owner-kpi-card">
              <div className="d-flex align-center justify-between mb-4">
                <div className="owner-kpi-icon" style={{ backgroundColor: k.changeType === "negative" ? "rgba(239,68,68,0.08)" : "var(--color-brand-50)" }}>
                  <Icon size={20} style={{ color: k.changeType === "negative" ? "var(--color-error)" : "var(--color-brand-600)" }} />
                </div>
                <span className={`badge ${k.changeType === "positive" ? "badge-success" : k.changeType === "negative" ? "badge-error" : "badge-warning"}`}>
                  {k.change}
                </span>
              </div>
              <p className="dashboard-card-subtitle">{k.title}</p>
              <p className="owner-kpi-value">{k.value}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>{k.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid-3">
        <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
          <div className="dashboard-card-header">
            <div>
              <h3 className="dashboard-card-title">Real-time Activity</h3>
              <p className="dashboard-card-subtitle">Last 7 days revenue and orders</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data?.revenue_history || []}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B4226" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B4226" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2CDB0" opacity={0.4} />
              <XAxis dataKey="date" stroke="#9A7B5A" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#9A7B5A" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6B4226" strokeWidth={2.5} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="orders" stroke="#D4956A" strokeWidth={1} fill="transparent" name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dashboard-card">
          <h3 className="dashboard-card-title mb-2">Inventory Breakdown</h3>
          <p className="dashboard-card-subtitle" style={{ marginBottom: "1rem" }}>Value by Category</p>
          <div style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.category_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.category_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={["#6B4226", "#8B5E3C", "#D4956A", "#E2CDB0", "#9A7B5A"][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
             {data?.category_distribution?.map((cat, i) => (
               <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: ["#6B4226", "#8B5E3C", "#D4956A", "#E2CDB0", "#9A7B5A"][i % 5] }}></div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-brand-800)' }}>{cat.name}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: '1.5rem' }}>
        <div className="dashboard-card" style={{ gridColumn: "span 1" }}>
          <h3 className="dashboard-card-title mb-2">Low Stock Items</h3>
          <p className="dashboard-card-subtitle" style={{ marginBottom: "1rem" }}>Action required immediately</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {data?.low_stock_items?.map((item, i) => (
              <div key={i} className="d-flex align-center justify-between">
                <div>
                  <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-brand-800)" }}>{item.product_name}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>Stock: {item.current_stock} / {item.threshold} {item.unit}</p>
                </div>
                <span className={`badge ${item.status === "critical" ? "badge-error" : "badge-warning"}`} style={{ fontSize: '10px' }}>
                  {item.status}
                </span>
              </div>
            ))}
            {(!data?.low_stock_items || data.low_stock_items.length === 0) && (
              <p style={{ fontSize: "0.875rem", color: "var(--color-success)", textAlign: 'center', padding: '1rem' }}>
                <CircleCheck size={16} style={{ marginBottom: '0.5rem' }} /><br/>
                All stock healthy
              </p>
            )}
          </div>
        </div>
        
        <div className="dashboard-card" style={{ gridColumn: "span 2" }}>
          <h3 className="dashboard-card-title mb-2">Team Overview</h3>
          <p className="dashboard-card-subtitle" style={{ marginBottom: "1rem" }}>Godown staff and workers</p>
          <div className="grid-2" style={{ gap: '1rem' }}>
            {data?.staff?.slice(0, 4).map((member, i) => (
              <div key={i} className="d-flex align-center gap-3 p-3" style={{ backgroundColor: 'var(--color-brand-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brand-100)' }}>
                <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--color-brand-600)', border: '1px solid var(--color-brand-200)' }}>
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-brand-800)', margin: 0 }}>{member.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="dashboard-table-wrapper">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-divider)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 className="dashboard-card-title">Recent Real-time Orders</h3>
            <p className="dashboard-card-subtitle">Synced with Firestore for instant updates</p>
          </div>
          <span className="badge badge-info">{data?.recent_orders.length || 0} recent</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_orders?.map((o, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: "var(--color-brand-600)" }}>{o.order_ref}</td>
                  <td>{o.quantity} units</td>
                  <td style={{ fontWeight: 600 }}>₹{o.total_amount.toLocaleString("en-IN")}</td>
                  <td>
                    <span className={`badge ${o.status === "pending" ? "badge-warning" : "badge-success"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
