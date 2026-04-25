"use client";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import CTASection from "@/components/marketing/CTASection";
import { motion } from "framer-motion";
import { LuMic as Mic, LuZap as Zap, LuGlobe as Globe, LuShieldCheck as Shield } from 'react-icons/lu';

export default function FeaturesPage() {
  return (
    <main style={{ backgroundColor: '#ffffff' }}>
      {/* Hero Header */}
      <section style={{ paddingTop: '10rem', paddingBottom: '5rem', borderBottom: '1px solid var(--color-divider)' }}>
        <div className="container">
          <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              style={{ color: 'var(--color-brand-600)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.875rem' }}
            >
              Enterprise Capabilities
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-brand-800)', marginTop: '1rem', lineHeight: 1.1 }}
            >
              Everything you need to <span style={{ color: '#4285F4' }}>digitize your godown.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontSize: '1.25rem', color: 'var(--color-muted)', marginTop: '1.5rem', lineHeight: 1.6 }}
            >
              Stash combines Gemini AI with enterprise supply chain logic to create a platform that requires zero training.
            </motion.p>
          </div>
        </div>
      </section>

      {/* High-Fidelity Feature Grid */}
      <section style={{ padding: '8rem 0' }}>
        <div className="container">
          <div className="grid-3" style={{ gap: '2rem' }}>
             {[
               { icon: <Mic />, title: "Multilingual Voice", desc: "Speak in Hindi, English, or Hinglish. Our AI understands dialect and context natively." },
               { icon: <Zap />, title: "Instant Manifests", desc: "Just say what arrived. Stash generates digital manifests and inventory logs instantly." },
               { icon: <Globe />, title: "Cloud Scale", desc: "Manage 1 or 1,000 warehouses from a single dashboard with real-time sync." },
               { icon: <Shield />, title: "Zero Literacy Barrier", desc: "Designed for operators who have never used a smartphone. If they can call, they can use Stash." },
               { icon: <Mic />, title: "Automated Reorders", desc: "AI predicts stockouts and calls suppliers automatically to negotiate best prices." },
               { icon: <Zap />, title: "Real-time Tracking", desc: "Every shipment is tracked via voice status updates from drivers on the road." }
             ].map((f, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="dashboard-card" 
                 style={{ padding: '2.5rem', border: '1px solid var(--color-divider)', boxShadow: 'var(--shadow-premium)' }}
               >
                  <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-brand-50)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-brand-600)', marginBottom: '1.5rem' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-brand-800)', marginBottom: '1rem' }}>{f.title}</h3>
                  <p style={{ color: 'var(--color-muted)', lineHeight: 1.6 }}>{f.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      <FeaturesGrid />
      <CTASection />
    </main>
  );
}
