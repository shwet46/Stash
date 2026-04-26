"use client";
import { useState, useEffect, useRef } from "react";
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
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const userName = (session?.user as any)?.name || "Worker";

  const tasks = data?.tasks || [];
  const voiceCalls = data?.stats?.voice_calls_today || 0;
  const aiSummary = [
    `${data?.stats?.pending_tasks || 0} tasks pending`,
    `${data?.stats?.low_stock_count || 0} low-stock alerts`,
    `${voiceCalls} voice actions today`,
  ].join(" · ");

  const toggleTask = (id: string) => {
    setCompletedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const recorderOptions = typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? { mimeType: "audio/webm;codecs=opus" }
    : undefined;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = recorderOptions ? new MediaRecorder(stream, recorderOptions) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setVoiceFeedback(null);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setVoiceActive(true);
    } catch (err) {
      console.error("Microphone access denied or error:", err);
      alert("Microphone access is required for voice features.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && voiceActive) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setVoiceActive(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("audio", audioBlob, "recording.webm");
    formData.append("source", "worker_dashboard");
    formData.append("role", "worker");
    formData.append("caller", userName);
    formData.append("user_name", userName);
    formData.append("language_hint", navigator.language.startsWith("hi") ? "hi-IN" : "en-IN");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/voice/web`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const commandId = response.headers.get("X-Voice-Command-Id");
      const voiceIntent = response.headers.get("X-Voice-Intent");
      const voiceReply = response.headers.get("X-Voice-Activity") || response.headers.get("X-Voice-Reply");
      const returnedAudioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(returnedAudioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => URL.revokeObjectURL(audioUrl);
      audio.play();
      setVoiceFeedback(
        voiceReply || `${commandId ? "Saved" : "Processed"}${voiceIntent ? ` • ${voiceIntent}` : ""}`
      );
    } catch (err) {
      console.error("Error processing voice:", err);
      setVoiceFeedback("Voice processing failed");
      alert("Could not process voice command at this time.");
    } finally {
      setIsProcessing(false);
    }
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
    <div className="dashboard-wrapper worker-dashboard">
      {/* Worker Header */}
      <div className="dashboard-header worker-dashboard__header">
        <div>
          <div className="owner-role-badge worker-dashboard__badge">
            <span className="worker-dashboard__badge-dot"></span>
            Worker View
          </div>
          <h1 className="dashboard-title worker-dashboard__title">Godown Ops</h1>
          <p className="dashboard-subtitle">
            Logged in as <span className="worker-dashboard__name">{userName}</span>
          </p>
        </div>
        <div className="dashboard-header-right">
           <div className="worker-dashboard__header-meta">
              <p className="worker-dashboard__date">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              <p className="worker-dashboard__warehouse">Warehouse ID: GDN-MUM-01</p>
           </div>
        </div>
      </div>

      <div className="grid-2 worker-dashboard__layout">
        {/* Main Stock Entry Panel */}
        <div className="worker-dashboard__main">
          <div className="dashboard-card worker-dashboard__voice-card">
            <div className="worker-dashboard__voice-topbar"></div>

            <div className="worker-dashboard__ai-summary" style={{ marginBottom: 14, padding: "0.85rem 1rem", borderRadius: 16, border: "1px solid rgba(52,168,83,0.14)", background: "linear-gradient(135deg, rgba(52,168,83,0.08), rgba(255,255,255,0.96))" }}>
              <p style={{ margin: 0, fontSize: 12, color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: 1 }}>AI Summary</p>
              <p style={{ margin: "0.25rem 0 0", fontWeight: 700, color: "var(--color-brand-800)", lineHeight: 1.5 }}>{aiSummary}</p>
            </div>
            
            <h2 className="worker-dashboard__voice-title">Say what arrived.</h2>
            <p className="worker-dashboard__voice-subtitle">
              Speak the item name, quantity, lot number, and expiry. Stash logs it automatically.
            </p>
            
            <div className="worker-dashboard__mic-wrap">
               <button 
                  onClick={voiceActive ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`worker-mic-button ${voiceActive ? 'worker-mic-button--active' : ''}`}
                  style={{ 
                    backgroundColor: voiceActive ? 'var(--color-error)' : undefined,
                    opacity: isProcessing ? 0.7 : 1,
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
               >
                  <Mic size={48} />
               </button>
            </div>
            
            <div className="d-flex align-center gap-2 worker-dashboard__mic-status">
               {isProcessing ? (
                 <span className="worker-dashboard__mic-processing" style={{color: 'var(--color-warning)'}}>PROCESSING ENTRY...</span>
               ) : voiceActive ? (
                 <span className="worker-dashboard__mic-live" style={{color: 'var(--color-error)'}}>LISTENING...</span>
               ) : (
                 <span className="worker-dashboard__mic-idle">Tap to start recording</span>
               )}
            </div>
            {voiceFeedback && <p className="worker-dashboard__mic-feedback">{voiceFeedback}</p>}

            {/* Recent Voice Entries */}
            <div className="worker-dashboard__recent">
               <div className="d-flex align-center justify-between mb-4">
                  <h3 className="dashboard-card-title worker-dashboard__recent-title">
                    <History size={16} /> Recent Voice Entries
                  </h3>
               </div>
               <div className="worker-dashboard__recent-list">
                  {data?.recent_calls?.map((entry, i) => (
                    <div key={i} className="worker-dashboard__recent-item">
                       <div className="worker-dashboard__recent-meta">
                      <p className="worker-dashboard__recent-text">{entry.text}</p>
                          <p className="worker-dashboard__recent-time">{entry.time}</p>
                       </div>
                       <Badge variant={entry.status === "Processed" ? "success" : "warning"} size="sm" dot>{entry.status}</Badge>
                    </div>
                  ))}
                  {(!data?.recent_calls || data.recent_calls.length === 0) && (
                    <div className="worker-dashboard__recent-empty">
                      <p>No voice entries recorded yet today.</p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Tasks & Alerts */}
        <div className="worker-dashboard__side">
          {/* Active Orders for Today */}
          <div className="dashboard-card">
             <div className="d-flex align-center justify-between mb-4">
                <h3 className="dashboard-card-title worker-dashboard__section-title">
                  <LayoutList size={18} /> Pending Tasks
                </h3>
                <Badge variant="default" size="sm">{tasks.length} Left</Badge>
             </div>
             
             <div className="worker-dashboard__task-list">
                {tasks.map(task => (
                  <div 
                    key={task.id} 
                    onClick={() => toggleTask(task.id)}
                    className={`worker-dashboard__task ${completedIds.has(task.id) ? "worker-dashboard__task--done" : ""}`}
                  >
                    <div className="d-flex align-center gap-3">
                       <div className={`worker-dashboard__task-check ${completedIds.has(task.id) ? "worker-dashboard__task-check--done" : ""}`}>
                          {completedIds.has(task.id) && <CircleCheck size={12} color="white" />}
                       </div>
                       <div className="worker-dashboard__task-meta">
                          <p className={`worker-dashboard__task-title ${completedIds.has(task.id) ? "worker-dashboard__task-title--done" : ""}`}>{task.task}</p>
                          <p className="worker-dashboard__task-subtitle">{task.location} · {task.qty}</p>
                       </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="worker-dashboard__task-empty">
                    <p>All tasks completed!</p>
                  </div>
                )}
             </div>
          </div>

          {/* Quick Stats */}
           <div className="grid-1 worker-dashboard__stats">
             <div className="dashboard-card worker-dashboard__stat worker-dashboard__stat--alert">
                <div className="d-flex align-center gap-3">
                 <div className="worker-dashboard__stat-icon worker-dashboard__stat-icon--alert"><AlertTriangle size={24} /></div>
                   <div>
                   <p className="worker-dashboard__stat-label">Low Stock Alert</p>
                   <p className="worker-dashboard__stat-value">{data?.stats?.low_stock_count || 0} items</p>
                   </div>
                </div>
             </div>
             
             <div className="dashboard-card worker-dashboard__stat worker-dashboard__stat--shift">
                <div className="d-flex align-center gap-3">
                 <div className="worker-dashboard__stat-icon worker-dashboard__stat-icon--shift"><Clock size={24} /></div>
                   <div>
                   <p className="worker-dashboard__stat-label">Shift Time</p>
                   <p className="worker-dashboard__stat-value">04:20:15</p>
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
