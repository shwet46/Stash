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
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Orders</h1>
          <p className="dashboard-subtitle">
            {ordersData.length} orders · Total: ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export
          </Button>
          <Button size="sm" icon={<Plus size={16} />}>
            New Order
          </Button>
        </div>
      </div>

      <div className="d-flex align-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '24rem' }}>
          <Input
            placeholder="Search by order ID or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="d-flex align-center gap-2">
          {["all", "pending", "dispatched", "delivered"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.375rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'colors 0.2s',
                border: statusFilter === s ? '1px solid var(--color-brand-600)' : '1px solid var(--color-divider)',
                backgroundColor: statusFilter === s ? 'var(--color-brand-600)' : 'white',
                color: statusFilter === s ? 'white' : 'var(--color-brand-700)'
              }}
            >
              {s === "all" ? "All Orders" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="dashboard-table-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Order Date</th>
                <th>Est. Delivery</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const statusCfg = statusConfig[order.status];
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-brand-600)' }}>{order.id}</td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{order.buyer}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{order.phone}</p>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-brand-700)' }}>
                      {order.product} <span className="text-muted">({order.qty})</span>
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>
                      ₹{order.amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ color: 'var(--color-muted)' }}>{order.date}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{order.delivery}</td>
                    <td>
                      <Badge variant={statusCfg.variant} dot size="sm">
                        {statusCfg.label}
                      </Badge>
                    </td>
                    <td>
                      <button style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
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
