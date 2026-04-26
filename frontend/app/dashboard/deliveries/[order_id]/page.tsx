"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LuClock as Clock, LuMapPinned as MapPinned, LuTruck as Truck, LuArrowLeft as ArrowLeft, LuRefreshCw as RefreshCw } from "react-icons/lu";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { fetchDeliveryTimeline } from "@/lib/api";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/components/ui/Map"), { ssr: false });

type TimelineItem = {
  status: string;
  note: string;
  updated_at: string;
};

export default function DeliveryTrackingPage() {
  const router = useRouter();
  const params = useParams<{ order_id: string }>();
  const orderId = decodeURIComponent(params.order_id);
  const shortOrderId = orderId.slice(0, 8);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDeliveryTimeline(orderId);
      setTimeline(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch delivery timeline");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [orderId]);

  const latest = timeline[timeline.length - 1];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10, color: "var(--color-brand-600)", fontWeight: 700, cursor: "pointer" }} onClick={() => router.back()}>
            <ArrowLeft size={16} /> Back to deliveries
          </div>
          <h1 className="dashboard-title">Tracking {shortOrderId}</h1>
          <p className="dashboard-subtitle">Timeline, milestones, and live delivery notes.</p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" onClick={loadTimeline} icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}>
            Refresh Timeline
          </Button>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div className="dashboard-card" style={{ minHeight: 420, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(107,66,38,0.08)", display: "grid", placeItems: "center" }}>
              <Truck size={22} color="var(--color-brand-600)" />
            </div>
            <div>
              <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 12 }}>Order</p>
              <h2 style={{ margin: 0, color: "var(--color-brand-800)" }}>{shortOrderId}</h2>
            </div>
          </div>

          {error && <div style={{ color: "var(--color-error)", marginBottom: 12 }}>{error}</div>}

          {loading && !timeline.length ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <RefreshCw size={24} className="spin" />
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {timeline.map((item, index) => (
                <div key={index} style={{ border: "1px solid var(--color-divider)", borderRadius: 16, padding: "0.9rem 1rem", background: index === timeline.length - 1 ? "rgba(107,66,38,0.05)" : "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                    <Badge variant={item.status === "delivered" ? "success" : item.status === "in_transit" ? "default" : "warning"} size="sm" dot>
                      {item.status}
                    </Badge>
                    <span style={{ fontSize: 12, color: "var(--color-muted)", display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <Clock size={12} /> {new Date(item.updated_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: "var(--color-brand-800)", fontWeight: 600 }}>{item.note}</p>
                </div>
              ))}
              {timeline.length === 0 && !error && (
                <div style={{ color: "var(--color-muted)", textAlign: "center", padding: 24 }}>No timeline entries found for this delivery.</div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="dashboard-card">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <MapPinned size={18} color="var(--color-brand-600)" />
              <h3 className="dashboard-card-title" style={{ margin: 0 }}>Summary</h3>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>Latest status</p>
                <p style={{ margin: "0.2rem 0 0", fontWeight: 700, color: "var(--color-brand-800)" }}>{latest?.status || "pending"}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>Latest note</p>
                <p style={{ margin: "0.2rem 0 0", fontWeight: 600, color: "var(--color-brand-800)", lineHeight: 1.5 }}>{latest?.note || "Waiting for first update."}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)" }}>Updates</p>
                <p style={{ margin: "0.2rem 0 0", fontWeight: 700, color: "var(--color-brand-800)" }}>{timeline.length}</p>
              </div>
            </div>
          </div>

          {/* Mini Map */}
          <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden', height: '240px', marginTop: '1.5rem', position: 'relative' }}>
            <Map 
              center={[19.2, 72.96]} 
              zoom={11} 
              markers={[{ position: [19.2, 72.96], title: "Current Location" }]} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}