"use client";
import { LuMapPin as MapPin, LuClock as Clock, LuPackage as Package, LuCheck as CheckCircle, LuTruck as TruckIcon } from 'react-icons/lu';
import Badge from "@/components/ui/Badge";

const deliveries = [
  { id: "STH-4832", buyer: "Mehta & Sons", product: "Basmati Rice", qty: "500 kg", status: "in_transit", eta: "Apr 28, 2026", driver: "Ramesh K.", updates: [
    { status: "Order Confirmed", time: "Apr 23, 10:30 AM", location: "Mumbai Central Godown" },
    { status: "Packed & Ready", time: "Apr 23, 2:00 PM", location: "Mumbai Central Godown" },
    { status: "Dispatched", time: "Apr 24, 8:00 AM", location: "Mumbai Central Godown" },
    { status: "In Transit", time: "Apr 24, 11:30 AM", location: "Thane Bypass" },
  ]},
  { id: "STH-4831", buyer: "Sharma Stores", product: "Chana Dal", qty: "200 kg", status: "in_transit", eta: "Apr 26, 2026", driver: "Suresh P.", updates: [
    { status: "Order Confirmed", time: "Apr 22, 9:00 AM", location: "Pune Warehouse" },
    { status: "Dispatched", time: "Apr 23, 7:30 AM", location: "Pune Warehouse" },
    { status: "In Transit", time: "Apr 23, 1:00 PM", location: "Lonavala Highway" },
  ]},
  { id: "STH-4829", buyer: "Kumar Trading", product: "Wheat Flour", qty: "1000 kg", status: "dispatched", eta: "Apr 25, 2026", driver: "Anil M.", updates: [
    { status: "Order Confirmed", time: "Apr 21, 11:00 AM", location: "Mumbai Central Godown" },
    { status: "Dispatched", time: "Apr 22, 6:00 AM", location: "Mumbai Central Godown" },
  ]},
  { id: "STH-4830", buyer: "Patel Grocers", product: "Sugar", qty: "300 kg", status: "delivered", eta: "Apr 24, 2026", driver: "Vijay S.", updates: [
    { status: "Order Confirmed", time: "Apr 21, 8:00 AM", location: "Pune Warehouse" },
    { status: "Dispatched", time: "Apr 22, 7:00 AM", location: "Pune Warehouse" },
    { status: "Delivered", time: "Apr 24, 10:30 AM", location: "Patel Grocers, Nashik" },
  ]},
];

const statusConfig: Record<string, { variant: "warning" | "default" | "success"; label: string }> = {
  dispatched: { variant: "warning", label: "Dispatched" },
  in_transit: { variant: "default", label: "In Transit" },
  delivered: { variant: "success", label: "Delivered" },
};

export default function DeliveriesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-brand-800">Deliveries</h1>
        <p className="text-sm text-muted mt-1">
          Track active deliveries and shipment status
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-[12px] border border-divider shadow-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
            <Package size={20} className="text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-800">3</p>
            <p className="text-xs text-muted">Active Shipments</p>
          </div>
        </div>
        <div className="bg-white rounded-[12px] border border-divider shadow-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <TruckIcon size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-800">2</p>
            <p className="text-xs text-muted">In Transit</p>
          </div>
        </div>
        <div className="bg-white rounded-[12px] border border-divider shadow-card p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <CheckCircle size={20} className="text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-brand-800">1</p>
            <p className="text-xs text-muted">Delivered Today</p>
          </div>
        </div>
      </div>

      {/* Delivery cards with timeline */}
      <div className="space-y-4">
        {deliveries.map((del) => {
          const statusCfg = statusConfig[del.status];
          return (
            <div key={del.id} className="bg-white rounded-[12px] border border-divider shadow-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-brand-600">{del.id}</h3>
                    <Badge variant={statusCfg.variant} dot size="sm">{statusCfg.label}</Badge>
                  </div>
                  <p className="text-sm text-brand-800 mt-1">
                    {del.product} ({del.qty}) → {del.buyer}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">ETA</p>
                  <p className="text-sm font-medium text-brand-800">{del.eta}</p>
                  <p className="text-xs text-muted mt-1">Driver: {del.driver}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="border-t border-divider pt-4">
                <div className="flex items-start gap-4 overflow-x-auto pb-2">
                  {del.updates.map((update, i) => (
                    <div key={i} className="flex items-start gap-2 min-w-[180px]">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                          i === del.updates.length - 1 ? "bg-brand-600" : "bg-brand-300"
                        }`} />
                        {i < del.updates.length - 1 && (
                          <div className="w-0.5 h-8 bg-brand-200" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-brand-800">{update.status}</p>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <Clock size={10} />
                          {update.time}
                        </p>
                        <p className="text-xs text-muted flex items-center gap-1">
                          <MapPin size={10} />
                          {update.location}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
