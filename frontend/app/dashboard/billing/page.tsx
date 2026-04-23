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
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Billing</h1>
          <p className="text-sm text-muted mt-1">GST invoices and payment tracking</p>
        </div>
        <Button variant="outline" size="sm" icon={<Download size={16} />}>
          Export All
        </Button>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[12px] border border-divider shadow-card p-5">
          <p className="text-sm text-muted">Total Revenue</p>
          <p className="text-2xl font-bold text-brand-800 mt-1">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white rounded-[12px] border border-divider shadow-card p-5">
          <p className="text-sm text-muted">Collected</p>
          <p className="text-2xl font-bold text-success mt-1">
            ₹{totalPaid.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="bg-white rounded-[12px] border border-divider shadow-card p-5">
          <p className="text-sm text-muted">Outstanding</p>
          <p className="text-2xl font-bold text-error mt-1">
            ₹{totalPending.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="flex items-center gap-2">
          {["all", "paid", "pending", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-divider text-brand-700 hover:bg-brand-50"
              }`}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bills table */}
      <div className="bg-white rounded-[12px] border border-divider shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">GST</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.map((bill) => {
                const statusCfg = statusConfig[bill.status];
                return (
                  <tr key={bill.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-600">{bill.id}</td>
                    <td className="px-6 py-4 text-muted">{bill.orderRef}</td>
                    <td className="px-6 py-4 font-medium text-brand-800">{bill.buyer}</td>
                    <td className="px-6 py-4 text-brand-700">₹{bill.amount.toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4 text-muted">
                      {bill.gstRate}% (₹{bill.gstAmount.toLocaleString("en-IN")})
                    </td>
                    <td className="px-6 py-4 font-semibold text-brand-800">
                      ₹{bill.total.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusCfg.variant} dot size="sm">{statusCfg.label}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-brand-50 text-muted hover:text-brand-600 transition-colors cursor-pointer" title="View Invoice">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-brand-50 text-muted hover:text-brand-600 transition-colors cursor-pointer" title="Download PDF">
                          <FileText size={16} />
                        </button>
                        {bill.status !== "paid" && (
                          <button className="p-1.5 rounded-lg hover:bg-brand-50 text-muted hover:text-brand-600 transition-colors cursor-pointer" title="Send Reminder">
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
