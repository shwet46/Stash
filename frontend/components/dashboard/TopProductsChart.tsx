"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const productData = [
  { name: "Basmati Rice", revenue: 285000, orders: 42 },
  { name: "Chana Dal", revenue: 195000, orders: 35 },
  { name: "Sugar", revenue: 168000, orders: 31 },
  { name: "Wheat Flour", revenue: 142000, orders: 28 },
  { name: "Toor Dal", revenue: 118000, orders: 24 },
  { name: "Groundnut Oil", revenue: 96000, orders: 18 },
  { name: "Moong Dal", revenue: 82000, orders: 15 },
  { name: "Mustard Oil", revenue: 74000, orders: 13 },
];

const barColors = [
  "#6B4226",
  "#7A4E30",
  "#8B5E3C",
  "#9A6E4A",
  "#AB7E58",
  "#BC8E66",
  "#CD9E74",
  "#D4956A",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: { name: string; orders: number } }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'white', border: '1px solid var(--color-divider)', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', padding: '0.75rem' }}>
        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-brand-800)', marginBottom: '0.25rem' }}>
          {payload[0].payload.name}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
          Revenue: ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
          Orders: {payload[0].payload.orders}
        </p>
      </div>
    );
  }
  return null;
};

export default function TopProductsChart() {
  return (
    <div className="dashboard-card">
      <div className="dashboard-card-header mb-4">
        <div>
          <h3 className="dashboard-card-title">
            Top Products by Revenue
          </h3>
          <p className="dashboard-card-subtitle">This month</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={productData} layout="vertical" barSize={20}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E2CDB0"
            opacity={0.5}
            horizontal={false}
          />
          <XAxis
            type="number"
            stroke="#9A7B5A"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#9A7B5A"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
            {productData.map((_, i) => (
              <Cell key={i} fill={barColors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
