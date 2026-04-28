"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  LuTrendingUp as TrendingUp, LuIndianRupee as IndianRupee,
  LuShoppingCart as ShoppingCart, LuUsers as Users,
  LuDownload as Download, LuFileText as FileText,
  LuX as X, LuCircleCheck as CheckCircle, LuLoader as Loader,
} from "react-icons/lu";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import { CLIENT_BACKEND_URL } from "@/lib/backend-url";

const API = CLIENT_BACKEND_URL;

const revenueData = [
  { name: "Mon", revenue: 45000, orders: 120 },
  { name: "Tue", revenue: 52000, orders: 145 },
  { name: "Wed", revenue: 48000, orders: 132 },
  { name: "Thu", revenue: 61000, orders: 168 },
  { name: "Fri", revenue: 55000, orders: 154 },
  { name: "Sat", revenue: 67000, orders: 182 },
  { name: "Sun", revenue: 42000, orders: 110 },
];

const categoryData = [
  { name: "Grains", value: 45, color: "#6B4226" },
  { name: "Oils", value: 25, color: "#8B5E3C" },
  { name: "Spices", value: 15, color: "#D4956A" },
  { name: "Others", value: 15, color: "#EADDD3" },
];

const CSV_EXPORTS = [
  { type: "bills", label: "GST Invoices", desc: "All bills with GST breakdown", icon: "🧾" },
  { type: "orders", label: "Orders", desc: "All orders with buyer details", icon: "📦" },
  { type: "inventory", label: "Inventory", desc: "Products, stock, and pricing", icon: "🏭" },
  { type: "suppliers", label: "Suppliers", desc: "Supplier contacts and details", icon: "🤝" },
];

function ExportModal({ onClose }: { onClose: () => void }) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfDone, setPdfDone] = useState(false);
  const [csvLoading, setCsvLoading] = useState<string | null>(null);
  const [csvDone, setCsvDone] = useState<string | null>(null);

  const handlePdfDownload = async () => {
    setPdfLoading(true);
    setPdfDone(false);
    window.open(`${API}/api/analytics/export/pdf`, "_blank");
    setTimeout(() => { setPdfLoading(false); setPdfDone(true); }, 1500);
  };

  const handleCsvDownload = (type: string) => {
    setCsvLoading(type);
    window.open(`${API}/api/analytics/export/csv?type=${type}`, "_blank");
    setTimeout(() => { setCsvLoading(null); setCsvDone(type); setTimeout(() => setCsvDone(null), 2000); }, 1200);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", zIndex: 50, animation: "fadeIn 0.2s ease" }}
      />
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        background: "white", borderRadius: 20, boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
        width: "100%", maxWidth: 520, zIndex: 51, animation: "slideUp 0.25s ease",
        border: "1px solid var(--color-brand-100)", overflow: "hidden",
      }}>
        <style>{`
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes slideUp{from{opacity:0;transform:translate(-50%,-45%)}to{opacity:1;transform:translate(-50%,-50%)}}
          @keyframes spin{to{transform:rotate(360deg)}}
        `}</style>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#3d2616,#6B4226,#8B5E3C)", padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>Export Reports</h2>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>Download your data in PDF or CSV format</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 8, padding: 8, cursor: "pointer", color: "white", display: "flex", alignItems: "center" }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "24px 28px" }}>
          {/* PDF Report */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-brand-800)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>
              📊 Full Dashboard Report
            </h3>
            <div
              style={{ background: "linear-gradient(135deg,#FAF6F1,#fdfcfb)", border: "1px solid #E2CDB0", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--color-brand-800)" }}>PDF Report</div>
                <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                  Orders • Invoices • Inventory • KPIs — professionally formatted
                </div>
              </div>
              <button
                onClick={handlePdfDownload}
                disabled={pdfLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
                  background: pdfDone ? "var(--color-success)" : "linear-gradient(135deg,#6B4226,#8B5E3C)",
                  color: "white", border: "none", borderRadius: 10, cursor: pdfLoading ? "wait" : "pointer",
                  fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", transition: "all 0.3s", minWidth: 130,
                }}
              >
                {pdfLoading ? (
                  <><div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.4)",borderTopColor:"white",borderRadius:"50%",animation:"spin 1s linear infinite" }} /> Generating…</>
                ) : pdfDone ? (
                  <><CheckCircle size={14} /> Downloaded!</>
                ) : (
                  <><Download size={14} /> Download PDF</>
                )}
              </button>
            </div>
          </div>

          {/* CSV Exports */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "var(--color-brand-800)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>
              📋 CSV Exports
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {CSV_EXPORTS.map((exp) => (
                <div
                  key={exp.type}
                  style={{ background: "#fdfcfb", border: "1px solid var(--color-divider)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, transition: "border-color 0.2s" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{exp.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--color-brand-800)" }}>{exp.label}</div>
                      <div style={{ fontSize: 11, color: "var(--color-muted)" }}>{exp.desc}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCsvDownload(exp.type)}
                    disabled={csvLoading === exp.type}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "8px 16px",
                      background: csvDone === exp.type ? "var(--color-success)" : "white",
                      color: csvDone === exp.type ? "white" : "var(--color-brand-600)",
                      border: `1px solid ${csvDone === exp.type ? "var(--color-success)" : "var(--color-brand-300)"}`,
                      borderRadius: 8, cursor: csvLoading === exp.type ? "wait" : "pointer",
                      fontWeight: 600, fontSize: 12, transition: "all 0.3s", whiteSpace: "nowrap",
                    }}
                  >
                    {csvLoading === exp.type ? (
                      <><div style={{ width:12,height:12,border:"2px solid #ccc",borderTopColor:"#6B4226",borderRadius:"50%",animation:"spin 1s linear infinite" }} /> Exporting…</>
                    ) : csvDone === exp.type ? (
                      <><CheckCircle size={12} /> Done!</>
                    ) : (
                      <><Download size={12} /> CSV</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p style={{ marginTop: 20, fontSize: 11, color: "var(--color-muted)", textAlign: "center" }}>
            Files include all data from Firestore. CSV files are Excel-compatible (UTF-8 with BOM).
          </p>
        </div>
      </div>
    </>
  );
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const isWorker = role === "worker";
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && isWorker) {
      router.push("/dashboard/inventory");
    }
  }, [status, isWorker, router]);

  if (status === "loading" || isWorker) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">{isWorker ? "Redirecting to your workspace…" : "Loading analytics…"}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {showExportModal && <ExportModal onClose={() => setShowExportModal(false)} />}

      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Analytics</h1>
          <p className="dashboard-subtitle">Performance insights and inventory trends</p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="primary" size="sm" icon={<Download size={15} />} onClick={() => setShowExportModal(true)}>
            Export Reports
          </Button>
        </div>
      </div>

      <div className="grid-4">
        <StatCard title="Total Revenue" value="₹3,42,000" change="+12.5%" changeType="positive" icon={IndianRupee} subtitle="Past 30 days" />
        <StatCard title="Average Order" value="₹4,250" change="+5.2%" changeType="positive" icon={TrendingUp} subtitle="Per transaction" />
        <StatCard title="Total Orders" value="1,284" change="+8.1%" changeType="positive" icon={ShoppingCart} subtitle="Fulfilled" />
        <StatCard title="Active Buyers" value="48" change="+2" changeType="positive" icon={Users} subtitle="Regular customers" />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Revenue Trends</h3>
          </div>
          <div style={{ height: "350px", marginTop: "1.5rem" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-600)" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="var(--color-brand-600)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted)", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted)", fontSize: 12 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid var(--color-divider)", boxShadow: "var(--shadow-card)" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-brand-600)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Sales by Category</h3>
          </div>
          <div style={{ height: "350px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: "100%", marginTop: "1rem" }}>
              {categoryData.map((cat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: cat.color }} />
                    <span style={{ fontSize: "0.875rem", color: "var(--color-brand-800)", fontWeight: 500 }}>{cat.name}</span>
                  </div>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
