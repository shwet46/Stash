"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  LuBot, LuUser, LuSend, LuShieldCheck, LuMic, LuMicOff,
  LuRefreshCw, LuCircleCheck, LuCircleX, LuPackage, LuVolume2, LuVolumeX, LuChevronDown,
} from "react-icons/lu";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const CHAT_REQUEST_TIMEOUT_MS = 18000;

const PRODUCTS = [
  "Basmati Rice","Wheat","Sugar","Dal","Mustard Oil",
  "Salt","Onion","Potato","Maida","Besan",
  "Rice","Chilli","Turmeric","Soybeans","Groundnut",
];

const TIER_META = {
  1: { label: "Tier 1 — Instant Accept",      color: "#108548", bg: "#f0fdf4", border: "#bbf7d0", icon: <LuCircleCheck size={18}/> },
  2: { label: "Tier 2 — Conditional Accept",  color: "#1a73e8", bg: "#eff6ff", border: "#bfdbfe", icon: <LuPackage     size={18}/> },
  3: { label: "Tier 3 — Counter Offer",       color: "#f29900", bg: "#fffbeb", border: "#fed7aa", icon: <LuRefreshCw   size={18}/> },
  4: { label: "Tier 4 — Hard Refusal",        color: "#d93025", bg: "#fef2f2", border: "#fecaca", icon: <LuCircleX     size={18}/> },
} as const;

interface Msg  { role: "user"|"assistant"; content: string; time: string; }
interface NegResult {
  decision: string; counter_price: number|null; minimum_quantity: number|null;
  message: string; tier: 1|2|3|4; floor_price: number; market_rate: number;
  offered_price: number; summary: string;
}

const WELCOME = "👋 Namaste! I'm StashBot, your AI negotiation assistant. I'll help you get the best wholesale deal. First — **what's your name?**";

function Bubble({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return <>{parts.map((p,i) => p.startsWith("**")&&p.endsWith("**") ? <strong key={i}>{p.slice(2,-2)}</strong> : <span key={i}>{p}</span>)}</>;
}

export default function BarteringPage() {
  const [messages,  setMessages]  = useState<Msg[]>([{ role:"assistant", content: WELCOME, time: ts() }]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [state,     setState]     = useState<Record<string,unknown>>({});
  const [result,    setResult]    = useState<NegResult|null>(null);
  const [muted,     setMuted]     = useState(false);
  const [listening, setListening] = useState(false);
  const [showProds, setShowProds] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const srRef = useRef<any>(null);

  function ts() { return new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}); }

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const speak = useCallback(async (text: string) => {
    if (muted || typeof window === "undefined") return;

    const plain = text.replace(/\*\*/g, "").replace(/[₹]/g, " rupees ").trim();
    if (!plain) return;

    try {
      stopAudio();
      const response = await fetch(`${API_BASE}/api/voice/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: plain,
          source: "bartering_chat",
          role: "admin",
          caller: "web_user",
          language_hint: navigator.language?.startsWith("hi") ? "hi-IN" : "en-IN",
          user_name: "bartering_user",
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audioUrlRef.current = url;
      audio.onended = () => stopAudio();
      await audio.play();
    } catch (err) {
      console.error("GCP TTS playback failed", err);
    }
  }, [muted, stopAudio]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

  // Speak welcome on mount
  useEffect(() => {
    void speak(WELCOME);
  }, [speak]);

  useEffect(() => {
    if (muted) stopAudio();
  }, [muted, stopAudio]);

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const addBot = useCallback((content: string) => {
    setMessages(p => [...p, { role:"assistant", content, time: ts() }]);
    void speak(content);
  }, [speak]);

  const send = useCallback(async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const userMsg: Msg = { role:"user", content: msg, time: ts() };
    setMessages(p => [...p, userMsg]);
    setLoading(true);
    let timeoutId: number | null = null;
    try {
      const history = [...messages, userMsg].slice(-12).map(m => ({ role: m.role, content: m.content }));
      const controller = new AbortController();
      timeoutId = window.setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS);
      const res = await fetch(`${API_BASE}/api/barter/chat`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ message: msg, history, session_state: state }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      addBot(data.reply);
      setState(data.session_state || {});
      if (data.negotiation_result) setResult(data.negotiation_result);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        addBot("⚠️ Response is taking too long. Please resend your message.");
      } else {
        addBot("⚠️ Connection error — please try again.");
      }
    } finally {
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [input, loading, messages, state, addBot]);

  // Voice input
  const toggleMic = useCallback(() => {
    if (listening) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (srRef.current as any)?.stop();
      setListening(false);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser. Try Chrome."); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = new SR() as any;
    r.lang = "en-IN"; r.continuous = false; r.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript;
      setListening(false);
      send(transcript);          // auto-send once speech recognised
    };
    r.onerror = () => setListening(false);
    r.onend   = () => setListening(false);
    srRef.current = r;
    r.start();
    setListening(true);
  }, [listening, send]);

  const reset = () => {
    stopAudio();
    setMessages([{ role:"assistant", content: WELCOME, time: ts() }]);
    setState({}); setResult(null); setInput("");
    void speak(WELCOME);
  };

  const tier = result?.tier as 1|2|3|4|undefined;
  const meta = tier ? TIER_META[tier] : null;
  const isDone = false;

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 5rem)", maxWidth:"68rem", margin:"0 auto", gap:"1rem" }}>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"0.75rem" }}>
          <div style={{ width:"2.75rem", height:"2.75rem", borderRadius:"0.875rem", background:"linear-gradient(135deg,#6b4226,#b57a55)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(107,66,38,0.3)" }}>
            <LuBot size={22} color="white"/>
          </div>
          <div>
            <h1 style={{ fontSize:"1.375rem", fontWeight:800, color:"var(--color-brand-800)", letterSpacing:"-0.02em" }}>AI Bartering</h1>
            <div style={{ display:"flex", alignItems:"center", gap:"0.375rem" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#108548", animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:"0.75rem", color:"#108548", fontWeight:600 }}>Gemini AI · Margin Protected · Voice Enabled</span>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:"0.5rem" }}>
          <button onClick={() => setShowProds(s=>!s)}
            style={{ display:"flex", alignItems:"center", gap:"0.375rem", padding:"0.5rem 0.875rem", border:"1.5px solid var(--color-divider)", borderRadius:"0.625rem", background:"white", cursor:"pointer", fontSize:"0.8125rem", fontWeight:600, color:"var(--color-brand-700)" }}>
            Products <LuChevronDown size={12}/>
          </button>
          <button onClick={() => setMuted(m=>!m)}
            style={{ padding:"0.5rem 0.875rem", border:"1.5px solid var(--color-divider)", borderRadius:"0.625rem", background:"white", cursor:"pointer", fontSize:"0.8125rem", fontWeight:600, color: muted ? "#d93025" : "var(--color-brand-700)", display:"flex", alignItems:"center", gap:"0.375rem" }}>
            {muted ? <LuVolumeX size={14}/> : <LuVolume2 size={14}/>} {muted?"Muted":"Sound"}
          </button>
          <button onClick={reset}
            style={{ padding:"0.5rem 0.875rem", border:"1.5px solid var(--color-divider)", borderRadius:"0.625rem", background:"white", cursor:"pointer", fontSize:"0.8125rem", fontWeight:600, color:"var(--color-muted)", display:"flex", alignItems:"center", gap:"0.375rem" }}>
            <LuRefreshCw size={14}/> New Chat
          </button>
        </div>
      </div>

      {/* ── Product chips ── */}
      {showProds && (
        <div style={{ background:"white", border:"1px solid var(--color-divider)", borderRadius:"1rem", padding:"1rem 1.25rem", boxShadow:"0 4px 16px rgba(0,0,0,0.06)", flexShrink:0 }}>
          <p style={{ fontSize:"0.8125rem", fontWeight:700, color:"var(--color-brand-700)", marginBottom:"0.625rem" }}>Tap to ask about a product:</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
            {PRODUCTS.map(p => (
              <button key={p} onClick={() => { send(`I want to buy ${p}`); setShowProds(false); }}
                style={{ padding:"0.375rem 0.875rem", border:"1.5px solid var(--color-brand-200)", borderRadius:"9999px", background:"var(--color-brand-50)", cursor:"pointer", fontSize:"0.8125rem", fontWeight:600, color:"var(--color-brand-700)" }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div style={{ display:"grid", gridTemplateColumns: result ? "1fr 320px" : "1fr", gap:"1rem", flex:1, minHeight:0 }}>

        {/* Chat */}
        <div style={{ display:"flex", flexDirection:"column", background:"white", borderRadius:"1.25rem", border:"1px solid var(--color-divider)", boxShadow:"0 2px 12px rgba(0,0,0,0.05)", overflow:"hidden" }}>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"1.5rem", display:"flex", flexDirection:"column", gap:"1.25rem" }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:"flex", gap:"0.625rem", flexDirection: m.role==="user"?"row-reverse":"row", alignItems:"flex-end" }}>
                <div style={{ width:"2rem", height:"2rem", borderRadius:"0.625rem", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                  background: m.role==="assistant" ? "linear-gradient(135deg,#6b4226,#b57a55)" : "var(--color-brand-100)" }}>
                  {m.role==="assistant" ? <LuBot size={14} color="white"/> : <LuUser size={14} color="var(--color-brand-700)"/>}
                </div>
                <div style={{ maxWidth:"78%", display:"flex", flexDirection:"column", alignItems: m.role==="user"?"flex-end":"flex-start", gap:"0.2rem" }}>
                  <div style={{
                    padding:"0.8rem 1rem",
                    borderRadius: m.role==="user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                    background: m.role==="user" ? "linear-gradient(135deg,#6b4226,#8b5e3c)" : "var(--color-brand-50)",
                    color: m.role==="user" ? "white" : "var(--color-text)",
                    fontSize:"0.9375rem", lineHeight:"1.55",
                    border: m.role==="assistant" ? "1px solid var(--color-brand-100)" : "none",
                    boxShadow: m.role==="user" ? "0 2px 8px rgba(107,66,38,0.2)" : "none",
                  }}>
                    <Bubble text={m.content}/>
                  </div>
                  <span style={{ fontSize:"0.6875rem", color:"var(--color-muted)", padding:"0 0.2rem" }}>{m.time}</span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display:"flex", gap:"0.625rem", alignItems:"flex-end" }}>
                <div style={{ width:"2rem", height:"2rem", borderRadius:"0.625rem", background:"linear-gradient(135deg,#6b4226,#b57a55)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <LuBot size={14} color="white"/>
                </div>
                <div style={{ padding:"0.8rem 1rem", background:"var(--color-brand-50)", border:"1px solid var(--color-brand-100)", borderRadius:"1rem 1rem 1rem 0.25rem", display:"flex", gap:"5px", alignItems:"center" }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--color-brand-400)", animation:`bounce 1.2s ${i*0.2}s infinite` }}/>)}
                </div>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Input bar */}
          <div style={{ padding:"0.875rem 1rem", borderTop:"1px solid var(--color-brand-100)", background:"#faf8f6", display:"flex", gap:"0.625rem", alignItems:"center" }}>
            {/* Mic */}
            <button onClick={toggleMic} disabled={loading}
              title={listening ? "Stop recording" : "Speak your message"}
              style={{ width:"2.75rem", height:"2.75rem", flexShrink:0, borderRadius:"0.75rem", border:"none", cursor: loading?"not-allowed":"pointer",
                background: listening ? "#d93025" : "var(--color-brand-100)",
                color:       listening ? "white"    : "var(--color-brand-600)",
                display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s",
                animation:   listening ? "pulse 1s infinite" : "none" }}>
              {listening ? <LuMicOff size={18}/> : <LuMic size={18}/>}
            </button>

            {/* Text input */}
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key==="Enter" && !e.shiftKey && send()}
              disabled={loading}
              placeholder={listening ? "🎙️ Listening… speak now" : "Type your response or tap the mic to speak…"}
              style={{ flex:1, padding:"0.75rem 1rem", borderRadius:"0.75rem", border:"1.5px solid var(--color-brand-200)", fontSize:"0.9375rem", outline:"none", background:"white", transition:"border 0.2s" }}
              onFocus={e => e.target.style.borderColor="var(--color-brand-500)"}
              onBlur={e  => e.target.style.borderColor="var(--color-brand-200)"}
            />

            {/* Send */}
            <button onClick={() => send()} disabled={loading || !input.trim()}
              style={{ width:"2.75rem", height:"2.75rem", flexShrink:0, borderRadius:"0.75rem", border:"none",
                cursor: (loading||!input.trim()) ? "not-allowed" : "pointer",
                background: input.trim() ? "linear-gradient(135deg,#6b4226,#b57a55)" : "var(--color-brand-100)",
                color:       input.trim() ? "white" : "var(--color-muted)",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
              <LuSend size={18}/>
            </button>
          </div>
        </div>

        {/* ── Result panel ── */}
        {result && meta && (
          <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem", overflowY:"auto" }}>
            <div style={{ background:meta.bg, border:`2px solid ${meta.border}`, borderRadius:"1.25rem", padding:"1.25rem" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"0.625rem", marginBottom:"0.75rem" }}>
                <span style={{ color:meta.color }}>{meta.icon}</span>
                <span style={{ fontWeight:800, fontSize:"0.9375rem", color:meta.color }}>{meta.label}</span>
              </div>
              <p style={{ fontSize:"0.8125rem", color:"var(--color-muted)", marginBottom:"1rem", lineHeight:1.5 }}>{result.summary}</p>

              {/* Price rows */}
              {([
                { label:"Buyer Offered",  val:`₹${result.offered_price}`,  hi:false },
                { label:"Market Rate",    val:`₹${result.market_rate}`,    hi:false },
                { label:"Floor Price",    val:`₹${result.floor_price}`,    hi:false },
                ...(result.counter_price     ? [{ label:"Counter Offer",     val:`₹${result.counter_price}`,    hi:true }] : []),
                ...(result.minimum_quantity  ? [{ label:"Min Quantity",       val:`${result.minimum_quantity} units`, hi:true }] : []),
              ] as { label:string; val:string; hi:boolean }[]).map((r,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"0.5rem 0.75rem", marginBottom:"0.375rem", background:"white", borderRadius:"0.625rem", border:`1px solid ${r.hi ? meta.border : "rgba(0,0,0,0.05)"}` }}>
                  <span style={{ fontSize:"0.8125rem", color:"var(--color-muted)" }}>{r.label}</span>
                  <span style={{ fontWeight:700, color: r.hi ? meta.color : "var(--color-brand-800)" }}>{r.val}</span>
                </div>
              ))}

              <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginTop:"0.75rem", padding:"0.625rem 0.875rem", background:"rgba(16,133,72,0.07)", border:"1px solid rgba(16,133,72,0.2)", borderRadius:"0.75rem" }}>
                <LuShieldCheck size={14} color="#108548"/>
                <span style={{ fontSize:"0.8125rem", fontWeight:600, color:"#108548" }}>Margin Protected</span>
              </div>
            </div>

            <button onClick={reset}
              style={{ padding:"0.875rem", borderRadius:"0.875rem", border:"none", background:"linear-gradient(135deg,#6b4226,#b57a55)", color:"white", fontWeight:700, fontSize:"0.9375rem", cursor:"pointer" }}>
              Start New Negotiation
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }
      `}</style>
    </div>
  );
}
