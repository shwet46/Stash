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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand-800">Worker Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Your tasks and assignments for today
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Tasks" value="5" change="3 pending" changeType="neutral" icon={Package} />
        <StatCard title="Orders to Pack" value="2" change="High priority" changeType="negative" icon={ShoppingCart} />
        <StatCard title="Voice Commands" value="8" subtitle="Today" icon={Phone} />
        <StatCard title="Shift Time" value="4h 30m" subtitle="Started at 8:00 AM" icon={Clock} />
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-[12px] border border-divider shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-divider">
          <h3 className="text-lg font-semibold text-brand-800">Today&apos;s Tasks</h3>
        </div>
        <div className="divide-y divide-divider">
          {workerTasks.map((task) => {
            const statusCfg = statusConfig[task.status];
            return (
              <div key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-brand-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${priorityConfig[task.priority]}`}>
                    {task.id}
                  </div>
                  <div>
                    <p className="font-medium text-brand-800">{task.task}</p>
                    <p className="text-xs text-muted">
                      {task.product} · {task.qty} · Assigned at {task.assignedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[task.priority]}`}>
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
