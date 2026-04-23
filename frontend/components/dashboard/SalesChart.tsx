"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const salesData = [
  { date: "Mar 24", sales: 45000, orders: 12 },
  { date: "Mar 25", sales: 52000, orders: 15 },
  { date: "Mar 26", sales: 48000, orders: 11 },
  { date: "Mar 27", sales: 61000, orders: 18 },
  { date: "Mar 28", sales: 55000, orders: 14 },
  { date: "Mar 29", sales: 67000, orders: 20 },
  { date: "Mar 30", sales: 72000, orders: 22 },
  { date: "Mar 31", sales: 58000, orders: 16 },
  { date: "Apr 01", sales: 80000, orders: 24 },
  { date: "Apr 02", sales: 75000, orders: 21 },
  { date: "Apr 03", sales: 82000, orders: 25 },
  { date: "Apr 04", sales: 91000, orders: 28 },
  { date: "Apr 05", sales: 86000, orders: 26 },
  { date: "Apr 06", sales: 95000, orders: 30 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'white', border: '1px solid var(--color-divider)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '0.75rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginBottom: '0.25rem' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-brand-800)' }}>
            {p.name}: {p.name === "sales" ? `₹${p.value.toLocaleString("en-IN")}` : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function SalesChart() {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header mb-4">
        <div>
          <h3 className="dashboard-card-title">Sales Trend</h3>
          <p className="dashboard-card-subtitle">Last 14 days</p>
        </div>
        <div className="d-flex align-center gap-4">
          <div className="d-flex align-center gap-2">
            <span style={{ width: '0.75rem', height: '0.125rem', backgroundColor: 'var(--color-brand-600)', borderRadius: '0.25rem' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Sales (₹)</span>
          </div>
          <div className="d-flex align-center gap-2">
            <span style={{ width: '0.75rem', height: '0.125rem', backgroundColor: 'var(--color-brand-400)', borderRadius: '0.25rem' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Orders</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={salesData}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6B4226" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#6B4226" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2CDB0" opacity={0.5} />
          <XAxis
            dataKey="date"
            stroke="#9A7B5A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9A7B5A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="#6B4226"
            strokeWidth={2}
            fill="url(#salesGradient)"
            name="sales"
          />
          <Line
            type="monotone"
            dataKey="orders"
            stroke="#D4956A"
            strokeWidth={2}
            dot={false}
            name="orders"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
