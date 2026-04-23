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
      <div className="bg-white border border-divider rounded-[8px] shadow-lg p-3">
        <p className="text-sm font-medium text-brand-800 mb-1">
          {payload[0].payload.name}
        </p>
        <p className="text-xs text-muted">
          Revenue: ₹{payload[0].value.toLocaleString("en-IN")}
        </p>
        <p className="text-xs text-muted">
          Orders: {payload[0].payload.orders}
        </p>
      </div>
    );
  }
  return null;
};

export default function TopProductsChart() {
  return (
    <div className="bg-white rounded-[12px] border border-divider shadow-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-brand-800">
          Top Products by Revenue
        </h3>
        <p className="text-sm text-muted">This month</p>
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
