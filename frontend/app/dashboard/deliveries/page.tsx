"use client";
import { LuMapPin as MapPin, LuClock as Clock, LuPackage as Package, LuCheck as CheckCircle, LuTruck as TruckIcon } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";

const deliveries = [
  { id: "STH-4832", buyer: "Mehta & Sons", product: "Basmati Rice", qty: "500 kg", status: "in_transit", eta: "Apr 28, 2026", driver: "Ramesh K.", updates: [
    { status: "Order Confirmed", time: "Apr 23, 10:30 AM", location: "Mumbai Central Godown" },
    { status: "Packed & Ready", time: "Apr 23, 2:00 PM", location: "Mumbai Central Godown" },
    { status: "Dispatched", time: "Apr 24, 8:00 AM", location: "Mumbai Central Godown" },
    { status: "In Transit", time: "Apr 24, 11:30 AM", location: "Thane Bypass" },
  ]},
  { id: "STH-4831", buyer: "Sharma Stores", product: "Chana Dal", qty: "200 kg", status: "in_transit", eta: "Apr 26, 2026", driver: "Suresh P.", updates: [
    { status: "Order Confirmed", time: "Apr 22, 9:00 AM", location: "Pune Warehouse" },
    { status: "Dispatched", time: "Apr 23, 7:30 AM", location: "Pune Warehouse" },
    { status: "In Transit", time: "Apr 23, 1:00 PM", location: "Lonavala Highway" },
  ]},
  { id: "STH-4829", buyer: "Kumar Trading", product: "Wheat Flour", qty: "1000 kg", status: "dispatched", eta: "Apr 25, 2026", driver: "Anil M.", updates: [
    { status: "Order Confirmed", time: "Apr 21, 11:00 AM", location: "Mumbai Central Godown" },
    { status: "Dispatched", time: "Apr 22, 6:00 AM", location: "Mumbai Central Godown" },
  ]},
  { id: "STH-4830", buyer: "Patel Grocers", product: "Sugar", qty: "300 kg", status: "delivered", eta: "Apr 24, 2026", driver: "Vijay S.", updates: [
    { status: "Order Confirmed", time: "Apr 21, 8:00 AM", location: "Pune Warehouse" },
    { status: "Dispatched", time: "Apr 22, 7:00 AM", location: "Pune Warehouse" },
    { status: "Delivered", time: "Apr 24, 10:30 AM", location: "Patel Grocers, Nashik" },
  ]},
];

const statusConfig: Record<string, { variant: "warning" | "default" | "success"; label: string }> = {
  dispatched: { variant: "warning", label: "Dispatched" },
  in_transit: { variant: "default", label: "In Transit" },
  delivered: { variant: "success", label: "Delivered" },
};

export default function DeliveriesPage() {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Deliveries</h1>
          <p className="dashboard-subtitle">
            Track active deliveries and shipment status
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-3">
        <div className="dashboard-card d-flex align-center gap-4">
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={20} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>3</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Active Shipments</p>
          </div>
        </div>
        <div className="dashboard-card d-flex align-center gap-4">
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TruckIcon size={20} style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>2</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>In Transit</p>
          </div>
        </div>
        <div className="dashboard-card d-flex align-center gap-4">
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>1</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Delivered Today</p>
          </div>
        </div>
      </div>

      {/* Delivery cards with timeline */}
      <div className="d-flex" style={{ flexDirection: 'column', gap: '1rem' }}>
        {deliveries.map((del) => {
          const statusCfg = statusConfig[del.status];
          return (
            <div key={del.id} className="dashboard-card">
              <div className="d-flex align-center justify-between mb-4" style={{ alignItems: 'flex-start' }}>
                <div>
                  <div className="d-flex align-center gap-2">
                    <h3 style={{ fontWeight: 600, color: 'var(--color-brand-600)' }}>{del.id}</h3>
                    <Badge variant={statusCfg.variant} dot size="sm">{statusCfg.label}</Badge>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-brand-800)', marginTop: '0.25rem' }}>
                    {del.product} ({del.qty}) → {del.buyer}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>ETA</p>
                  <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-brand-800)' }}>{del.eta}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.25rem' }}>Driver: {del.driver}</p>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ borderTop: '1px solid var(--color-divider)', paddingTop: '1rem' }}>
                <div className="d-flex" style={{ alignItems: 'flex-start', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                  {del.updates.map((update, i) => (
                    <div key={i} className="d-flex" style={{ alignItems: 'flex-start', gap: '0.5rem', minWidth: '180px' }}>
                      <div className="d-flex" style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{
                          width: '0.75rem', height: '0.75rem', borderRadius: '9999px', flexShrink: 0,
                          backgroundColor: i === del.updates.length - 1 ? 'var(--color-brand-600)' : 'var(--color-brand-300)'
                        }} />
                        {i < del.updates.length - 1 && (
                          <div style={{ width: '2px', height: '2rem', backgroundColor: 'var(--color-brand-200)' }} />
                        )}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-brand-800)' }}>{update.status}</p>
                        <p className="d-flex align-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          <Clock size={10} />
                          {update.time}
                        </p>
                        <p className="d-flex align-center gap-2" style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          <MapPin size={10} />
                          {update.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
