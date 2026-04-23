"use client";
import { useState } from "react";
import { LuSearch as Search, LuPlus as Plus, LuFilter as Filter, LuTriangleAlert as AlertTriangle, LuDownload as Download } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const inventoryData = [
  { id: 1, name: "Basmati Rice", category: "Grains", stock: 2450, threshold: 500, unit: "kg", expiry: "2026-08-15", godown: "Mumbai Central", status: "healthy" },
  { id: 2, name: "Chana Dal", category: "Pulses", stock: 180, threshold: 200, unit: "kg", expiry: "2026-07-20", godown: "Mumbai Central", status: "low" },
  { id: 3, name: "Sugar", category: "Essentials", stock: 45, threshold: 100, unit: "kg", expiry: "2027-01-10", godown: "Pune Warehouse", status: "critical" },
  { id: 4, name: "Wheat Flour (Atta)", category: "Grains", stock: 1800, threshold: 400, unit: "kg", expiry: "2026-06-30", godown: "Mumbai Central", status: "healthy" },
  { id: 5, name: "Moong Dal", category: "Pulses", stock: 320, threshold: 150, unit: "kg", expiry: "2026-09-15", godown: "Nashik Depot", status: "healthy" },
  { id: 6, name: "Toor Dal", category: "Pulses", stock: 250, threshold: 200, unit: "kg", expiry: "2026-08-01", godown: "Pune Warehouse", status: "healthy" },
  { id: 7, name: "Masoor Dal", category: "Pulses", stock: 90, threshold: 100, unit: "kg", expiry: "2026-10-20", godown: "Ahmedabad Store", status: "low" },
  { id: 8, name: "Groundnut Oil", category: "Oils", stock: 520, threshold: 200, unit: "L", expiry: "2026-12-15", godown: "Mumbai Central", status: "healthy" },
  { id: 9, name: "Mustard Oil", category: "Oils", stock: 380, threshold: 150, unit: "L", expiry: "2026-11-30", godown: "Surat Godown", status: "healthy" },
  { id: 10, name: "Turmeric", category: "Spices", stock: 75, threshold: 50, unit: "kg", expiry: "2027-03-15", godown: "Nashik Depot", status: "healthy" },
  { id: 11, name: "Red Chilli", category: "Spices", stock: 40, threshold: 30, unit: "kg", expiry: "2027-02-28", godown: "Pune Warehouse", status: "healthy" },
  { id: 12, name: "Tea", category: "Beverages", stock: 120, threshold: 80, unit: "kg", expiry: "2026-09-30", godown: "Mumbai Central", status: "healthy" },
  { id: 13, name: "Parle-G Biscuits", category: "Snacks", stock: 200, threshold: 100, unit: "packs", expiry: "2026-06-15", godown: "Ahmedabad Store", status: "healthy" },
  { id: 14, name: "Lux Soap", category: "FMCG", stock: 150, threshold: 100, unit: "pcs", expiry: "2027-06-30", godown: "Surat Godown", status: "healthy" },
  { id: 15, name: "Surf Detergent", category: "FMCG", stock: 85, threshold: 80, unit: "packs", expiry: "2027-12-15", godown: "Mumbai Central", status: "healthy" },
];

const statusConfig: Record<string, { variant: "success" | "warning" | "error"; label: string }> = {
  healthy: { variant: "success", label: "Healthy" },
  low: { variant: "warning", label: "Low Stock" },
  critical: { variant: "error", label: "Critical" },
};

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = ["all", ...new Set(inventoryData.map((i) => i.category))];

  const filtered = inventoryData.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const lowStockCount = inventoryData.filter((i) => i.status !== "healthy").length;

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Inventory</h1>
          <p className="dashboard-subtitle">
            {inventoryData.length} products across 5 godowns
          </p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export
          </Button>
          <Button size="sm" icon={<Plus size={16} />}>
            Add Product
          </Button>
        </div>
      </div>

      {/* Alert banner */}
      {lowStockCount > 0 && (
        <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '0.75rem', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={18} style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-brand-800)' }}>
            <span style={{ fontWeight: 600 }}>{lowStockCount} products</span> are
            below stock threshold. Auto-reorder has been triggered for critical
            items.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="d-flex align-center gap-3" style={{ flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', maxWidth: '24rem' }}>
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="d-flex align-center gap-2">
          <Filter size={16} style={{ color: 'var(--color-muted)' }} />
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
                transition: 'colors 0.2s',
                border: categoryFilter === cat ? '1px solid var(--color-brand-600)' : '1px solid var(--color-divider)',
                backgroundColor: categoryFilter === cat ? 'var(--color-brand-600)' : 'white',
                color: categoryFilter === cat ? 'white' : 'var(--color-brand-700)'
              }}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
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
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const statusCfg = statusConfig[item.status];
                const stockPercent = Math.min((item.stock / item.threshold) * 100, 100);
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{item.name}</td>
                    <td>
                      <Badge variant="outline" size="sm">{item.category}</Badge>
                    </td>
                    <td>
                      <div className="d-flex align-center gap-3">
                        <span style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>
                          {item.stock.toLocaleString()} {item.unit}
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
                    <td style={{ color: 'var(--color-brand-700)' }}>{item.godown}</td>
                    <td style={{ color: 'var(--color-muted)' }}>{item.expiry}</td>
                    <td>
                      <Badge variant={statusCfg.variant} dot size="sm">
                        {statusCfg.label}
                      </Badge>
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
