"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { LuMapPin as MapPin, LuClock as Clock, LuPackage as Package, LuCheck as CheckCircle, LuTruck as TruckIcon, LuRefreshCw as RefreshCw, LuMaximize2 as Maximize, LuNavigation as Navigation, LuArrowRight as ArrowRight, LuRoute as Route } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { fetchDeliveries } from "@/lib/api";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/ui/Map"), { ssr: false });

const statusConfig: Record<string, { variant: "warning" | "default" | "success" | "error" | "outline"; label: string }> = {
  dispatched: { variant: "warning", label: "Dispatched" },
  in_transit: { variant: "default", label: "In Transit" },
  delivered: { variant: "success", label: "Delivered" },
  pending: { variant: "default", label: "Pending" },
};

const getCoordinates = (route: string, progress: number): [number, number] => {
  const cities: Record<string, [number, number]> = {
    "Mumbai": [19.0760, 72.8777],
    "Thane": [19.2183, 72.9781],
    "Pune": [18.5204, 73.8567],
    "Nashik": [19.9975, 73.7898],
    "Surat": [21.1702, 72.8311],
    "Ahmedabad": [23.0225, 72.5714],
  };

  if (!route) return [19.0760, 72.8777];
  
  const parts = route.split(" → ");
  if (parts.length === 2) {
    const start = cities[parts[0].trim()];
    const end = cities[parts[1].trim()];
    if (start && end) {
      const p = progress / 100;
      const lat = start[0] + (end[0] - start[0]) * p;
      const lng = start[1] + (end[1] - start[1]) * p;
      return [lat, lng];
    }
  }
  return [19.0760, 72.8777]; // Default to Mumbai
};

export default function DeliveriesPage() {
  const { data: session } = useSession();
  const accessToken = (session?.user as any)?.accessToken as string | undefined;
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDeliveries(accessToken);
      const list = Array.isArray(data) ? data : [];
      setDeliveries(list);
      if (list.length > 0) setSelectedDelivery(list[0]);
      if (list.length === 0) setSelectedDelivery(null);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [accessToken]);

  const activeCount = deliveries.filter(d => d.status !== 'delivered').length;
  const transitCount = deliveries.filter(d => d.status === 'in_transit').length;
  const deliveredCount = deliveries.filter(d => d.status === 'delivered').length;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Deliveries</h1>
          <p className="dashboard-subtitle">
            Real-time shipment tracking and route optimization
          </p>
        </div>
        <div className="dashboard-header-right">
           <Button variant="outline" size="sm" onClick={loadDeliveries} icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}>
             Sync Data
           </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid-4">
        <div className="dashboard-card d-flex align-center gap-4">
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Package size={20} style={{ color: 'var(--color-warning)' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>{activeCount}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Active Shipments</p>
          </div>
        </div>
        <div className="dashboard-card d-flex align-center gap-4">
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TruckIcon size={20} style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>{transitCount}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>In Transit</p>
          </div>
        </div>
        <div className="dashboard-card d-flex align-center gap-4">
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>{deliveredCount}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Delivered Today</p>
          </div>
        </div>
        <div className="dashboard-card d-flex align-center gap-4">
          <div style={{ width: '2.5rem', height: '2.5rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Route size={20} style={{ color: '#3B82F6' }} />
          </div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-brand-800)' }}>{deliveries.length}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Demo Deliveries</p>
          </div>
        </div>
      </div>

      {/* Main Map View */}
      <div className="grid-3" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Map Area */}
        <div className="dashboard-card" style={{ padding: 0, position: 'relative', overflow: 'hidden', height: '500px' }}>
           <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 5, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid var(--color-divider)' }}>
                 <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Tracking</p>
                 <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-brand-800)' }}>{selectedDelivery ? (selectedDelivery.order_id || selectedDelivery.id).slice(0, 8) : "Select a shipment"}</p>
              </div>
           </div>
           
           <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', zIndex: 5 }}>
              <button style={{ backgroundColor: 'white', width: '2rem', height: '2rem', borderRadius: '0.5rem', border: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                 <Maximize size={16} />
              </button>
           </div>

           {/* Real Leaflet Map embed */}
           <div style={{ width: '100%', height: '100%', backgroundColor: '#f0f0f0', position: 'relative' }}>
              <Map 
                center={selectedDelivery ? getCoordinates(selectedDelivery.route, selectedDelivery.progress || 50) : [19.0760, 72.8777]} 
                zoom={selectedDelivery ? 11 : 8} 
                markers={deliveries.map(del => ({
                  position: getCoordinates(del.route, del.progress || 50),
                  title: `Order: ${(del.order_id || del.id).slice(0, 8)} | Route: ${del.route} | Status: ${del.status}`
                }))} 
              />
              <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
                {error && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
                    <div style={{ padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid var(--color-divider)', background: 'white', color: 'var(--color-error)', fontSize: '0.875rem', fontWeight: 600 }}>
                      {error}
                    </div>
                  </div>
                )}
                {!error && !selectedDelivery && !loading && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.7)' }}>
                    <div style={{ padding: '1rem 1.5rem', borderRadius: '0.75rem', border: '1px solid var(--color-divider)', background: 'white', color: 'var(--color-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                      No deliveries available yet.
                    </div>
                  </div>
                )}
              </div>
           </div>
        </div>

        {/* Sidebar List */}
        <div className="deliveries-panel">
           <div className="dashboard-card deliveries-panel__list">
              <h3 className="dashboard-card-title mb-4">Shipments</h3>
              <div className="deliveries-panel__items">
                {!loading && deliveries.length === 0 && (
                  <div className="deliveries-panel__empty">
                    No shipments found. Add delivery updates to see them here.
                  </div>
                )}
                {deliveries.map((del) => {
                  const isActive = selectedDelivery?.id === del.id;
                  const cfg = statusConfig[del.status] || statusConfig.pending;
                  return (
                    <div 
                      key={del.id} 
                      onClick={() => setSelectedDelivery(del)}
                      className={`deliveries-panel__item ${isActive ? "deliveries-panel__item--active" : ""}`}
                    >
                      <div className="d-flex align-center justify-between mb-1">
                        <span className="deliveries-panel__id">{(del.order_id || del.id).slice(0, 8)}</span>
                        <Badge variant={cfg.variant} dot size="sm">{cfg.label}</Badge>
                      </div>
                      <p className="deliveries-panel__note">{del.note || "General Cargo"}</p>
                      <p className="deliveries-panel__note" style={{ fontSize: 12, opacity: 0.85 }}>
                        {del.route || "Mumbai route"} · ETA {del.eta ? new Date(del.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Soon"}
                      </p>
                      <div className="d-flex align-center gap-3 mt-2 deliveries-panel__meta">
                         <span className="d-flex align-center gap-1 deliveries-panel__meta-item">
                            <Clock size={10} /> {new Date(del.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </span>
                         <span className="d-flex align-center gap-1 deliveries-panel__meta-item">
                            <Navigation size={10} /> 12km
                         </span>
                      </div>
                      <div style={{ marginTop: 10 }}>
                        <Link href={`/dashboard/deliveries/${del.order_id || del.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-brand-600)' }}>
                          Track details <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
           </div>

           {/* Selected Delivery Details */}
           {selectedDelivery && (
             <div className="dashboard-card" style={{ padding: '1rem', backgroundColor: 'var(--color-brand-800)', color: 'white' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>Current Milestone</p>
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.25rem' }}>{selectedDelivery.status.replace('_', ' ')}</h4>
                 <p style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '0.5rem', lineHeight: 1.4 }}>{selectedDelivery.note || "Proceeding to destination via highway 4."}</p>
                 <Link href={`/dashboard/deliveries/${selectedDelivery.order_id || selectedDelivery.id}`} style={{ display: 'block', marginTop: '1rem' }}>
                  <Button size="sm" style={{ width: '100%', backgroundColor: 'white', color: 'var(--color-brand-800)', border: 'none' }}>
                    View Full Timeline
                  </Button>
                 </Link>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
