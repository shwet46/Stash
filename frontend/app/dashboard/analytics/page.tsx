"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { LuTrendingUp as TrendingUp, LuIndianRupee as IndianRupee, LuShoppingCart as ShoppingCart, LuUsers as Users, LuDownload as Download, LuLock as Lock } from 'react-icons/lu';
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";

const revenueData = [
  { name: 'Mon', revenue: 45000, orders: 120 },
  { name: 'Tue', revenue: 52000, orders: 145 },
  { name: 'Wed', revenue: 48000, orders: 132 },
  { name: 'Thu', revenue: 61000, orders: 168 },
  { name: 'Fri', revenue: 55000, orders: 154 },
  { name: 'Sat', revenue: 67000, orders: 182 },
  { name: 'Sun', revenue: 42000, orders: 110 },
];

const categoryData = [
  { name: 'Grains', value: 45, color: '#6B4226' },
  { name: 'Oils', value: 25, color: '#8B5E3C' },
  { name: 'Spices', value: 15, color: '#D4956A' },
  { name: 'Others', value: 15, color: '#EADDD3' },
];

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = ((session?.user as any)?.role || "worker").toLowerCase();
  const isWorker = role === "worker";

  useEffect(() => {
    if (status === "authenticated" && isWorker) {
      router.push("/dashboard/inventory");
    }
  }, [status, isWorker, router]);

  if (status === "loading" || isWorker) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">{isWorker ? "Redirecting to your workspace..." : "Loading analytics..."}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Analytics</h1>
          <p className="dashboard-subtitle">Performance insights and inventory trends</p>
        </div>
        <div className="dashboard-header-right">
          <Button variant="outline" size="sm" icon={<Download size={16} />}>
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid-4">
        <StatCard
          title="Total Revenue"
          value="₹3,42,000"
          change="+12.5%"
          changeType="positive"
          icon={IndianRupee}
          subtitle="Past 30 days"
        />
        <StatCard
          title="Average Order"
          value="₹4,250"
          change="+5.2%"
          changeType="positive"
          icon={TrendingUp}
          subtitle="Per transaction"
        />
        <StatCard
          title="Total Orders"
          value="1,284"
          change="+8.1%"
          changeType="positive"
          icon={ShoppingCart}
          subtitle="Fulfilled"
        />
        <StatCard
          title="Active Buyers"
          value="48"
          change="+2"
          changeType="positive"
          icon={Users}
          subtitle="Regular customers"
        />
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Revenue Trends</h3>
          </div>
          <div style={{ height: '350px', marginTop: '1.5rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-600)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--color-brand-600)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-divider)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
                  tickFormatter={(val) => `₹${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-card)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--color-brand-600)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <h3 className="dashboard-card-title">Sales by Category</h3>
          </div>
          <div style={{ height: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '100%', marginTop: '1rem' }}>
               {categoryData.map((cat, i) => (
                 <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: cat.color }} />
                       <span style={{ fontSize: '0.875rem', color: 'var(--color-brand-800)', fontWeight: 500 }}>{cat.name}</span>
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{cat.value}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
