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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Inventory</h1>
          <p className="text-sm text-muted mt-1">
            {inventoryData.length} products across 5 godowns
          </p>
        </div>
        <div className="flex items-center gap-3">
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
        <div className="bg-amber-50 border border-warning/30 rounded-[12px] p-4 flex items-center gap-3">
          <AlertTriangle size={18} className="text-warning flex-shrink-0" />
          <p className="text-sm text-brand-800">
            <span className="font-semibold">{lowStockCount} products</span> are
            below stock threshold. Auto-reorder has been triggered for critical
            items.
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] max-w-sm">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-divider text-brand-700 hover:bg-brand-50"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[12px] border border-divider shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Godown</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {filtered.map((item) => {
                const statusCfg = statusConfig[item.status];
                const stockPercent = Math.min((item.stock / item.threshold) * 100, 100);
                return (
                  <tr key={item.id} className="hover:bg-brand-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-brand-800">{item.name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" size="sm">{item.category}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-brand-800">
                          {item.stock.toLocaleString()} {item.unit}
                        </span>
                        <div className="w-16 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === "critical"
                                ? "bg-error"
                                : item.status === "low"
                                ? "bg-warning"
                                : "bg-success"
                            }`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted">{item.threshold} {item.unit}</td>
                    <td className="px-6 py-4 text-brand-700">{item.godown}</td>
                    <td className="px-6 py-4 text-muted">{item.expiry}</td>
                    <td className="px-6 py-4">
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
