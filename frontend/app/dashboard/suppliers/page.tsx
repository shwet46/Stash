"use client";
import { useState } from "react";
import { LuSearch as Search, LuPlus as Plus, LuPhone as Phone, LuStar as Star, LuEllipsis as MoreVertical } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const suppliersData = [
  { id: 1, name: "Anand Trading Co.", phone: "+91 98765 43210", product: "Basmati Rice", priority: 1, status: "active", lastContacted: "2h ago", orders: 42, rating: 4.8 },
  { id: 2, name: "Patel & Sons Grains", phone: "+91 87654 32109", product: "Chana Dal", priority: 1, status: "active", lastContacted: "5h ago", orders: 35, rating: 4.5 },
  { id: 3, name: "Sharma Commodities", phone: "+91 76543 21098", product: "Sugar", priority: 2, status: "active", lastContacted: "1d ago", orders: 28, rating: 4.2 },
  { id: 4, name: "Gupta Oil Mills", phone: "+91 65432 10987", product: "Groundnut Oil", priority: 1, status: "active", lastContacted: "3h ago", orders: 31, rating: 4.6 },
  { id: 5, name: "Maharashtra Grains Ltd.", phone: "+91 54321 09876", product: "Wheat Flour", priority: 1, status: "inactive", lastContacted: "5d ago", orders: 22, rating: 3.9 },
  { id: 6, name: "Gujarat Spice Co.", phone: "+91 43210 98765", product: "Turmeric", priority: 1, status: "active", lastContacted: "1d ago", orders: 18, rating: 4.7 },
  { id: 7, name: "Rathi Oils Pvt. Ltd.", phone: "+91 32109 87654", product: "Mustard Oil", priority: 2, status: "active", lastContacted: "2d ago", orders: 15, rating: 4.1 },
  { id: 8, name: "Deccan Trading Co.", phone: "+91 21098 76543", product: "Toor Dal", priority: 1, status: "active", lastContacted: "4h ago", orders: 25, rating: 4.4 },
];

export default function SuppliersPage() {
  const [search, setSearch] = useState("");

  const filtered = suppliersData.filter((sup) =>
    sup.name.toLowerCase().includes(search.toLowerCase()) ||
    sup.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Suppliers</h1>
          <p className="text-sm text-muted mt-1">
            {suppliersData.length} suppliers · {suppliersData.filter(s => s.status === "active").length} active
          </p>
        </div>
        <Button size="sm" icon={<Plus size={16} />}>Add Supplier</Button>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={16} />}
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((sup) => (
          <div key={sup.id} className="bg-white rounded-[12px] border border-divider shadow-card p-5 hover:shadow-[0_2px_8px_rgba(107,66,38,0.12),0_8px_24px_rgba(107,66,38,0.10)] transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-brand-800">{sup.name}</h3>
                <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                  <Phone size={12} />
                  {sup.phone}
                </p>
              </div>
              <button className="p-1 rounded hover:bg-brand-50 text-muted cursor-pointer">
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" size="sm">{sup.product}</Badge>
              <Badge variant={sup.priority === 1 ? "default" : "outline"} size="sm">
                P{sup.priority}
              </Badge>
              <Badge variant={sup.status === "active" ? "success" : "warning"} dot size="sm">
                {sup.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-divider">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-warning fill-warning" />
                <span className="text-sm font-medium text-brand-800">{sup.rating}</span>
                <span className="text-xs text-muted ml-1">({sup.orders} orders)</span>
              </div>
              <span className="text-xs text-muted">Last: {sup.lastContacted}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
