"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LuSearch as Search, LuPlus as Plus, LuDownload as Download, LuEye as Eye, LuRefreshCw as RefreshCw } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SearchInput from "@/components/ui/SearchInput";

import { fetchOrders, RecentOrder } from "@/lib/api";

const statusConfig: Record<string, { variant: "warning" | "default" | "success" | "info"; label: string }> = {
  pending: { variant: "warning", label: "Pending" },
  dispatched: { variant: "info", label: "Dispatched" },
  delivered: { variant: "success", label: "Delivered" },
  in_transit: { variant: "info", label: "In Transit" },
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const isWorker = role === "worker";

  useEffect(() => {
    if (session && isWorker) {
      router.push("/dashboard/inventory");
    }
  }, [session, isWorker, router]);

  if (isWorker) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">Redirecting to your workspace...</p>
      </div>
    );
  }

  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filtered = orders.filter((order) => {
    const matchSearch =
      order.order_ref.toLowerCase().includes(search.toLowerCase()) ||
      (order as any).buyer_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Orders</h1>
          <p className="dashboard-subtitle">
            {orders.length} orders · Total: ₹{totalAmount.toLocaleString("en-IN")}
          </p>
        </div>
        {!isWorker && (
          <div className="dashboard-header-right">
            <Button variant="outline" size="sm" icon={<Download size={16} />}>
              Export
            </Button>
            <Button size="sm" icon={<Plus size={16} />}>
              New Order
            </Button>
          </div>
        )}
        {isWorker && (
           <div className="dashboard-header-right">
              <Button variant="outline" size="sm" onClick={loadOrders} icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}>
                Refresh
              </Button>
           </div>
        )}
      </div>

      <div className="d-flex align-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '24rem' }}>
          <SearchInput
            placeholder="Search by order ID or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                transition: 'all 0.2s',
                border: statusFilter === s ? '1px solid var(--color-brand-600)' : '1px solid var(--color-divider)',
                backgroundColor: statusFilter === s ? 'var(--color-brand-600)' : 'white',
                color: statusFilter === s ? 'white' : 'var(--color-brand-700)',
                whiteSpace: 'nowrap'
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
                <th>Quantity</th>
                <th>Amount</th>
                <th>Order Date</th>
                <th>Est. Delivery</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                      <RefreshCw size={24} className="spin" style={{ color: 'var(--color-brand-600)', margin: '0 auto' }} />
                   </td>
                </tr>
              ) : filtered.map((order) => {
                const statusCfg = statusConfig[order.status] || statusConfig.pending;
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-brand-600)' }}>{order.order_ref}</td>
                    <td>
                      <div>
                        <p style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{(order as any).buyer_name || "Guest Buyer"}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{(order as any).phone || "No contact"}</p>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-brand-700)' }}>
                      {order.quantity} units
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--color-brand-800)' }}>
                      ₹{order.total_amount.toLocaleString("en-IN")}
                    </td>
                    <td style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                       {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                       {order.estimated_delivery ? new Date(order.estimated_delivery).toLocaleDateString() : "TBD"}
                    </td>
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
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
