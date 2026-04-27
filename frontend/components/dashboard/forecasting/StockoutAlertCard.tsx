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

import React, { useState } from "react";

interface AlertItem {
  id: string;
  product_name: string;
  category: string;
  current_stock: number;
  threshold: number;
  unit: string;
  stockout_predicted: boolean;
  confidence: number;
  confidence_pct: number;
  recommended_reorder_qty: number;
  urgency_level: "High" | "Medium" | "Low";
  days_to_stockout_estimate: number;
  color: "red" | "orange" | "green";
  model_source: string;
  action_status?: string;
}

interface StockoutAlertCardProps {
  item: AlertItem;
  onAction: (itemId: string, productName: string, actionType: "approve" | "edit" | "ignore", qty: number) => Promise<void>;
  onEditRequest: (item: AlertItem) => void;
}

export function StockoutAlertCard({ item, onAction, onEditRequest }: StockoutAlertCardProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const colorMap = {
    red: {
      border: "rgba(239, 68, 68, 0.4)",
      bg: "rgba(239, 68, 68, 0.08)",
      badge: "#ef4444",
      glow: "0 0 20px rgba(239, 68, 68, 0.15)",
      icon: "🔴",
      label: "Critical",
    },
    orange: {
      border: "rgba(249, 115, 22, 0.4)",
      bg: "rgba(249, 115, 22, 0.06)",
      badge: "#f97316",
      glow: "0 0 20px rgba(249, 115, 22, 0.12)",
      icon: "🟠",
      label: "Warning",
    },
    green: {
      border: "rgba(34, 197, 94, 0.3)",
      bg: "rgba(34, 197, 94, 0.04)",
      badge: "#22c55e",
      glow: "0 0 20px rgba(34, 197, 94, 0.10)",
      icon: "🟢",
      label: "Safe",
    },
  };

  const c = colorMap[item.color];

  async function handleAction(type: "approve" | "edit" | "ignore") {
    if (type === "edit") {
      onEditRequest(item);
      return;
    }
    setLoading(type);
    try {
      await onAction(item.id, item.product_name, type, item.recommended_reorder_qty);
      setDone(type);
    } finally {
      setLoading(null);
    }
  }

  const daysText = item.days_to_stockout_estimate >= 999
    ? "No stockout risk"
    : item.days_to_stockout_estimate <= 1
    ? "< 1 day remaining!"
    : `${item.days_to_stockout_estimate} day${item.days_to_stockout_estimate !== 1 ? "s" : ""} remaining`;

  const stockCoverageBar = Math.min(100, (item.current_stock / Math.max(item.threshold, 1)) * 100);

  return (
    <div className="alert-card" style={{ border: `1px solid ${c.border}`, background: `${c.bg}`, boxShadow: c.glow }}>
      {/* Header */}
      <div className="alert-card-header">
        <div className="alert-card-title-group">
          <span className="alert-icon">{c.icon}</span>
          <div>
            <h3 className="alert-product-name">{item.product_name}</h3>
            <span className="alert-category">{item.category}</span>
          </div>
        </div>
        <div className="alert-badge" style={{ background: `${c.badge}20`, color: c.badge, border: `1px solid ${c.badge}40` }}>
          {c.label}
        </div>
      </div>

      {/* Stockout Message */}
      <div className="alert-message">
        {item.stockout_predicted ? (
          <p className="alert-msg-critical">
            ⚠ <strong>{item.product_name}</strong> stock may run out in{" "}
            <strong style={{ color: c.badge }}>{item.days_to_stockout_estimate} day{item.days_to_stockout_estimate !== 1 ? "s" : ""}</strong>
          </p>
        ) : (
          <p className="alert-msg-safe">
            {item.days_to_stockout_estimate < 10
              ? `⚠ Monitor closely — ${daysText}`
              : `✓ Stock healthy — ${daysText}`}
          </p>
        )}
      </div>

      {/* Stats Row */}
      <div className="alert-stats-row">
        <div className="alert-stat">
          <span className="alert-stat-label">Current Stock</span>
          <span className="alert-stat-value">{item.current_stock.toLocaleString()} {item.unit}</span>
        </div>
        <div className="alert-stat">
          <span className="alert-stat-label">Confidence</span>
          <span className="alert-stat-value confidence" style={{ color: c.badge }}>
            {item.confidence_pct}%
          </span>
        </div>
        <div className="alert-stat">
          <span className="alert-stat-label">Reorder Qty</span>
          <span className="alert-stat-value">
            {item.recommended_reorder_qty > 0 ? `${item.recommended_reorder_qty.toLocaleString()} ${item.unit}` : "—"}
          </span>
        </div>
      </div>

      {/* Stock Coverage Bar */}
      <div className="stock-bar-wrapper">
        <div className="stock-bar-label">
          <span>Stock Coverage</span>
          <span>{Math.round(stockCoverageBar)}%</span>
        </div>
        <div className="stock-bar-track">
          <div
            className="stock-bar-fill"
            style={{
              width: `${stockCoverageBar}%`,
              background: c.badge,
              transition: "width 0.8s ease",
            }}
          />
        </div>
      </div>

      {/* Model Source Tag */}
      {item.model_source && (
        <div className="model-source-tag">
          {item.model_source === "ml_model"
            ? "🤖 ML Model"
            : item.model_source === "demo"
            ? "📊 Demo Data"
            : "📐 Heuristic"}
        </div>
      )}

      {/* Action Buttons */}
      {done ? (
        <div className="alert-action-done">
          {done === "approve" && "✅ Reorder Approved"}
          {done === "ignore" && "🚫 Alert Ignored"}
        </div>
      ) : (
        <div className="alert-actions">
          <button
            className="btn-approve"
            onClick={() => handleAction("approve")}
            disabled={!!loading || item.recommended_reorder_qty === 0}
            title={item.recommended_reorder_qty === 0 ? "No reorder needed" : ""}
          >
            {loading === "approve" ? <span className="btn-spinner" /> : null}
            ✓ Approve Reorder
          </button>
          <button
            className="btn-edit"
            onClick={() => handleAction("edit")}
            disabled={!!loading}
          >
            ✎ Edit Qty
          </button>
          <button
            className="btn-ignore"
            onClick={() => handleAction("ignore")}
            disabled={!!loading}
          >
            {loading === "ignore" ? <span className="btn-spinner" /> : null}
            ✕ Ignore
          </button>
        </div>
      )}

      <style>{`
        .alert-card {
          border-radius: 18px;
          padding: 22px 24px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .alert-card:hover {
          transform: translateY(-2px);
        }
        .alert-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
        }
        .alert-card-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .alert-icon { font-size: 22px; }
        .alert-product-name {
          font-size: 16px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 2px;
        }
        .alert-category {
          font-size: 11px;
          color: rgba(148, 163, 184, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .alert-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }
        .alert-message { margin-bottom: 16px; }
        .alert-msg-critical, .alert-msg-safe {
          font-size: 13.5px;
          color: rgba(226, 232, 240, 0.9);
          margin: 0;
          line-height: 1.5;
        }
        .alert-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }
        .alert-stat {
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
          padding: 10px;
          text-align: center;
        }
        .alert-stat-label {
          display: block;
          font-size: 10px;
          color: rgba(148, 163, 184, 0.7);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .alert-stat-value {
          display: block;
          font-size: 13px;
          font-weight: 700;
          color: #e2e8f0;
        }
        .alert-stat-value.confidence { font-size: 16px; }
        .stock-bar-wrapper { margin-bottom: 14px; }
        .stock-bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(148, 163, 184, 0.7);
          margin-bottom: 6px;
        }
        .stock-bar-track {
          height: 5px;
          background: rgba(255,255,255,0.08);
          border-radius: 4px;
          overflow: hidden;
        }
        .stock-bar-fill {
          height: 100%;
          border-radius: 4px;
        }
        .model-source-tag {
          font-size: 10px;
          color: rgba(148,163,184,0.5);
          margin-bottom: 14px;
        }
        .alert-actions {
          display: flex;
          gap: 8px;
        }
        .btn-approve, .btn-edit, .btn-ignore {
          flex: 1;
          padding: 9px 4px;
          border-radius: 10px;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        .btn-approve {
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          border: 1px solid rgba(34,197,94,0.3);
        }
        .btn-approve:hover:not(:disabled) {
          background: rgba(34, 197, 94, 0.25);
          transform: translateY(-1px);
        }
        .btn-edit {
          background: rgba(99, 102, 241, 0.15);
          color: #818cf8;
          border: 1px solid rgba(99,102,241,0.3);
        }
        .btn-edit:hover:not(:disabled) {
          background: rgba(99, 102, 241, 0.25);
          transform: translateY(-1px);
        }
        .btn-ignore {
          background: rgba(239, 68, 68, 0.10);
          color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .btn-ignore:hover:not(:disabled) {
          background: rgba(239, 68, 68, 0.20);
          transform: translateY(-1px);
        }
        .btn-approve:disabled, .btn-edit:disabled, .btn-ignore:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
        .btn-spinner {
          width: 12px; height: 12px;
          border: 2px solid currentColor;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .alert-action-done {
          text-align: center;
          font-size: 13px;
          font-weight: 600;
          color: rgba(148, 163, 184, 0.9);
          padding: 10px;
          background: rgba(255,255,255,0.04);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

export default StockoutAlertCard;
