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

interface EditQtyModalProps {
  isOpen: boolean;
  productName: string;
  recommendedQty: number;
  unit: string;
  onConfirm: (qty: number, note: string) => Promise<void>;
  onClose: () => void;
}

export function EditQtyModal({
  isOpen,
  productName,
  recommendedQty,
  unit,
  onConfirm,
  onClose,
}: EditQtyModalProps) {
  const [qty, setQty] = useState(recommendedQty);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  async function handleConfirm() {
    if (qty <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onConfirm(qty, note);
      onClose();
    } catch (e) {
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const pct = recommendedQty > 0 ? Math.round((qty / recommendedQty) * 100) : 100;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="modal-icon">✎</span>
            <h2 className="modal-title">Edit Reorder Quantity</h2>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-product">
          Product: <strong style={{ color: "#818cf8" }}>{productName}</strong>
        </p>

        {/* Recommended banner */}
        <div className="modal-recommended-banner">
          <span>🤖 AI Recommended:</span>
          <strong>{recommendedQty.toLocaleString()} {unit}</strong>
        </div>

        {/* Qty Input */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="qty-input">
            Adjusted Quantity ({unit})
          </label>
          <div className="modal-input-row">
            <button
              className="modal-stepper"
              onClick={() => setQty(Math.max(1, qty - 10))}
              disabled={loading}
            >−</button>
            <input
              id="qty-input"
              className="modal-input"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              disabled={loading}
            />
            <button
              className="modal-stepper"
              onClick={() => setQty(qty + 10)}
              disabled={loading}
            >+</button>
          </div>

          {/* Comparison bar */}
          <div className="modal-comparison">
            <div className="modal-comp-row">
              <span className="modal-comp-label">AI Recommended</span>
              <span className="modal-comp-value ai">{recommendedQty} {unit}</span>
            </div>
            <div className="modal-comp-row">
              <span className="modal-comp-label">Your Quantity</span>
              <span className="modal-comp-value" style={{ color: pct > 100 ? "#f97316" : pct < 70 ? "#ef4444" : "#22c55e" }}>
                {qty} {unit} ({pct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="modal-field">
          <label className="modal-label" htmlFor="note-input">
            Note (optional)
          </label>
          <textarea
            id="note-input"
            className="modal-textarea"
            placeholder="Reason for adjustment..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            disabled={loading}
          />
        </div>

        {error && <p className="modal-error">{error}</p>}

        {/* Actions */}
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="modal-btn-confirm" onClick={handleConfirm} disabled={loading}>
            {loading
              ? <><span className="btn-spinner-sm" /> Submitting...</>
              : "✓ Confirm Reorder"}
          </button>
        </div>

        <style>{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            animation: fadeIn 0.15s ease;
          }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          .modal-box {
            background: #0f172a;
            border: 1px solid rgba(99, 102, 241, 0.3);
            border-radius: 20px;
            padding: 32px;
            width: 100%;
            max-width: 440px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.1);
            animation: slideUp 0.2s ease;
          }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
          }
          .modal-header > div {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .modal-icon { font-size: 20px; }
          .modal-title {
            font-size: 18px;
            font-weight: 700;
            color: #f1f5f9;
            margin: 0;
          }
          .modal-close {
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(148,163,184,0.7);
            width: 32px; height: 32px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 13px;
            transition: all 0.2s;
          }
          .modal-close:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
          .modal-product {
            font-size: 13px;
            color: rgba(148,163,184,0.7);
            margin: 0 0 16px;
          }
          .modal-recommended-banner {
            background: rgba(99,102,241,0.1);
            border: 1px solid rgba(99,102,241,0.2);
            border-radius: 10px;
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 13px;
            color: rgba(148,163,184,0.8);
            margin-bottom: 20px;
          }
          .modal-recommended-banner strong { color: #818cf8; font-size: 15px; }
          .modal-field { margin-bottom: 20px; }
          .modal-label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            color: rgba(148,163,184,0.7);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }
          .modal-input-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .modal-stepper {
            width: 40px; height: 44px;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05);
            color: #e2e8f0;
            font-size: 18px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .modal-stepper:hover:not(:disabled) { background: rgba(99,102,241,0.2); }
          .modal-input {
            flex: 1;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 10px;
            color: #f1f5f9;
            font-size: 20px;
            font-weight: 700;
            text-align: center;
            padding: 8px 12px;
            outline: none;
            transition: border 0.2s;
          }
          .modal-input:focus { border-color: rgba(99,102,241,0.5); }
          .modal-comparison {
            margin-top: 12px;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .modal-comp-row {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }
          .modal-comp-label { color: rgba(148,163,184,0.5); }
          .modal-comp-value { font-weight: 600; color: #e2e8f0; }
          .modal-comp-value.ai { color: #818cf8; }
          .modal-textarea {
            width: 100%;
            background: rgba(255,255,255,0.04);
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 10px;
            color: #e2e8f0;
            font-size: 13px;
            padding: 10px 14px;
            resize: vertical;
            outline: none;
            font-family: inherit;
            transition: border 0.2s;
            box-sizing: border-box;
          }
          .modal-textarea:focus { border-color: rgba(99,102,241,0.4); }
          .modal-error {
            font-size: 12px;
            color: #f87171;
            margin: -8px 0 12px;
          }
          .modal-actions {
            display: flex;
            gap: 10px;
            padding-top: 4px;
          }
          .modal-btn-cancel {
            flex: 1;
            padding: 11px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.04);
            color: rgba(148,163,184,0.8);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .modal-btn-cancel:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
          .modal-btn-confirm {
            flex: 2;
            padding: 11px;
            border-radius: 12px;
            border: none;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            box-shadow: 0 4px 15px rgba(99,102,241,0.3);
          }
          .modal-btn-confirm:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
          .modal-btn-confirm:disabled, .modal-btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
          .btn-spinner-sm {
            width: 14px; height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
            display: inline-block;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

export default EditQtyModal;
