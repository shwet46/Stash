"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LuSearch as Search, LuPlus as Plus, LuPhone as Phone, LuStar as Star, LuEllipsis as MoreVertical } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SearchInput from "@/components/ui/SearchInput";


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
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const isAuthorized = role === "owner" || role === "admin";

  useEffect(() => {
    if (status === "authenticated" && !isAuthorized) {
      router.push("/dashboard/inventory");
    }
  }, [status, isAuthorized, router]);

  const [search, setSearch] = useState("");

  if (status === "loading" || !isAuthorized) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">{!isAuthorized && status === "authenticated" ? "Redirecting to your workspace..." : "Loading suppliers..."}</p>
      </div>
    );
  }

  const filtered = suppliersData.filter((sup) =>
    sup.name.toLowerCase().includes(search.toLowerCase()) ||
    sup.product.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Suppliers</h1>
          <p className="dashboard-subtitle">
            {suppliersData.length} suppliers · {suppliersData.filter(s => s.status === "active").length} active
          </p>
        </div>
        <div className="dashboard-header-right">
          <Button size="sm" icon={<Plus size={16} />}>Add Supplier</Button>
        </div>
      </div>

      <div style={{ maxWidth: '24rem' }}>
        <SearchInput
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid-3">
        {filtered.map((sup) => (
          <div key={sup.id} className="dashboard-card">
            <div className="d-flex align-center justify-between mb-2" style={{ alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--color-brand-800)' }}>{sup.name}</h3>
                <p className="d-flex align-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.125rem' }}>
                  <Phone size={12} />
                  {sup.phone}
                </p>
              </div>
              <button style={{ padding: '0.25rem', borderRadius: '0.25rem', background: 'transparent', border: 'none', color: 'var(--color-muted)', cursor: 'pointer' }}>
                <MoreVertical size={16} />
              </button>
            </div>

            <div className="d-flex align-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <Badge variant="outline" size="sm">{sup.product}</Badge>
              <Badge variant={sup.priority === 1 ? "default" : "outline"} size="sm">
                P{sup.priority}
              </Badge>
              <Badge variant={sup.status === "active" ? "success" : "warning"} dot size="sm">
                {sup.status}
              </Badge>
            </div>

            <div className="d-flex align-center justify-between" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-divider)' }}>
              <div className="d-flex align-center gap-2">
                <Star size={14} style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-brand-800)' }}>{sup.rating}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginLeft: '0.25rem' }}>({sup.orders} orders)</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Last: {sup.lastContacted}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
