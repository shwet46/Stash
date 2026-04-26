"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LuHistory as History, LuMic as Mic, LuRefreshCw as RefreshCw, LuSparkles as Sparkles } from "react-icons/lu";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { fetchRecentActivities, RecentActivityList } from "@/lib/api";

export default function ActivitiesPage() {
  const { data: session } = useSession();
  const rawRole = ((session?.user as any)?.role || "worker").toLowerCase();
  const role = rawRole === "admin" || rawRole === "owner" ? "admin" : "worker";
  const [data, setData] = useState<RecentActivityList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const result = await fetchRecentActivities(role as "admin" | "worker", 20);
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Failed to load activities:", err);
      setError("Could not load recent activities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Recent Activities</h1>
          <p className="dashboard-subtitle">
            Voice-driven actions for {role === "admin" ? "admin" : "worker"} operations
          </p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" onClick={load} icon={<RefreshCw size={16} className={loading ? "spin" : ""} />}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="dashboard-card" style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(107,66,38,0.08)", display: "grid", placeItems: "center" }}>
          <History size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, color: "var(--color-brand-800)" }}>
            {role === "admin" ? "Admin activity stream" : "Worker activity stream"}
          </p>
          <p style={{ margin: 0, color: "var(--color-muted)", fontSize: 14 }}>
            Shows the latest voice actions saved to Firestore.
          </p>
        </div>
        <Badge variant="default" size="sm" dot>
          Live
        </Badge>
      </div>

      {error && (
        <div className="dashboard-card" style={{ marginBottom: 20, color: "var(--color-error)" }}>
          {error}
        </div>
      )}

      <div className="dashboard-card">
        {loading && !data ? (
          <div style={{ padding: 32, display: "flex", justifyContent: "center" }}>
            <RefreshCw size={24} className="spin" />
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {(data?.items || []).map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  padding: "1rem 1.1rem",
                  borderRadius: 16,
                  border: "1px solid var(--color-divider)",
                  background: "rgba(255,255,255,0.75)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(52,168,83,0.08)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Mic size={18} color="var(--color-success)" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, color: "var(--color-brand-800)" }}>{item.activity}</p>
                    <p style={{ margin: "0.2rem 0 0", fontSize: 13, color: "var(--color-muted)" }}>
                      {item.time} • {item.source} • {item.role}
                    </p>
                  </div>
                </div>
                <Badge variant={item.status === "processed" ? "success" : "warning"} size="sm" dot>
                  {item.status}
                </Badge>
              </div>
            ))}

            {(!data?.items || data.items.length === 0) && (
              <div style={{ padding: 32, textAlign: "center", color: "var(--color-muted)" }}>
                <div style={{ marginBottom: 10 }}>
                  <Sparkles size={24} />
                </div>
                No recent voice activities yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}