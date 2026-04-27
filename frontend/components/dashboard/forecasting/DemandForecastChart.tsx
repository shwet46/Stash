// Copyright 2026 Shweta Behera
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface ForecastPoint {
  date: string;
  day: string;
  predicted_demand: number;
  lower_bound: number;
  upper_bound: number;
}

interface ProductForecast {
  product_id: string;
  product_name: string;
  category: string;
  current_stock: number;
  unit: string;
  avg_daily_demand: number;
  demand_growth_pct: number;
  forecast: ForecastPoint[];
}

interface DemandForecastChartProps {
  data: ProductForecast[];
  loading?: boolean;
}

const COLORS = [
  { stroke: "#6366f1", fill: "#6366f1" },
  { stroke: "#f97316", fill: "#f97316" },
  { stroke: "#22c55e", fill: "#22c55e" },
  { stroke: "#ec4899", fill: "#ec4899" },
  { stroke: "#06b6d4", fill: "#06b6d4" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip-label">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="chart-tooltip-row">
          <span className="chart-tooltip-dot" style={{ background: entry.color }} />
          <span className="chart-tooltip-name">{entry.name}:</span>
          <span className="chart-tooltip-value">{Number(entry.value).toFixed(1)} units</span>
        </div>
      ))}
      <style>{`
        .chart-tooltip {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          padding: 12px 16px;
          backdrop-filter: blur(12px);
          min-width: 180px;
        }
        .chart-tooltip-label {
          font-size: 12px;
          color: rgba(148, 163, 184, 0.9);
          margin: 0 0 8px;
          font-weight: 600;
        }
        .chart-tooltip-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
          font-size: 12px;
        }
        .chart-tooltip-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .chart-tooltip-name { color: rgba(148, 163, 184, 0.7); flex: 1; }
        .chart-tooltip-value { color: #e2e8f0; font-weight: 700; }
      `}</style>
    </div>
  );
};

type ChartRow = { day: string } & Record<string, number | string>;

function buildChartData(products: ProductForecast[]): ChartRow[] {
  if (!products.length) return [];
  const days = products[0].forecast.map((f) => f.day);
  return days.map((day, idx) => {
    const row: ChartRow = { day };
    products.forEach((p) => {
      if (p.forecast[idx]) {
        row[p.product_name] = p.forecast[idx].predicted_demand;
        row[`${p.product_name}_lower`] = p.forecast[idx].lower_bound;
        row[`${p.product_name}_upper`] = p.forecast[idx].upper_bound;
      }
    });
    return row;
  });
}

export function DemandForecastChart({ data, loading }: DemandForecastChartProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  useEffect(() => {
    if (data.length && !selectedProduct) {
      setSelectedProduct(data[0].product_name);
    }
  }, [data]);

  const displayProducts = selectedProduct
    ? data.filter((d) => d.product_name === selectedProduct)
    : data.slice(0, 3);

  const chartData = buildChartData(displayProducts);
  const selectedProductData = data.find((d) => d.product_name === selectedProduct);
  const growthPct = selectedProductData?.demand_growth_pct ?? 0;

  if (loading) {
    return (
      <div className="chart-card">
        <div style={{ width: "100%", height: "260px", background: "rgba(255,255,255,0.04)", borderRadius: "12px", animation: "pulse 1.5s ease-in-out infinite" }} />
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">📈 7-Day Demand Forecast</h3>
          <p className="chart-subtitle">AI-powered demand trend prediction per product</p>
        </div>
        <div className="chart-controls">
          {data.map((p, i) => (
            <button
              key={p.product_id}
              className={`chart-pill ${selectedProduct === p.product_name ? "active" : ""}`}
              style={{
                "--pill-color": COLORS[i % COLORS.length].stroke,
              } as React.CSSProperties}
              onClick={() => setSelectedProduct(
                selectedProduct === p.product_name ? null : p.product_name
              )}
            >
              {p.product_name}
            </button>
          ))}
        </div>
      </div>

      {/* Growth indicator */}
      {selectedProductData && (
        <div className="growth-indicator">
          <span className="growth-label">Demand Trend (30d):</span>
          <span
            className="growth-value"
            style={{ color: growthPct >= 0 ? "#22c55e" : "#ef4444" }}
          >
            {growthPct >= 0 ? "↑" : "↓"} {Math.abs(growthPct * 100).toFixed(1)}%
          </span>
          <span className="growth-avg">
            · Avg {selectedProductData.avg_daily_demand.toFixed(1)} {selectedProductData.unit}/day
          </span>
        </div>
      )}

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {displayProducts.map((p, i) => (
              <linearGradient key={p.product_id} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[i % COLORS.length].fill} stopOpacity={0.25} />
                <stop offset="95%" stopColor={COLORS[i % COLORS.length].fill} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="day"
            tick={{ fill: "rgba(148, 163, 184, 0.7)", fontSize: 11 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(148, 163, 184, 0.7)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          {displayProducts.map((p, i) => (
            <Area
              key={p.product_id}
              type="monotone"
              dataKey={p.product_name}
              stroke={COLORS[i % COLORS.length].stroke}
              strokeWidth={2.5}
              fill={`url(#grad-${i})`}
              dot={{ r: 4, fill: COLORS[i % COLORS.length].stroke, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>

      {/* Confidence band legend */}
      <div className="chart-legend-note">
        <span className="legend-dot" style={{ background: "rgba(99,102,241,0.3)" }} />
        <span>Predictions based on 7d &amp; 30d sales history · Shaded area = confidence interval</span>
      </div>

      <style>{`
        .chart-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 28px;
        }
        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 12px;
        }
        .chart-title {
          font-size: 18px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 4px;
        }
        .chart-subtitle {
          font-size: 12px;
          color: rgba(148,163,184,0.6);
          margin: 0;
        }
        .chart-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chart-pill {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          color: rgba(148,163,184,0.8);
          cursor: pointer;
          transition: all 0.2s;
        }
        .chart-pill.active {
          background: color-mix(in srgb, var(--pill-color) 20%, transparent);
          color: var(--pill-color);
          border-color: color-mix(in srgb, var(--pill-color) 40%, transparent);
        }
        .chart-pill:hover {
          background: rgba(255,255,255,0.08);
        }
        .growth-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 12px;
        }
        .growth-label { color: rgba(148,163,184,0.6); }
        .growth-value { font-weight: 700; font-size: 14px; }
        .growth-avg { color: rgba(148,163,184,0.5); }
        .chart-legend-note {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 14px;
          font-size: 11px;
          color: rgba(148,163,184,0.4);
        }
        .legend-dot {
          width: 12px; height: 8px;
          border-radius: 4px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default DemandForecastChart;
