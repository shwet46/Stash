"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LuPlus as Plus, LuFilter as Filter, LuTriangleAlert as AlertTriangle, LuDownload as Download, LuRefreshCw as RefreshCw } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import Modal from "@/components/ui/Modal";

import { fetchInventory, createInventoryItem, StockItem } from "@/lib/api";

const statusConfig: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
  healthy: { variant: "success", label: "Healthy" },
  low: { variant: "warning", label: "Low Stock" },
  critical: { variant: "error", label: "Critical" },
};

const CATEGORIES = ["Grains", "Pulses", "Oils", "Spices", "Essentials", "FMCG", "Beverages", "Snacks", "General"];
const UNITS = ["kg", "L", "packs", "pcs", "bags", "boxes", "units"];

export default function InventoryPage() {
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const isWorker = role === "worker";

  // All hooks before any early returns
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_name: "",
    category: "Grains",
    current_stock: "",
    threshold: "",
    unit: "kg",
    expiry_date: "",
  });

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await fetchInventory();
      setInventory(data as StockItem[]);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createInventoryItem({
        product_name: formData.product_name,
        category: formData.category,
        current_stock: parseFloat(formData.current_stock),
        threshold: parseFloat(formData.threshold),
        unit: formData.unit,
        expiry_date: formData.expiry_date || null,
      });
      setIsModalOpen(false);
      setFormData({ product_name: "", category: "Grains", current_stock: "", threshold: "", unit: "kg", expiry_date: "" });
      loadInventory();
    } catch (error) {
      console.error("Failed to add product:", error);
      alert("Failed to add product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ["all", ...new Set(inventory.map((i) => (i as any).category || "General"))];

  const filtered = inventory.filter((item) => {
    const matchSearch = item.product_name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || (item as any).category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const lowStockCount = inventory.filter((i) => i.status !== "healthy").length;

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Inventory</h1>
          <p className="dashboard-subtitle">
            {inventory.length} products across godowns
          </p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export
          </Button>
          {!isWorker && (
            <Button size="sm" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
              Add Product
            </Button>
          )}
          {isWorker && (
            <Button variant="outline" size="sm" onClick={loadInventory} icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}>
              Refresh
            </Button>
          )}
        </div>
      </div>

      {/* Alert banner */}
      {lowStockCount > 0 && (
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-brand-800)' }}>
            <span style={{ fontWeight: 600 }}>{lowStockCount} products</span> are
            below stock threshold. {isWorker ? "Please inform your supervisor." : "Auto-reorder has been triggered for critical items."}
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="d-flex align-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '24rem' }}>
          <SearchInput
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="d-flex align-center gap-2">
          <Filter size={16} style={{ color: 'var(--color-muted)' }} />
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.25rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                style={{
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: categoryFilter === cat ? '1px solid var(--color-brand-600)' : '1px solid var(--color-divider)',
                  backgroundColor: categoryFilter === cat ? 'var(--color-brand-600)' : 'white',
                  color: categoryFilter === cat ? 'white' : 'var(--color-brand-700)',
                  whiteSpace: 'nowrap'
                }}
              >
                {cat === "all" ? "All" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="dashboard-table-wrapper">
        <div style={{ overflowX: 'auto' }}>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Godown</th>
                <th>Last Updated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <RefreshCw size={24} className="spin" style={{ color: 'var(--color-brand-600)', margin: '0 auto' }} />
                  </td>
                </tr>
              ) : filtered.map((item) => {
                const statusCfg = statusConfig[item.status] || statusConfig.healthy;
                const stockPercent = Math.min((item.current_stock / item.threshold) * 100, 100);
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{item.product_name}</td>
                    <td>
                      <Badge variant="outline" size="sm">{(item as any).category || "General"}</Badge>
                    </td>
                    <td>
                      <div className="d-flex align-center gap-3">
                        <span style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>
                          {item.current_stock.toLocaleString()} {item.unit}
                        </span>
                        <div style={{ width: '4rem', height: '0.375rem', backgroundColor: 'var(--color-brand-100)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              borderRadius: '9999px',
                              width: `${stockPercent}%`,
                              backgroundColor: item.status === "critical" ? 'var(--color-error)' : item.status === "low" ? 'var(--color-warning)' : 'var(--color-success)'
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-muted)' }}>{item.threshold} {item.unit}</td>
                    <td style={{ color: 'var(--color-brand-700)' }}>{(item as any).godown || "Main"}</td>
                    <td style={{ color: 'var(--color-muted)', fontSize: '0.75rem' }}>
                       {(item as any).last_updated ? new Date((item as any).last_updated).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      <Badge variant={statusCfg.variant} dot size="sm">
                        {statusCfg.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-muted)' }}>
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product" size="lg">
        <form onSubmit={handleAddProduct} className="dashboard-modal-form">
          <p className="dashboard-modal-intro">Add inventory details to start stock tracking and low-stock alerts.</p>

          <div className="dashboard-field">
            <label htmlFor="product-name" className="dashboard-field-label">Product Name</label>
            <input
              id="product-name"
              className="dashboard-field-input"
              placeholder="E.g. Basmati Rice"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              required
            />
          </div>

          <div className="dashboard-modal-grid">
            <div className="dashboard-field">
              <label htmlFor="product-category" className="dashboard-field-label">Category</label>
              <select
                id="product-category"
                className="dashboard-field-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="dashboard-field">
              <label htmlFor="product-unit" className="dashboard-field-label">Unit</label>
              <select
                id="product-unit"
                className="dashboard-field-select"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div className="dashboard-modal-grid">
            <div className="dashboard-field">
              <label htmlFor="current-stock" className="dashboard-field-label">Current Stock</label>
              <input
                id="current-stock"
                className="dashboard-field-input"
                type="number"
                placeholder="0"
                min="0"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                required
              />
            </div>
            <div className="dashboard-field">
              <label htmlFor="low-stock-threshold" className="dashboard-field-label">Low Stock Threshold</label>
              <input
                id="low-stock-threshold"
                className="dashboard-field-input"
                type="number"
                placeholder="0"
                min="0"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="dashboard-field">
            <label htmlFor="expiry-date" className="dashboard-field-label">Expiry Date (optional)</label>
            <input
              id="expiry-date"
              className="dashboard-field-input"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
          </div>

          <div className="dashboard-modal-actions">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
