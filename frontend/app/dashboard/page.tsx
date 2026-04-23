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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">
            {greeting}, Shweta 👋
          </h1>
          <p className="text-muted text-sm mt-1">
            Here&apos;s what&apos;s happening with your godowns today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted">
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
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SalesChart />
        <TopProductsChart />
      </div>

      {/* Alerts and Recent Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alerts */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[12px] border border-divider shadow-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brand-800">
                Live Alerts
              </h3>
              <span className="flex items-center gap-1 text-xs text-muted">
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
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[12px] border border-divider shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-divider flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-brand-800">
                  Recent Orders
                </h3>
                <p className="text-sm text-muted">Latest order activity</p>
              </div>
              <a
                href="/dashboard/orders"
                className="text-sm text-brand-600 font-medium hover:text-brand-700"
              >
                View All →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider">
                  {recentOrders.map((order, i) => (
                    <tr
                      key={i}
                      className="hover:bg-brand-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-brand-600">
                        {order.id}
                      </td>
                      <td className="px-6 py-3 text-brand-800">
                        {order.buyer}
                      </td>
                      <td className="px-6 py-3 text-brand-700">
                        {order.product}
                        <span className="text-muted ml-1">({order.qty})</span>
                      </td>
                      <td className="px-6 py-3 font-medium text-brand-800">
                        {order.amount}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}
                        >
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
