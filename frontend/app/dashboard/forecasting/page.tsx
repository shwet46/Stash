"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, ReferenceArea
} from "recharts";
import {
  LuSparkles as Sparkles,
  LuTrendingUp as TrendingUp,
  LuTrendingDown as TrendingDown,
  LuTriangleAlert as AlertTriangle,
  LuLightbulb as Bulb,
  LuMic as Mic,
  LuBrain as Brain,
  LuCheck as Check,
  LuActivity as Activity,
} from "react-icons/lu";
import { CLIENT_BACKEND_URL } from "@/lib/backend-url";

const API = CLIENT_BACKEND_URL;

// ─── Chart Colors (Stash Project Theme) ───────────────────────────────────────
const CHART_COLORS = ["#d4956a", "#108548", "#1a73e8", "#f29900", "#6b4226"];

// ─── Types ────────────────────────────────────────────────────────────────────
interface ForecastPoint {
  date: string; day: string; weekday?: string;
  predicted_demand: number; lower_bound: number; upper_bound: number;
}
interface ProductForecast {
  product_id: string; product_name: string; category: string;
  current_stock: number; threshold: number; unit: string;
  avg_daily_demand: number; demand_growth_pct: number;
  days_remaining: number; urgency_level: string; orders_count: number;
  forecast: ForecastPoint[];
}
interface AlertItem {
  id: string; product_name: string; category: string;
  current_stock: number; threshold: number; unit: string;
  stockout_predicted: boolean; confidence: number; confidence_pct: number;
  recommended_reorder_qty: number; urgency_level: "High" | "Medium" | "Low";
  days_to_stockout_estimate: number; color: string; model_source: string;
  recommendation_reason?: string;
}
interface MarketInsight {
  type: string; title: string; subtitle: string; highlight: string; icon_key: string;
}
type ChartPoint = Record<string, number | string | boolean | null>;

// WEEKDAY_MULT shared logic
const WEEKDAY_MULT: Record<string, number> = {
  Monday: 1.14, Tuesday: 1.08, Wednesday: 1.05,
  Thursday: 1.11, Friday: 1.18, Saturday: 0.88, Sunday: 0.70,
};

function buildChartData(products: ProductForecast[]): ChartPoint[] {
  if (!products.length) return [];
  const today = new Date();
  const points: ChartPoint[] = [];

  // Simulated history (4 days) -> To "Today"
  for (let d = -4; d <= 0; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const mult = WEEKDAY_MULT[weekday] ?? 1.0;
    const pt: ChartPoint = { day: d === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" }), isToday: d === 0 };
    products.forEach((p) => {
      const factor = 1 - (p.demand_growth_pct * (-d) / 30);
      const val = Math.max(0, p.avg_daily_demand * mult * Math.max(factor, 0.5));
      const rounded = Math.round(val * 10) / 10;
      pt[`${p.product_name}_actual`] = rounded;
      
      // Connect past sequence to future sequence by marking "Today" as the start of _predicted
      if (d === 0) {
        pt[`${p.product_name}_predicted`] = rounded;
      }
    });
    points.push(pt);
  }

  // Future (7 days)
  const maxDays = Math.max(...products.map((p) => p.forecast.length));
  for (let i = 0; i < maxDays; i++) {
    const pt: ChartPoint = { day: products[0]?.forecast[i]?.day ?? `+${i + 1}`, isToday: false };
    products.forEach((p) => {
      pt[`${p.product_name}_predicted`] = p.forecast[i]?.predicted_demand ?? null;
    });
    points.push(pt);
  }
  return points;
}

// ─── Custom Tooltip (Light Theme) ──────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", border: "1px solid var(--color-divider)",
      borderRadius: 8, padding: "12px", color: "var(--color-brand-800)", fontSize: 12, boxShadow: "var(--shadow-card-hover)",
    }}>
      <p style={{ fontWeight: 700, margin: "0 0 8px 0", color: "var(--color-brand-800)" }}>{label}</p>
      {payload.map((entry: any, i: number) => {
        const isPred = entry.dataKey.includes("_predicted");
        const name = entry.dataKey.replace("_actual", "").replace("_predicted", "");
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color }} />
              <span style={{ color: "var(--color-muted)" }}>{name}{isPred ? " (est)" : ""}</span>
            </div>
            <strong>{Number(entry.value).toFixed(1)}</strong>
          </div>
        );
      })}
    </div>
  );
}

// ─── Intervention Card (Narrative UX) ─────────────────────────────────────────
function InterventionCard({ item, onAction }: {
  item: AlertItem;
  onAction: (id: string, name: string, type: "approve" | "ignore") => void;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const isHigh = item.urgency_level === "High";
  
  // Categorize reason for visual splitting
  let insightHeader = "Demand & Stock Forecast";
  let Icon = Brain;
  let headerColor = "var(--color-success)";

  if (item.recommendation_reason?.includes("LIVE VOICE BOT SIGNAL")) {
    insightHeader = "Live Voice Signal (ACTIVE)";
    Icon = Mic;
    headerColor = "var(--color-success)";
  } else if (item.recommendation_reason?.includes("Festival") || item.recommendation_reason?.includes("surged")) {
    insightHeader = "Demand Spike Warning";
    Icon = TrendingUp;
    headerColor = "var(--color-warning)";
  } else if (item.recommendation_reason?.includes("WARNING: Incoming supply") || isHigh) {
    insightHeader = "Stock-Out Emergency";
    Icon = AlertTriangle;
    headerColor = "var(--color-error)";
  }

  return (
    <div className="dashboard-card" style={{
      display: "flex", flexDirection: "column", padding: "20px",
      border: `1px solid ${isHigh ? "rgba(217,48,37,0.3)" : "var(--color-divider)"}`,
      boxShadow: isHigh ? "0 4px 20px rgba(217, 48, 37, 0.08)" : "var(--shadow-card)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ padding: "4px", borderRadius: 6, background: `${headerColor}20`, color: headerColor }}>
          <Icon size={14} />
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: headerColor, textTransform: "uppercase" }}>
          {insightHeader}
        </span>
      </div>

      <div style={{ marginBottom: 16, flex: 1 }}>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--color-brand-800)", margin: "0 0 6px 0" }}>{item.product_name}</h3>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-muted)", margin: 0 }}>
          {item.recommendation_reason?.split(". ").map((s, i, a) => (
            <React.Fragment key={i}>
              {s}{i < a.length - 1 ? ". " : ""}
            </React.Fragment>
          ))}
        </p>
      </div>

      {item.recommended_reorder_qty > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-brand-50)", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: "var(--color-brand-700)" }}>Recommended Action:</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: isHigh ? "var(--color-error)" : "var(--color-warning)" }}>
              Reorder {item.recommended_reorder_qty} {item.unit}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              onClick={async () => { setLoading("approve"); await onAction(item.id, item.product_name, "approve"); setLoading(null); }}
              disabled={!!loading} 
              style={{ flex: 2, background: isHigh ? "var(--color-error)" : "var(--color-brand-600)", color: "white", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", justifyContent: "center" }}>
              {loading === "approve" ? "Processing…" : "✓ Approve Request"}
            </button>
            <button 
              onClick={async () => { setLoading("ignore"); await onAction(item.id, item.product_name, "ignore"); setLoading(null); }}
              disabled={!!loading}
              style={{ flex: 1, background: "transparent", color: "var(--color-muted)", padding: "10px", borderRadius: 10, fontSize: 13, fontWeight: 600, border: "1px solid var(--color-divider)", cursor: "pointer", display: "flex", justifyContent: "center" }}>
              {loading === "ignore" ? "…" : "Dismiss"}
            </button>
          </div>
        </>
      ) : (
        <div style={{ background: "rgba(16,133,72,0.1)", color: "var(--color-success)", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          ✓ Stock Levels Optimized
        </div>
      )}
    </div>
  );
}

// ─── Main Page UX ─────────────────────────────────────────────────────────────
export default function DynamicForecastingPage() {
  const [insights, setInsights] = useState<{ score: number, label: string, items: MarketInsight[] } | null>(null);
  const [chartProducts, setChartProducts] = useState<ProductForecast[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [insRes, chartRes, alertsRes] = await Promise.all([
          fetch(`${API}/api/forecasting/insights`),
          fetch(`${API}/api/forecasting/demand-chart?limit=4`),
          fetch(`${API}/api/forecasting/alerts?limit=10`),
        ]);
        if (insRes.ok) {
          const raw = await insRes.json();
          setInsights({ score: raw.market_efficiency_score, label: raw.efficiency_label, items: raw.top_insights });
        }
        if (chartRes.ok) setChartProducts(await chartRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function handleAction(id: string, name: string, type: "approve" | "ignore") {
    try {
      await fetch(`${API}/api/forecasting/actions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: id, product_name: name, action_type: type, approved_qty: alerts.find((a)=>a.id===id)?.recommended_reorder_qty || 0 }),
      });
      // Optimistic update
      setAlerts(prev => prev.filter(a => a.id !== id));
      
      // Also trigger a refresh of the insights
      fetch(`${API}/api/forecasting/insights`).then(r => r.json()).then(raw => {
        setInsights({ score: raw.market_efficiency_score, label: raw.efficiency_label, items: raw.top_insights });
      });
    } catch (e) {}
  }

  const chartData = buildChartData(chartProducts);

  if (loading) {
    return <div style={{ padding: 40, color: "var(--color-brand-800)", textAlign: "center" }}>Gathering predictive intelligence...</div>;
  }

  return (
    <div className="dashboard-wrapper">
      
      {/* ── Level 1: Market Intelligence Radar ────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title d-flex align-center gap-2">
            
            Dynamic Forecasting
            <span style={{ background: "var(--color-info)", color: "white", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, marginLeft: 8 }}>LIVE</span>
          </h1>
          <p className="dashboard-subtitle">
            AI predictions for the next 7 days — integrating climate, logistics, & live demand.
          </p>
        </div>

        <div className="dashboard-header-right">
          <div style={{ textAlign: "right", background: "white", padding: "10px 16px", borderRadius: 12, border: "1px solid var(--color-divider)", boxShadow: "var(--shadow-sm)" }}>
            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "var(--color-muted)", margin: "0 0 4px" }}>Market Efficiency Score</p>
            <div style={{ fontSize: 32, fontWeight: 800, lineHeight: 1, color: "var(--color-brand-800)" }}>{insights?.score || 0}<span style={{ fontSize: 14, color: "var(--color-brand-400)" }}>/100</span></div>
            <p style={{ fontSize: 11, color: "var(--color-muted)", margin: "4px 0 0" }}>{insights?.label}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 40, flexWrap: "wrap" }}>
        {insights?.items.map((ins, i) => (
          <div key={i} className="dashboard-card" style={{ flex: "1 1 250px", padding: "16px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              {ins.icon_key === "trend_up" && <TrendingUp size={14} style={{ color: "var(--color-warning)" }} />}
              {ins.icon_key === "trend_down" && <TrendingDown size={14} style={{ color: "var(--color-info)" }} />}
              {ins.icon_key === "alert" && <AlertTriangle size={14} style={{ color: "var(--color-error)" }} />}
              {ins.icon_key === "bulb" && <Bulb size={14} style={{ color: "var(--color-success)" }} />}
              {ins.icon_key === "check" && <Check size={14} style={{ color: "var(--color-success)" }} />}
              <span style={{ fontSize: 11, fontWeight: 700, color: "var(--color-brand-600)" }}>{ins.type.toUpperCase()}</span>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "var(--color-brand-800)" }}>{ins.title}</h3>
            <p style={{ fontSize: 12, color: "var(--color-muted)", margin: 0 }}>{ins.subtitle}</p>
            <div style={{ position: "absolute", bottom: -5, right: 10, fontSize: 50, fontWeight: 800, opacity: 0.04, lineHeight: 1, color: "var(--color-brand-800)" }}>
              {ins.highlight.replace(/[^0-9]/g, "")}
            </div>
          </div>
        ))}
      </div>

      {/* ── Level 2: The Intersection Trajectory ──────────────────────────── */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--color-brand-800)", margin: "0 0 4px" }}>Demand & Stock Trajectory</h2>
            <p style={{ fontSize: 12, color: "var(--color-muted)", margin: 0 }}>Actual vs Predicted Volume — Ensure lines stay above the stockout zone</p>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {chartProducts.map((p, i) => (
              <div key={p.product_id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--color-brand-800)" }}>
                <div style={{ width: 12, height: 4, borderRadius: 2, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {p.product_name}
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: "24px 20px 16px", position: "relative" }}>
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" opacity={0.6} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted)", fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-brand-50)" }} />

                {/* Stockout Zone */}
                <ReferenceArea y1={0} y2={10} fill="var(--color-error)" fillOpacity={0.08} />

                {/* TODAY Line */}
                <ReferenceLine x="Today" stroke="var(--color-warning)" strokeWidth={2} strokeDasharray="4 4" label={{ position: "insideTopLeft", value: "TODAY ▶", fill: "var(--color-warning)", fontSize: 11, fontWeight: 800 }} />

                {chartProducts.map((p, i) => {
                  const color = CHART_COLORS[i % CHART_COLORS.length];
                  return (
                    <React.Fragment key={p.product_id}>
                      <Line dataKey={`${p.product_name}_actual`} stroke={color} strokeWidth={3} dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "white" }} activeDot={{ r: 6 }} connectNulls={false} isAnimationActive={true} />
                      <Line dataKey={`${p.product_name}_predicted`} stroke={color} strokeWidth={2} strokeDasharray="5 5" dot={{ r: 0 }} activeDot={{ r: 6 }} connectNulls={false} isAnimationActive={true} />
                    </React.Fragment>
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          )}
          <div style={{ position: "absolute", bottom: 24, left: 40, fontSize: 10, fontWeight: 700, color: "var(--color-error)", display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={12} /> STOCKOUT ZONE
          </div>
        </div>
      </div>

      {/* ── Level 3: Active Interventions ─────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <Activity size={18} style={{ color: "var(--color-brand-600)" }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: "var(--color-brand-800)" }}>Active Interventions Required</h2>
        </div>
        
        <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {alerts.filter(a => a.urgency_level === "High" || a.recommended_reorder_qty > 0).map(item => (
            <InterventionCard key={item.id} item={item} onAction={handleAction} />
          ))}
          {/* If no criticals, show a dummy success card */}
          {alerts.filter(a => a.urgency_level === "High" || a.recommended_reorder_qty > 0).length === 0 && (
            <div style={{ background: "rgba(16,133,72,0.05)", border: "1px dashed var(--color-success)", borderRadius: 16, padding: "40px 20px", textAlign: "center", color: "var(--color-success)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Check size={32} style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px 0" }}>Pipeline Clear</h3>
              <p style={{ fontSize: 13, margin: 0, opacity: 0.8 }}>No critical interventions required.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
