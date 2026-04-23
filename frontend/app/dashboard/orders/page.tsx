"use client";
import { useState } from "react";
import { LuSearch as Search, LuPlus as Plus, LuDownload as Download, LuEye as Eye } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const ordersData = [
  { id: "STH-4832", buyer: "Mehta & Sons", phone: "+91 98765 43210", product: "Basmati Rice", qty: "500 kg", amount: 62500, status: "pending", date: "2026-04-23", delivery: "2026-04-28" },
  { id: "STH-4831", buyer: "Sharma Stores", phone: "+91 87654 32109", product: "Chana Dal", qty: "200 kg", amount: 24000, status: "dispatched", date: "2026-04-22", delivery: "2026-04-26" },
  { id: "STH-4830", buyer: "Patel Grocers", phone: "+91 76543 21098", product: "Sugar", qty: "300 kg", amount: 13500, status: "delivered", date: "2026-04-21", delivery: "2026-04-24" },
  { id: "STH-4829", buyer: "Kumar Trading", phone: "+91 65432 10987", product: "Wheat Flour", qty: "1000 kg", amount: 35000, status: "dispatched", date: "2026-04-21", delivery: "2026-04-25" },
  { id: "STH-4828", buyer: "Singh & Co.", phone: "+91 54321 09876", product: "Toor Dal", qty: "150 kg", amount: 19500, status: "delivered", date: "2026-04-20", delivery: "2026-04-23" },
  { id: "STH-4827", buyer: "Gupta Traders", phone: "+91 43210 98765", product: "Moong Dal", qty: "250 kg", amount: 27500, status: "delivered", date: "2026-04-20", delivery: "2026-04-23" },
  { id: "STH-4826", buyer: "Reddy Retail", phone: "+91 32109 87654", product: "Groundnut Oil", qty: "200 L", amount: 30000, status: "pending", date: "2026-04-23", delivery: "2026-04-28" },
  { id: "STH-4825", buyer: "Jain Supermart", phone: "+91 21098 76543", product: "Mustard Oil", qty: "150 L", amount: 21000, status: "delivered", date: "2026-04-19", delivery: "2026-04-22" },
  { id: "STH-4824", buyer: "Yadav & Sons", phone: "+91 10987 65432", product: "Basmati Rice", qty: "800 kg", amount: 100000, status: "dispatched", date: "2026-04-22", delivery: "2026-04-27" },
  { id: "STH-4823", buyer: "Chopra Stores", phone: "+91 98712 34567", product: "Tea", qty: "50 kg", amount: 17500, status: "delivered", date: "2026-04-18", delivery: "2026-04-21" },
];

const statusConfig: Record<string, { variant: "warning" | "default" | "success"; label: string }> = {
  pending: { variant: "warning", label: "Pending" },
  dispatched: { variant: "default", label: "Dispatched" },
  delivered: { variant: "success", label: "Delivered" },
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = ordersData.filter((order) => {
    const matchSearch =
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.buyer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Orders</h1>
          <p className="text-sm text-muted mt-1">
            {ordersData.length} orders · Total: ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export
          </Button>
          <Button size="sm" icon={<Plus size={16} />}>
            New Order
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <Input
            placeholder="Search by order ID or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "pending", "dispatched", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-divider text-brand-700 hover:bg-brand-50"
              }`}
            >
              {s === "all" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[12px] border border-divider shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Order Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Est. Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.map((order) => {
                const statusCfg = statusConfig[order.status];
                return (
                  <tr key={order.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-600">{order.id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-brand-800">{order.buyer}</p>
                        <p className="text-xs text-muted">{order.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-brand-700">
                      {order.product} <span className="text-muted">({order.qty})</span>
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-800">
                      ₹{order.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-muted">{order.date}</td>
                    <td className="px-6 py-4 text-muted">{order.delivery}</td>
                    <td className="px-6 py-4">
                      <Badge variant={statusCfg.variant} dot size="sm">
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1.5 rounded-lg hover:bg-brand-50 text-muted hover:text-brand-600 transition-colors cursor-pointer">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
