"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LuSearch as Search, LuPlus as Plus, LuFilter as Filter, LuTriangleAlert as AlertTriangle, LuDownload as Download, LuRefreshCw as RefreshCw } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SearchInput from "@/components/ui/SearchInput";

import { fetchInventory, StockItem } from "@/lib/api";

const statusConfig: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
  healthy: { variant: "success", label: "Healthy" },
  low: { variant: "warning", label: "Low Stock" },
  critical: { variant: "error", label: "Critical" },
};

export default function InventoryPage() {
  const { data: session } = useSession();
  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const isWorker = role === "worker";

  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const loadInventory = async () => {
    try {
      setLoading(true);
      const data = await fetchInventory();
      setInventory(data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = ["all", ...new Set(inventory.map((i) => i.category || "Uncategorized"))];

  const filtered = inventory.filter((item) => {
    const matchSearch = item.product_name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
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
        {!isWorker && (
          <div className="dashboard-header-right">
            <Button variant="outline" size="sm" icon={<Download size={16} />}>
              Export
            </Button>
            <Button size="sm" icon={<Plus size={16} />}>
              Add Product
            </Button>
          </div>
        )}
        {isWorker && (
          <div className="dashboard-header-right">
             <Button variant="outline" size="sm" onClick={loadInventory} icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}>
               Refresh
             </Button>
          </div>
        )}
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
                       {item.last_updated ? new Date((item as any).last_updated).toLocaleDateString() : "N/A"}
                    </td>
                    <td>
                      <Badge variant={statusCfg.variant} dot size="sm">
                        {statusCfg.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {!loading && filtered.length === 0 && (
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
    </div>
  );
}
