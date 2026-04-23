"use client";
import { LuPackage as Package, LuShoppingCart as ShoppingCart, LuPhone as Phone, LuClock as Clock } from 'react-icons/lu';
import StatCard from "@/components/dashboard/StatCard";
import Badge from "@/components/ui/Badge";

const workerTasks = [
  { id: 1, task: "Unload Basmati Rice shipment", product: "Basmati Rice", qty: "500 kg", priority: "high", status: "in_progress", assignedAt: "9:00 AM" },
  { id: 2, task: "Pack order STH-4832", product: "Chana Dal", qty: "200 kg", priority: "high", status: "pending", assignedAt: "9:30 AM" },
  { id: 3, task: "Stock count — Sugar section", product: "Sugar", qty: "-", priority: "medium", status: "pending", assignedAt: "10:00 AM" },
  { id: 4, task: "Move Wheat Flour to Bay 3", product: "Wheat Flour", qty: "800 kg", priority: "low", status: "completed", assignedAt: "8:00 AM" },
  { id: 5, task: "Quality check — Groundnut Oil", product: "Groundnut Oil", qty: "200 L", priority: "medium", status: "pending", assignedAt: "10:30 AM" },
];

const priorityConfig: Record<string, string> = {
  high: "bg-red-50 text-error",
  medium: "bg-amber-50 text-warning",
  low: "bg-green-50 text-success",
};

const statusConfig: Record<string, { variant: "warning" | "default" | "success"; label: string }> = {
  pending: { variant: "warning", label: "Pending" },
  in_progress: { variant: "default", label: "In Progress" },
  completed: { variant: "success", label: "Completed" },
};

export default function WorkerDashboard() {
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Worker Dashboard</h1>
          <p className="dashboard-subtitle">
            Your tasks and assignments for today
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        <StatCard title="Assigned Tasks" value="5" change="3 pending" changeType="neutral" icon={Package} />
        <StatCard title="Orders to Pack" value="2" change="High priority" changeType="negative" icon={ShoppingCart} />
        <StatCard title="Voice Commands" value="8" subtitle="Today" icon={Phone} />
        <StatCard title="Shift Time" value="4h 30m" subtitle="Started at 8:00 AM" icon={Clock} />
      </div>

      {/* Tasks */}
      <div className="dashboard-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-divider)' }}>
          <h3 className="dashboard-card-title">Today&apos;s Tasks</h3>
        </div>
        <div className="d-flex" style={{ flexDirection: 'column' }}>
          {workerTasks.map((task, index) => {
            const statusCfg = statusConfig[task.status];
            return (
              <div key={task.id} className="d-flex align-center justify-between" style={{ padding: '1rem 1.5rem', borderBottom: index < workerTasks.length - 1 ? '1px solid var(--color-divider)' : 'none', transition: 'background-color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-brand-50)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <div className="d-flex align-center gap-4">
                  <div className={`d-flex align-center justify-center ${priorityConfig[task.priority]}`} style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                    {task.id}
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, color: 'var(--color-brand-800)' }}>{task.task}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.125rem' }}>
                      {task.product} · {task.qty} · Assigned at {task.assignedAt}
                    </p>
                  </div>
                </div>
                <div className="d-flex align-center gap-2">
                  <span className={`${priorityConfig[task.priority]}`} style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                    {task.priority}
                  </span>
                  <Badge variant={statusCfg.variant} dot size="sm">
                    {statusCfg.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
