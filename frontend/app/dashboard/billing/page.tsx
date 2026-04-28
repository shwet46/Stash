"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LuSearch as Search, LuDownload as Download, LuFileText as FileText,
  LuEye as Eye, LuSend as Send, LuRefreshCw as RefreshCw,
  LuReceipt as Receipt, LuTrendingUp as TrendingUp,
} from "react-icons/lu";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import { CLIENT_BACKEND_URL } from "@/lib/backend-url";

const API = CLIENT_BACKEND_URL;

interface Bill {
  id: string;
  bill_ref: string;
  order_ref: string;
  buyer_name: string;
  amount: number;
  gst_rate: number;
  gst_amount: number;
  total: number;
  status: "paid" | "pending" | "overdue";
  created_at: string;
  order_date?: string;
}

const statusConfig: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
  paid: { variant: "success", label: "Paid" },
  pending: { variant: "warning", label: "Pending" },
  overdue: { variant: "error", label: "Overdue" },
};

// Fallback demo data when Firestore is disabled
const DEMO_BILLS: Bill[] = [
  { id:"1", bill_ref:"INV-4830", order_ref:"STH-4830", buyer_name:"Patel Grocers", amount:13500, gst_rate:5, gst_amount:675, total:14175, status:"paid", created_at:"2026-04-21T00:00:00Z" },
  { id:"2", bill_ref:"INV-4828", order_ref:"STH-4828", buyer_name:"Singh & Co.", amount:19500, gst_rate:5, gst_amount:975, total:20475, status:"paid", created_at:"2026-04-20T00:00:00Z" },
  { id:"3", bill_ref:"INV-4831", order_ref:"STH-4831", buyer_name:"Sharma Stores", amount:24000, gst_rate:5, gst_amount:1200, total:25200, status:"pending", created_at:"2026-04-22T00:00:00Z" },
  { id:"4", bill_ref:"INV-4832", order_ref:"STH-4832", buyer_name:"Mehta & Sons", amount:62500, gst_rate:5, gst_amount:3125, total:65625, status:"pending", created_at:"2026-04-23T00:00:00Z" },
  { id:"5", bill_ref:"INV-4829", order_ref:"STH-4829", buyer_name:"Kumar Trading", amount:35000, gst_rate:5, gst_amount:1750, total:36750, status:"overdue", created_at:"2026-04-21T00:00:00Z" },
  { id:"6", bill_ref:"INV-4827", order_ref:"STH-4827", buyer_name:"Gupta Traders", amount:27500, gst_rate:5, gst_amount:1375, total:28875, status:"paid", created_at:"2026-04-20T00:00:00Z" },
  { id:"7", bill_ref:"INV-4826", order_ref:"STH-4826", buyer_name:"Reddy Retail", amount:30000, gst_rate:12, gst_amount:3600, total:33600, status:"pending", created_at:"2026-04-23T00:00:00Z" },
  { id:"8", bill_ref:"INV-4825", order_ref:"STH-4825", buyer_name:"Jain Supermart", amount:21000, gst_rate:12, gst_amount:2520, total:23520, status:"paid", created_at:"2026-04-19T00:00:00Z" },
];

export default function BillingPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [downloading, setDownloading] = useState<string | null>(null);

  const fetchBills = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/billing`);
      const data = await r.json();
      setBills(Array.isArray(data) && data.length > 0 ? data : DEMO_BILLS);
    } catch {
      setBills(DEMO_BILLS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const filtered = bills.filter((bill) => {
    const matchSearch =
      bill.bill_ref.toLowerCase().includes(search.toLowerCase()) ||
      bill.buyer_name.toLowerCase().includes(search.toLowerCase()) ||
      bill.order_ref.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || bill.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = bills.reduce((s, b) => s + b.total, 0);
  const totalPaid = bills.filter(b => b.status === "paid").reduce((s, b) => s + b.total, 0);
  const totalPending = bills.filter(b => b.status !== "paid").reduce((s, b) => s + b.total, 0);
  const totalGst = bills.reduce((s, b) => s + b.gst_amount, 0);

  const handleViewBill = (billRef: string) => {
    router.push(`/bill/${billRef}`);
  };

  const handleDownloadPdf = async (billRef: string) => {
    setDownloading(billRef);
    try {
      window.open(`${API}/api/billing/${billRef}/pdf`, "_blank");
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const handleExportCsv = () => {
    window.open(`${API}/api/analytics/export/csv?type=bills`, "_blank");
  };

  const handleExportReport = () => {
    window.open(`${API}/api/analytics/export/pdf`, "_blank");
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Billing</h1>
          <p className="dashboard-subtitle">GST invoices and payment tracking</p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" icon={<RefreshCw size={15} />} onClick={fetchBills}>
            Refresh
          </Button>
          <Button variant="outline" size="sm" icon={<Download size={15} />} onClick={handleExportCsv}>
            CSV Export
          </Button>
          <Button variant="primary" size="sm" icon={<FileText size={15} />} onClick={handleExportReport}>
            PDF Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4">
        {[
          { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, color: "var(--color-brand-600)", icon: <TrendingUp size={18} /> },
          { label: "Collected", value: `₹${totalPaid.toLocaleString("en-IN")}`, color: "var(--color-success)", icon: <Receipt size={18} /> },
          { label: "Outstanding", value: `₹${totalPending.toLocaleString("en-IN")}`, color: "var(--color-error)", icon: <Receipt size={18} /> },
          { label: "GST Collected", value: `₹${totalGst.toLocaleString("en-IN")}`, color: "var(--color-brand-500)", icon: <FileText size={18} /> },
        ].map((card) => (
          <div key={card.label} className="dashboard-card" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-brand-50)", border: "1px solid var(--color-brand-100)", display: "flex", alignItems: "center", justifyContent: "center", color: card.color, flexShrink: 0 }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBottom: 2 }}>{card.label}</p>
              <p style={{ fontSize: "1.25rem", fontWeight: 700, color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="d-flex align-center gap-3" style={{ flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "240px", maxWidth: "24rem" }}>
          <SearchInput placeholder="Search invoices, buyers…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="d-flex align-center gap-2">
          {["all", "paid", "pending", "overdue"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "0.375rem 0.875rem", borderRadius: 9999, fontSize: "0.75rem", fontWeight: 500,
                cursor: "pointer", transition: "all 0.2s",
                border: statusFilter === s ? "1px solid var(--color-brand-600)" : "1px solid var(--color-divider)",
                backgroundColor: statusFilter === s ? "var(--color-brand-600)" : "white",
                color: statusFilter === s ? "white" : "var(--color-brand-700)",
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Bills Table */}
      <div className="dashboard-table-wrapper">
        <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--color-divider)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h3 className="dashboard-card-title">GST Invoices</h3>
            <p className="dashboard-card-subtitle">Auto-generated on every order • Multiple GST rates</p>
          </div>
          <span className="badge badge-info">{filtered.length} invoices</span>
        </div>
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <div style={{ width: 32, height: 32, border: "3px solid var(--color-divider)", borderTopColor: "var(--color-brand-600)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p style={{ color: "var(--color-muted)", fontSize: 14 }}>Loading invoices…</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Order</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>GST</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((bill) => {
                  const sc = statusConfig[bill.status] || statusConfig.pending;
                  return (
                    <tr key={bill.id} style={{ cursor: "pointer" }}>
                      <td style={{ fontWeight: 600, color: "var(--color-brand-600)" }}>{bill.bill_ref}</td>
                      <td style={{ color: "var(--color-muted)", fontSize: 13 }}>{bill.order_ref}</td>
                      <td style={{ fontWeight: 500, color: "var(--color-brand-800)" }}>{bill.buyer_name}</td>
                      <td style={{ color: "var(--color-brand-700)" }}>₹{bill.amount.toLocaleString("en-IN")}</td>
                      <td style={{ color: "var(--color-muted)", fontSize: 12 }}>
                        <span style={{ background: "var(--color-brand-50)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, color: "var(--color-brand-600)" }}>
                          {bill.gst_rate}%
                        </span>
                        <span style={{ marginLeft: 4 }}>₹{bill.gst_amount.toLocaleString("en-IN")}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: "var(--color-brand-800)" }}>₹{bill.total.toLocaleString("en-IN")}</td>
                      <td style={{ fontSize: 12, color: "var(--color-muted)" }}>
                        {new Date(bill.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </td>
                      <td>
                        <Badge variant={sc.variant} dot size="sm">{sc.label}</Badge>
                      </td>
                      <td>
                        <div className="d-flex align-center gap-2">
                          <button
                            title="View Invoice"
                            onClick={() => handleViewBill(bill.bill_ref)}
                            style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", color: "var(--color-brand-600)", cursor: "pointer", transition: "background 0.2s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-brand-50)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Download PDF"
                            onClick={() => handleDownloadPdf(bill.bill_ref)}
                            disabled={downloading === bill.bill_ref}
                            style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", color: downloading === bill.bill_ref ? "var(--color-brand-300)" : "var(--color-muted)", cursor: "pointer", transition: "all 0.2s" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-brand-50)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                          >
                            <FileText size={16} />
                          </button>
                          {bill.status !== "paid" && (
                            <button
                              title="Send Reminder"
                              style={{ padding: "0.375rem", borderRadius: "0.5rem", background: "transparent", border: "none", color: "var(--color-muted)", cursor: "pointer", transition: "background 0.2s" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "var(--color-brand-50)")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              <Send size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "2.5rem", color: "var(--color-muted)", fontSize: 14 }}>
                      No invoices match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
