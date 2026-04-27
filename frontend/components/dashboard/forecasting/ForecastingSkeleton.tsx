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

import React from "react";

export function ForecastingSkeleton() {
  return (
    <div className="forecasting-skeleton">
      {/* Header skeleton */}
      <div className="skeleton-header">
        <div className="skeleton-block" style={{ width: "260px", height: "32px", borderRadius: "8px" }} />
        <div className="skeleton-block" style={{ width: "120px", height: "36px", borderRadius: "8px" }} />
      </div>

      {/* Stats row skeleton */}
      <div className="skeleton-stats-row">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-stat-card">
            <div className="skeleton-block" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
            <div style={{ flex: 1 }}>
              <div className="skeleton-block" style={{ width: "80%", height: "14px", borderRadius: "4px", marginBottom: "8px" }} />
              <div className="skeleton-block" style={{ width: "50%", height: "28px", borderRadius: "4px" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Alert cards skeleton */}
      <div className="skeleton-section-title">
        <div className="skeleton-block" style={{ width: "180px", height: "20px", borderRadius: "4px" }} />
      </div>
      <div className="skeleton-cards-grid">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-alert-card">
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <div className="skeleton-block" style={{ width: "60%", height: "20px", borderRadius: "4px" }} />
              <div className="skeleton-block" style={{ width: "80px", height: "24px", borderRadius: "12px" }} />
            </div>
            <div className="skeleton-block" style={{ width: "90%", height: "14px", borderRadius: "4px", marginBottom: "8px" }} />
            <div className="skeleton-block" style={{ width: "70%", height: "14px", borderRadius: "4px", marginBottom: "20px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
              {[1, 2, 3].map((j) => (
                <div key={j} className="skeleton-block" style={{ flex: 1, height: "36px", borderRadius: "8px" }} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="skeleton-chart-card">
        <div className="skeleton-block" style={{ width: "200px", height: "20px", borderRadius: "4px", marginBottom: "24px" }} />
        <div className="skeleton-block" style={{ width: "100%", height: "200px", borderRadius: "8px" }} />
      </div>

      <style>{`
        .forecasting-skeleton {
          padding: 0;
          animation: skeleton-fade 1.5s ease-in-out infinite;
        }
        .skeleton-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .skeleton-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .skeleton-stat-card {
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .skeleton-section-title {
          margin-bottom: 16px;
        }
        .skeleton-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }
        .skeleton-alert-card {
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .skeleton-chart-card {
          background: rgba(255,255,255,0.04);
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .skeleton-block {
          background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
        }
        @keyframes skeleton-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @media (max-width: 768px) {
          .skeleton-stats-row { grid-template-columns: repeat(2, 1fr); }
          .skeleton-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default ForecastingSkeleton;
