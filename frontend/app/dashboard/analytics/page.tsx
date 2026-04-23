"use client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { LuTrendingUp as TrendingUp, LuIndianRupee as IndianRupee, LuShoppingCart as ShoppingCart, LuUsers as Users, LuDownload as Download } from 'react-icons/lu';
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";

const monthlyRevenue = [
  { month: "Oct", revenue: 680000, orders: 120 },
  { month: "Nov", revenue: 750000, orders: 135 },
  { month: "Dec", revenue: 890000, orders: 160 },
  { month: "Jan", revenue: 920000, orders: 155 },
  { month: "Feb", revenue: 1050000, orders: 180 },
  { month: "Mar", revenue: 1180000, orders: 195 },
  { month: "Apr", revenue: 1280000, orders: 210 },
];

const categoryRevenue = [
  { name: "Grains", value: 485000, color: "#6B4226" },
  { name: "Pulses", value: 320000, color: "#8B5E3C" },
  { name: "Oils", value: 196000, color: "#D4956A" },
  { name: "Spices", value: 85000, color: "#E2CDB0" },
  { name: "FMCG", value: 124000, color: "#9A7B5A" },
  { name: "Others", value: 70000, color: "#F0E6D3" },
];

const topBuyers = [
  { name: "Mehta & Sons", revenue: 285000, orders: 42 },
  { name: "Kumar Trading", revenue: 195000, orders: 35 },
  { name: "Patel Grocers", revenue: 168000, orders: 31 },
  { name: "Sharma Stores", revenue: 142000, orders: 28 },
  { name: "Singh & Co.", revenue: 118000, orders: 24 },
];

const godownPerformance = [
  { name: "Mumbai Central", revenue: 520000, products: 15, orders: 85 },
  { name: "Pune Warehouse", revenue: 320000, products: 10, orders: 52 },
  { name: "Nashik Depot", revenue: 180000, products: 8, orders: 28 },
  { name: "Ahmedabad Store", revenue: 145000, products: 6, orders: 25 },
  { name: "Surat Godown", revenue: 115000, products: 5, orders: 20 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-divider rounded-[8px] shadow-lg p-3">
        <p className="text-xs text-muted mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-medium text-brand-800">
            {p.name}: {p.name.includes("revenue") || p.name === "revenue"
              ? `₹${p.value.toLocaleString("en-IN")}`
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">Analytics</h1>
          <p className="text-sm text-muted mt-1">
            Business insights and performance metrics
          </p>
        </div>
        <Button variant="outline" size="sm" icon={<Download size={16} />}>
          Generate Report
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue (6M)" value="₹57,50,000" change="+18%" changeType="positive" icon={IndianRupee} />
        <StatCard title="Total Orders (6M)" value="1,055" change="+23%" changeType="positive" icon={ShoppingCart} />
        <StatCard title="Avg. Order Value" value="₹5,450" change="+5%" changeType="positive" icon={TrendingUp} />
        <StatCard title="Active Buyers" value="48" change="+12" changeType="positive" icon={Users} />
      </div>

      {/* Revenue chart + Category pie */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-[12px] border border-divider shadow-card p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-1">Monthly Revenue</h3>
          <p className="text-sm text-muted mb-6">Last 7 months</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B4226" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B4226" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2CDB0" opacity={0.5} />
              <XAxis dataKey="month" stroke="#9A7B5A" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#9A7B5A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6B4226" strokeWidth={2} fill="url(#revenueGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-[12px] border border-divider shadow-card p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-1">Revenue by Category</h3>
          <p className="text-sm text-muted mb-4">Current month</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryRevenue} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {categoryRevenue.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {categoryRevenue.map((cat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="text-xs text-muted">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top buyers + Godown performance */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[12px] border border-divider shadow-card p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-1">Top Buyers</h3>
          <p className="text-sm text-muted mb-4">By revenue contribution</p>
          <div className="space-y-4">
            {topBuyers.map((buyer, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center text-xs font-bold text-brand-600">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-brand-800">{buyer.name}</span>
                    <span className="text-sm font-semibold text-brand-600">
                      ₹{(buyer.revenue / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-brand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full"
                      style={{ width: `${(buyer.revenue / topBuyers[0].revenue) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[12px] border border-divider shadow-card p-6">
          <h3 className="text-lg font-semibold text-brand-800 mb-1">Godown Performance</h3>
          <p className="text-sm text-muted mb-4">Revenue across warehouses</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={godownPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2CDB0" opacity={0.5} />
              <XAxis dataKey="name" stroke="#9A7B5A" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#9A7B5A" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#6B4226" radius={[4, 4, 0, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
