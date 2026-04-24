"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LuPlus as Plus, LuDownload as Download, LuEye as Eye, LuRefreshCw as RefreshCw } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";

import { fetchOrders, RecentOrder, createOrder, fetchInventory } from "@/lib/api";

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

  // ── All hooks must come before any early returns ──
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventory, setInventory] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    buyer_name: "",
    phone: "",
    product_id: "",
    quantity: "",
    total_amount: "",
  });

  useEffect(() => {
    if (session && isWorker) {
      router.push("/dashboard/inventory");
    }
  }, [session, isWorker, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data as RecentOrder[]);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    fetchInventory().then((data) => setInventory(data as any[])).catch(console.error);
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createOrder({
        buyer_name: formData.buyer_name,
        phone: formData.phone,
        product_id: formData.product_id,
        quantity: parseInt(formData.quantity, 10),
        total_amount: parseFloat(formData.total_amount),
      });
      setIsNewOrderModalOpen(false);
      setFormData({ buyer_name: "", phone: "", product_id: "", quantity: "", total_amount: "" });
      loadOrders();
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Early return for workers (after all hooks) ──
  if (isWorker) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">Redirecting to your workspace...</p>
      </div>
    );
  }

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
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export
          </Button>
          <Button size="sm" icon={<Plus size={16} />} onClick={() => setIsNewOrderModalOpen(true)}>
            New Order
          </Button>
        </div>
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
                      ₹{(order.total_amount || 0).toLocaleString("en-IN")}
                    </td>
                    <td style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                       {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ color: 'var(--color-muted)', fontSize: '0.8125rem' }}>
                       {(order as any).estimated_delivery ? new Date((order as any).estimated_delivery).toLocaleDateString() : "TBD"}
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

      {/* New Order Modal */}
      <Modal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        title="Add New Order"
        size="lg"
      >
        <form onSubmit={handleCreateOrder} className="dashboard-modal-form">
          <p className="dashboard-modal-intro">Capture buyer and product details to place a new order.</p>

          <div className="dashboard-modal-grid">
            <div className="dashboard-field">
              <label htmlFor="order-buyer-name" className="dashboard-field-label">Buyer Name</label>
              <input
                id="order-buyer-name"
                className="dashboard-field-input"
                placeholder="E.g. Ramesh Singh"
                value={formData.buyer_name}
                onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="order-phone" className="dashboard-field-label">Phone Number</label>
              <input
                id="order-phone"
                className="dashboard-field-input"
                placeholder="10-digit number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="dashboard-field">
            <label htmlFor="order-product" className="dashboard-field-label">Product</label>
            <select
              id="order-product"
              className="dashboard-field-select"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              required
            >
              <option value="">Select a product...</option>
              {inventory.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.product_name} ({item.current_stock} {item.unit} available)
                </option>
              ))}
            </select>
          </div>

          <div className="dashboard-modal-grid">
            <div className="dashboard-field">
              <label htmlFor="order-quantity" className="dashboard-field-label">Quantity</label>
              <input
                id="order-quantity"
                className="dashboard-field-input"
                type="number"
                placeholder="0"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="order-total-amount" className="dashboard-field-label">Total Amount (INR)</label>
              <input
                id="order-total-amount"
                className="dashboard-field-input"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="dashboard-modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsNewOrderModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Add Order"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
