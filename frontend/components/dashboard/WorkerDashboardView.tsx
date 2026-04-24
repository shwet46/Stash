"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useDashboardData } from "@/hooks/useDashboardData";
import {
  LuPackage as Package,
  LuMic as Mic,
  LuClock as Clock,
  LuCircleCheck as CircleCheck,
  LuLayoutList as LayoutList,
  LuHistory as History,
  LuTriangleAlert as AlertTriangle,
  LuArrowRight as ArrowRight
} from "react-icons/lu";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

export default function WorkerDashboardView() {
  const { data: session } = useSession();
  const { data, loading, isRealtime } = useDashboardData("worker");
  const [voiceActive, setVoiceActive] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const userName = (session?.user as any)?.name || "Worker";

  const tasks = data?.tasks || [];
  const voiceCalls = data?.stats?.voice_calls_today || 0;

  const toggleTask = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (loading && !data) {
    return (
      <div className="role-loading">
        <div className="role-loading-spinner" />
        <p className="role-loading-text">Opening your workspace…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      {/* Worker Header */}
      <div className="dashboard-header">
        <div>
          <div className="owner-role-badge" style={{ backgroundColor: "#FDFCFB", color: "var(--color-brand-600)", border: "1px solid var(--color-brand-200)" }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', marginRight: '8px' }}></span>
            Worker View
          </div>
          <h1 className="dashboard-title" style={{ marginTop: "0.5rem" }}>Godown Ops</h1>
          <p className="dashboard-subtitle">Logged in as <span style={{ fontWeight: 600, color: 'var(--color-brand-800)' }}>{userName}</span></p>
        </div>
        <div className="dashboard-header-right">
           <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-brand-800)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>Warehouse ID: GDN-MUM-01</p>
           </div>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr' }}>
        {/* Main Stock Entry Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="dashboard-card" style={{ padding: '3rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', border: '1px solid var(--color-brand-200)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC05, #EA4335)' }}></div>
            
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-brand-800)', marginBottom: '1rem' }}>Say what arrived.</h2>
            <p className="text-gray" style={{ fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: '480px', margin: '0 auto 2.5rem' }}>
              Speak the item name, quantity, lot number, and expiry. Stash logs it automatically.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem' }}>
               <button 
                  onClick={() => setVoiceActive(!voiceActive)}
                className={`worker-mic-button ${voiceActive ? 'worker-mic-button--active' : ''}`}
                  style={{ 
                  backgroundColor: voiceActive ? 'var(--color-error)' : undefined
                  }}
               >
                  <Mic size={48} />
               </button>
            </div>
            
            <div className="d-flex align-center gap-2" style={{ justifyContent: 'center' }}>
               {voiceActive ? (
                 <span style={{ color: 'var(--color-error)', fontWeight: 700, letterSpacing: '0.05em' }}>LISTENING...</span>
               ) : (
                 <span className="text-gray" style={{ fontWeight: 600 }}>Tap to start recording</span>
               )}
            </div>

            {/* Recent Voice Entries */}
            <div style={{ marginTop: '3.5rem', textAlign: 'left' }}>
               <div className="d-flex align-center justify-between mb-4">
                  <h3 className="dashboard-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <History size={16} /> Recent Voice Entries
                  </h3>
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {data?.recent_calls?.map((entry, i) => (
                    <div key={i} style={{ padding: '1rem', backgroundColor: 'var(--color-brand-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-brand-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ flex: 1, marginRight: '1rem' }}>
                          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-brand-800)', margin: 0 }}>{entry.text}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: 0 }}>{entry.time}</p>
                       </div>
                       <Badge variant={entry.status === "Processed" ? "success" : "warning"} size="sm" dot>{entry.status}</Badge>
                    </div>
                  ))}
                  {(!data?.recent_calls || data.recent_calls.length === 0) && (
                    <div style={{ padding: '2rem', textAlign: 'center', border: '1px dashed var(--color-brand-200)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>No voice entries recorded yet today.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Tasks & Alerts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Active Orders for Today */}
          <div className="dashboard-card">
             <div className="d-flex align-center justify-between mb-4">
                <h3 className="dashboard-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <LayoutList size={18} /> Pending Tasks
                </h3>
                <Badge variant="default" size="sm">{tasks.length} Left</Badge>
             </div>
             
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    style={{ 
                      padding: '1rem', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)', 
                      cursor: 'pointer', transition: 'all 0.2s',
                      backgroundColor: completedIds.has(task.id) ? 'var(--color-brand-50)' : 'white',
                      opacity: completedIds.has(task.id) ? 0.7 : 1
                    }}
                  >
                    <div className="d-flex align-center gap-3">
                       <div style={{ 
                         width: '1.5rem', height: '1.5rem', borderRadius: '50%', 
                         border: `2px solid ${completedIds.has(task.id) ? '#10B981' : '#E8EAED'}`,
                         backgroundColor: completedIds.has(task.id) ? '#10B981' : 'transparent',
                         display: 'flex', alignItems: 'center', justifyContent: 'center'
                       }}>
                          {completedIds.has(task.id) && <CircleCheck size={12} color="white" />}
                       </div>
                       <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-brand-800)', textDecoration: completedIds.has(task.id) ? 'line-through' : 'none' }}>{task.task}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>{task.location} · {task.qty}</p>
                       </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1rem' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>All tasks completed!</p>
                  </div>
                )}
             </div>
          </div>

          {/* Quick Stats */}
          <div className="grid-1" style={{ gap: '1rem' }}>
             <div className="dashboard-card" style={{ padding: '1.25rem', borderLeft: '4px solid #EA4335' }}>
                <div className="d-flex align-center gap-3">
                   <div style={{ color: '#EA4335' }}><AlertTriangle size={24} /></div>
                   <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Low Stock Alert</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-brand-800)' }}>{data?.stats?.low_stock_count || 0} items</p>
                   </div>
                </div>
             </div>
             
             <div className="dashboard-card" style={{ padding: '1.25rem', borderLeft: '4px solid #4285F4' }}>
                <div className="d-flex align-center gap-3">
                   <div style={{ color: '#4285F4' }}><Clock size={24} /></div>
                   <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Shift Time</p>
                      <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-brand-800)' }}>04:20:15</p>
                   </div>
                </div>
             </div>
          </div>
          
          <Button variant="outline" className="w-full" icon={<ArrowRight size={16} />}>View Today's Shipments</Button>
        </div>
      </div>
    </div>
  );
}
