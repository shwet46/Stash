"use client";
import { useState, useEffect } from "react";
import { LuPackage as Package, LuShoppingCart as ShoppingCart, LuTrendingUp as TrendingUp, LuUsers as Users, LuPhone as Phone, LuTriangleAlert as AlertTriangle, LuIndianRupee as IndianRupee, LuTruck as Truck } from 'react-icons/lu';
import StatCard from "@/components/dashboard/StatCard";
import AlertCard from "@/components/dashboard/AlertCard";
import SalesChart from "@/components/dashboard/SalesChart";
import TopProductsChart from "@/components/dashboard/TopProductsChart";
import SupplierTable from "@/components/dashboard/SupplierTable";

const stats = [
  {
    title: "Total Inventory Value",
    value: "₹18,45,000",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Package,
    subtitle: "Across 5 godowns",
  },
  {
    title: "Active Orders",
    value: "47",
    change: "+8 today",
    changeType: "positive" as const,
    icon: ShoppingCart,
    subtitle: "15 pending dispatch",
  },
  {
    title: "Monthly Revenue",
    value: "₹12,80,000",
    change: "+23%",
    changeType: "positive" as const,
    icon: IndianRupee,
    subtitle: "vs ₹10,40,000 last month",
  },
  {
    title: "Voice Calls Today",
    value: "23",
    change: "3 active",
    changeType: "neutral" as const,
    icon: Phone,
    subtitle: "Avg. duration: 45s",
  },
];

const alerts = [
  {
    type: "error" as const,
    title: "Low Stock Alert",
    message: "Sugar stock at 45 kg — below threshold (100 kg). Auto-reorder triggered.",
    time: "5m ago",
  },
  {
    type: "warning" as const,
    title: "Payment Overdue",
    message: "Rajesh Kumar — ₹45,000 overdue by 3 days. Telegram reminder sent.",
    time: "1h ago",
  },
  {
    type: "success" as const,
    title: "Order Delivered",
    message: "Order #STH-4821 — 200 kg Basmati Rice delivered to Mehta & Sons.",
    time: "2h ago",
  },
  {
    type: "info" as const,
    title: "AI Prediction",
    message: "Chana Dal demand predicted to spike 35% next week. Consider pre-ordering.",
    time: "3h ago",
  },
];

const recentOrders = [
  { id: "STH-4832", buyer: "Mehta & Sons", product: "Basmati Rice", qty: "500 kg", amount: "₹62,500", status: "pending" },
  { id: "STH-4831", buyer: "Sharma Stores", product: "Chana Dal", qty: "200 kg", amount: "₹24,000", status: "dispatched" },
  { id: "STH-4830", buyer: "Patel Grocers", product: "Sugar", qty: "300 kg", amount: "₹13,500", status: "delivered" },
  { id: "STH-4829", buyer: "Kumar Trading", product: "Wheat Flour", qty: "1000 kg", amount: "₹35,000", status: "dispatched" },
  { id: "STH-4828", buyer: "Singh & Co.", product: "Toor Dal", qty: "150 kg", amount: "₹19,500", status: "delivered" },
];

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-warning",
  dispatched: "bg-blue-50 text-blue-600",
  delivered: "bg-green-50 text-success",
};

export default function DashboardPage() {
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");
  }, []);

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            {greeting}, Shweta 👋
          </h1>
          <p className="dashboard-subtitle">
            Here&apos;s what&apos;s happening with your godowns today.
          </p>
        </div>
        <div className="dashboard-header-right">
          <span className="dashboard-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid-2">
        <SalesChart />
        <TopProductsChart />
      </div>

      {/* Alerts and Recent Orders */}
      <div className="grid-3">
        {/* Alerts */}
        <div style={{ gridColumn: "span 1" }}>
          <div className="dashboard-card">
            <div className="dashboard-card-header mb-4">
              <h3 className="dashboard-card-title">
                Live Alerts
              </h3>
              <span className="d-flex align-center gap-2 text-xs text-muted">
                <AlertTriangle size={12} />
                {alerts.length} active
              </span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert, i) => (
                <AlertCard key={i} {...alert} />
              ))}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div style={{ gridColumn: "span 2" }}>
          <div className="dashboard-table-wrapper" style={{ marginTop: 0 }}>
            <div className="d-flex align-center justify-between" style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
              <div>
                <h3 className="dashboard-card-title">
                  Recent Orders
                </h3>
                <p className="dashboard-card-subtitle">Latest order activity</p>
              </div>
              <a
                href="/dashboard/orders"
                className="text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                View All →
              </a>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>
                      Order ID
                    </th>
                    <th>
                      Buyer
                    </th>
                    <th>
                      Product
                    </th>
                    <th>
                      Amount
                    </th>
                    <th>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: 'var(--color-brand-600)' }}>
                        {order.id}
                      </td>
                      <td style={{ color: 'var(--color-brand-800)' }}>
                        {order.buyer}
                      </td>
                      <td style={{ color: 'var(--color-brand-700)' }}>
                        {order.product}
                        <span className="text-muted ml-1" style={{ marginLeft: '0.25rem' }}>({order.qty})</span>
                      </td>
                      <td style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>
                        {order.amount}
                      </td>
                      <td>
                        <span className={`badge ${order.status === 'delivered' ? 'badge-success' : order.status === 'dispatched' ? 'badge-info' : 'badge-warning'}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Table */}
      <SupplierTable />
    </div>
  );
}
