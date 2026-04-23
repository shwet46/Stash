"use client";
import { useState } from "react";
import { LuSearch as Search, LuDownload as Download, LuFileText as FileText, LuIndianRupee as IndianRupee, LuEye as Eye, LuSend as Send } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const billsData = [
  { id: "INV-2401", orderRef: "STH-4830", buyer: "Patel Grocers", amount: 13500, gstRate: 5, gstAmount: 675, total: 14175, status: "paid", date: "2026-04-21" },
  { id: "INV-2402", orderRef: "STH-4828", buyer: "Singh & Co.", amount: 19500, gstRate: 5, gstAmount: 975, total: 20475, status: "paid", date: "2026-04-20" },
  { id: "INV-2403", orderRef: "STH-4831", buyer: "Sharma Stores", amount: 24000, gstRate: 5, gstAmount: 1200, total: 25200, status: "pending", date: "2026-04-22" },
  { id: "INV-2404", orderRef: "STH-4832", buyer: "Mehta & Sons", amount: 62500, gstRate: 5, gstAmount: 3125, total: 65625, status: "pending", date: "2026-04-23" },
  { id: "INV-2405", orderRef: "STH-4829", buyer: "Kumar Trading", amount: 35000, gstRate: 5, gstAmount: 1750, total: 36750, status: "overdue", date: "2026-04-21" },
  { id: "INV-2406", orderRef: "STH-4827", buyer: "Gupta Traders", amount: 27500, gstRate: 5, gstAmount: 1375, total: 28875, status: "paid", date: "2026-04-20" },
  { id: "INV-2407", orderRef: "STH-4826", buyer: "Reddy Retail", amount: 30000, gstRate: 12, gstAmount: 3600, total: 33600, status: "pending", date: "2026-04-23" },
  { id: "INV-2408", orderRef: "STH-4825", buyer: "Jain Supermart", amount: 21000, gstRate: 12, gstAmount: 2520, total: 23520, status: "paid", date: "2026-04-19" },
];

const statusConfig: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
  paid: { variant: "success", label: "Paid" },
  pending: { variant: "warning", label: "Pending" },
  overdue: { variant: "error", label: "Overdue" },
};

export default function BillingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = billsData.filter((bill) => {
    const matchSearch =
      bill.id.toLowerCase().includes(search.toLowerCase()) ||
      bill.buyer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = billsData.reduce((s, b) => s + b.total, 0);
  const totalPaid = billsData.filter(b => b.status === "paid").reduce((s, b) => s + b.total, 0);
  const totalPending = billsData.filter(b => b.status !== "paid").reduce((s, b) => s + b.total, 0);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Billing</h1>
          <p className="dashboard-subtitle">GST invoices and payment tracking</p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export All
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid-3">
        <div className="dashboard-card">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Total Revenue</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)', marginTop: '0.25rem' }}>
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="dashboard-card">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Collected</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.25rem' }}>
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="dashboard-card">
          <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>Outstanding</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-error)', marginTop: '0.25rem' }}>
            ₹{totalPending.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex align-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '24rem' }}>
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="d-flex align-center gap-2">
          {["all", "paid", "pending", "overdue"].map((s) => (
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
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bills table */}
      <div className="dashboard-table-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Order</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>GST</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((bill) => {
                const statusCfg = statusConfig[bill.status];
                return (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-brand-600)' }}>{bill.id}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{bill.orderRef}</td>
                    <td style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{bill.buyer}</td>
                    <td style={{ color: 'var(--color-brand-700)' }}>₹{bill.amount.toLocaleString("en-IN")}</td>
                    <td style={{ color: 'var(--color-muted)' }}>
                      {bill.gstRate}% (₹{bill.gstAmount.toLocaleString("en-IN")})
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-brand-800)' }}>
                      ₹{bill.total.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <Badge variant={statusCfg.variant} dot size="sm">{statusCfg.label}</Badge>
                    </td>
                    <td>
                      <div className="d-flex align-center gap-2">
                        <button style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }} title="View Invoice">
                          <Eye size={16} />
                        </button>
                        <button style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }} title="Download PDF">
                          <FileText size={16} />
                        </button>
                        {bill.status !== "paid" && (
                          <button style={{ padding: '0.375rem', borderRadius: '0.5rem', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }} title="Send Reminder">
                            <Send size={16} />
                          </button>
                        )}
                      </div>
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
